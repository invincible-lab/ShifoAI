import sqlite3
import json
import os
from datetime import datetime, timedelta
from config import DATABASE_PATH, DATABASE_URL

IS_POSTGRES = bool(DATABASE_URL and DATABASE_URL.startswith("postgres"))

if IS_POSTGRES:
    import psycopg2
    from psycopg2.extras import DictCursor

def get_connection():
    if IS_POSTGRES:
        conn = psycopg2.connect(DATABASE_URL)
        return conn
    else:
        os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
        conn = sqlite3.connect(DATABASE_PATH)
        conn.row_factory = sqlite3.Row
        conn.execute("PRAGMA foreign_keys = ON")
        return conn

def execute_query(conn, query, params=(), commit=False):
    if IS_POSTGRES:
        query = query.replace("?", "%s")
        cursor = conn.cursor(cursor_factory=DictCursor)
    else:
        cursor = conn.cursor()
    cursor.execute(query, params)
    if commit:
        conn.commit()
    return cursor

def execute_script(conn, script):
    if IS_POSTGRES:
        script = script.replace("INTEGER PRIMARY KEY AUTOINCREMENT", "SERIAL PRIMARY KEY")
        cursor = conn.cursor()
        cursor.execute(script)
        conn.commit()
    else:
        cursor = conn.cursor()
        cursor.executescript(script)
        conn.commit()

def init_db():
    """Ma'lumotlar bazasini ishga tushirish — 4 ta jadval yaratish"""
    conn = get_connection()
    execute_script(conn, """
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            telegram_id BIGINT UNIQUE NOT NULL,
            username TEXT,
            email TEXT,
            password_hash TEXT,
            full_name TEXT,
            age INTEGER,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS medical_profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
            diabetes_type TEXT CHECK(diabetes_type IN ('type1','type2','gestational','other')),
            medications TEXT,
            allergies TEXT,
            height REAL,
            weight REAL,
            hba1c_latest REAL,
            diagnosis_date TEXT
        );

        CREATE TABLE IF NOT EXISTS chat_messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            role TEXT NOT NULL CHECK(role IN ('user','assistant')),
            content TEXT NOT NULL,
            session_id TEXT,
            timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS glucose_readings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL REFERENCES users(id),
            value REAL NOT NULL,
            unit TEXT DEFAULT 'mmol/L',
            reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            meal_context TEXT CHECK(meal_context IN ('fasting','before_meal','after_meal','bedtime'))
        );
    """)
    conn.close()
    print("Muvaffaqiyatli: Ma'lumotlar bazasi tayyor")

# --- User sinfi metodlari ---

def get_or_create_user(telegram_id, username=None, full_name=None):
    """register() — foydalanuvchini topish yoki yaratish"""
    conn = get_connection()
    cursor = execute_query(conn, "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
    user = cursor.fetchone()
    if not user:
        execute_query(
            conn,
            "INSERT INTO users (telegram_id, username, full_name) VALUES (?, ?, ?)",
            (telegram_id, username, full_name),
            commit=True
        )
        cursor = execute_query(conn, "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
        user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_id(user_id):
    """login() o'rniga — ID bo'yicha topish"""
    conn = get_connection()
    cursor = execute_query(conn, "SELECT * FROM users WHERE id = ?", (user_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def get_user_by_telegram_id(telegram_id):
    conn = get_connection()
    cursor = execute_query(conn, "SELECT * FROM users WHERE telegram_id = ?", (telegram_id,))
    user = cursor.fetchone()
    conn.close()
    return dict(user) if user else None

def update_user(user_id, **kwargs):
    """update_profile()"""
    if not kwargs:
        return
    conn = get_connection()
    fields = ", ".join(f"{k} = ?" for k in kwargs)
    values = tuple(list(kwargs.values()) + [user_id])
    execute_query(conn, f"UPDATE users SET {fields} WHERE id = ?", values, commit=True)
    conn.close()

# --- MedicalProfile sinfi metodlari ---

def update_medical_profile(user_id, **kwargs):
    """update_medications()"""
    conn = get_connection()
    cursor = execute_query(conn, "SELECT id FROM medical_profiles WHERE user_id = ?", (user_id,))
    existing = cursor.fetchone()
    if 'medications' in kwargs and isinstance(kwargs['medications'], list):
        kwargs['medications'] = json.dumps(kwargs['medications'], ensure_ascii=False)
    if existing:
        fields = ", ".join(f"{k} = ?" for k in kwargs)
        values = tuple(list(kwargs.values()) + [user_id])
        execute_query(conn, f"UPDATE medical_profiles SET {fields} WHERE user_id = ?", values, commit=True)
    else:
        kwargs['user_id'] = user_id
        fields = ", ".join(kwargs.keys())
        placeholders = ", ".join("?" for _ in kwargs)
        values = tuple(list(kwargs.values()))
        execute_query(conn, f"INSERT INTO medical_profiles ({fields}) VALUES ({placeholders})", values, commit=True)
    conn.close()

def get_medical_profile(user_id):
    """get_medical_summary()"""
    conn = get_connection()
    cursor = execute_query(conn, """
        SELECT mp.*, u.age, u.full_name
        FROM medical_profiles mp
        JOIN users u ON u.id = mp.user_id
        WHERE mp.user_id = ?
    """, (user_id,))
    profile = cursor.fetchone()
    conn.close()
    if not profile:
        return None
    profile = dict(profile)
    if profile.get('medications') and isinstance(profile['medications'], str):
        try:
            profile['medications'] = json.loads(profile['medications'])
        except:
            pass
    return profile

def calculate_bmi(user_id):
    """calculate_bmi()"""
    profile = get_medical_profile(user_id)
    if not profile or not profile.get('height') or not profile.get('weight'):
        return None
    height_m = profile['height'] / 100
    bmi = profile['weight'] / (height_m ** 2)
    bmi_val = round(bmi, 1)
    if bmi_val < 18.5:
        category = "Oz vazn"
    elif bmi_val < 25:
        category = "Me'yor"
    elif bmi_val < 30:
        category = "Ortiqcha vazn"
    else:
        category = "Semizlik"
    return {"bmi": bmi_val, "category": category}

# --- ChatMessage sinfi metodlari ---

def save_message(user_id, role, content, session_id=None):
    """save()"""
    conn = get_connection()
    execute_query(
        conn,
        "INSERT INTO chat_messages (user_id, role, content, session_id) VALUES (?, ?, ?, ?)",
        (user_id, role, content, session_id),
        commit=True
    )
    conn.close()

def get_recent_messages(user_id, limit=10):
    """get_session_messages()"""
    conn = get_connection()
    cursor = execute_query(conn, "SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", (user_id, limit))
    messages = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return list(reversed(messages))

def get_chat_history(user_id, limit=50):
    """get_history()"""
    conn = get_connection()
    cursor = execute_query(conn, "SELECT * FROM chat_messages WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", (user_id, limit))
    messages = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return list(reversed(messages))

# --- GlucoseReading sinfi metodlari ---

def save_glucose(user_id, value, meal_context=None, unit='mmol/L'):
    """save()"""
    conn = get_connection()
    execute_query(
        conn,
        "INSERT INTO glucose_readings (user_id, value, unit, meal_context) VALUES (?, ?, ?, ?)",
        (user_id, value, unit, meal_context),
        commit=True
    )
    conn.close()

def get_glucose_readings(user_id, days=30):
    """get_trend() uchun"""
    conn = get_connection()
    since = (datetime.now() - timedelta(days=days)).isoformat()
    cursor = execute_query(conn, "SELECT * FROM glucose_readings WHERE user_id = ? AND reading_time >= ? ORDER BY reading_time ASC", (user_id, since))
    readings = [dict(r) for r in cursor.fetchall()]
    conn.close()
    return readings

def get_glucose_stats(user_id, days=7):
    """get_weekly_average(), is_in_range()"""
    readings = get_glucose_readings(user_id, days=days)
    if not readings:
        return {"count": 0, "average": None, "min": None, "max": None, "in_range_percent": None}
    values = [r['value'] for r in readings]
    avg = round(sum(values) / len(values), 1)
    in_range = sum(1 for v in values if 4.0 <= v <= 10.0)
    return {
        "count": len(values),
        "average": avg,
        "min": round(min(values), 1),
        "max": round(max(values), 1),
        "in_range_percent": round(in_range / len(values) * 100, 1)
    }