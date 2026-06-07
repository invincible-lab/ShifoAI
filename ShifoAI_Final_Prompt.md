# ShifoAI — Telegram Bot + Mini App | Claude Code Prompt
# BMI (Bitiruv Malakaviy Ishi) arxitekturasiga to'liq mos

## Loyiha haqida
ShifoAI — qandli diabet bemorlarini sun'iy intellekt yordamida qo'llab-quvvatlovchi o'zbek tilida ishlovchi Telegram Bot + Mini App (TWA) tizimi. Google Gemini API asosida ishlaydi.

**MUHIM:** Bu loyiha BMI (bitiruv malakaviy ishi) hujjatidagi arxitekturaga to'liq mos bo'lishi kerak. Quyidagi elementlar BMI dan olingan va o'zgartirilmasligi kerak:
- Uch qatlamli arxitektura (Presentation, Business Logic, Data)
- 6 ta sinf (User, MedicalProfile, ChatMessage, ChatEngine, KnowledgeBase, GlucoseReading)
- 4 ta jadval (users, medical_profiles, chat_messages, glucose_readings)
- 5 ta komponent (Frontend, API Server, Chat Engine, RAG Engine, Database Manager)
- 6 bosqichli javob generatsiya jarayoni
- System prompt matni

---

## Arxitektura (BMI 3.1-jadval asosida)

```
Uch qatlamli (Three-Tier) Arxitektura:

┌──────────────────────────────────────────────────────┐
│  TAQDIMOT QATLAMI (Presentation Layer)               │
│                                                       │
│  ┌─────────────────┐    ┌──────────────────────────┐ │
│  │ Telegram Bot     │    │ Mini App (React + Vite)  │ │
│  │ • /start, /help  │    │ • ChatPage.jsx           │ │
│  │ • /register      │    │ • GlucosePage.jsx        │ │
│  │ • /glucose       │    │ • ProfilePage.jsx        │ │
│  │ • Matn → AI javob│    │ • FoodPage.jsx           │ │
│  └────────┬────────┘    └───────────┬──────────────┘ │
│           │   REST API (JSON)       │                 │
└───────────┼─────────────────────────┼─────────────────┘
            │                         │
┌───────────┼─────────────────────────┼─────────────────┐
│  BIZNES-LOGIKA QATLAMI (Business Logic Layer)         │
│           │                         │                  │
│  ┌────────▼─────────────────────────▼────────────┐    │
│  │          API Server (FastAPI) — main.py        │    │
│  │  POST /api/chat    POST /api/register          │    │
│  │  POST /api/login   GET  /api/history           │    │
│  │  POST /api/glucose GET  /api/profile           │    │
│  └──────┬──────────────┬──────────────┬──────────┘    │
│         │              │              │                 │
│  ┌──────▼─────┐ ┌──────▼─────┐ ┌─────▼────────────┐  │
│  │Chat Engine │ │ RAG Engine │ │Database Manager   │  │
│  │chat_engine │ │rag_engine  │ │database.py        │  │
│  │  .py       │ │  .py       │ │                   │  │
│  │Gemini API  │ │ChromaDB    │ │SQLite CRUD        │  │
│  └────────────┘ └────────────┘ └───────────────────┘  │
└───────────────────────────────────────────────────────┘
            │              │              │
┌───────────┼──────────────┼──────────────┼─────────────┐
│  MA'LUMOTLAR QATLAMI (Data Layer)                      │
│           │              │              │               │
│  ┌────────▼──┐   ┌───────▼───┐   ┌─────▼──────────┐  │
│  │Google     │   │ ChromaDB  │   │ SQLite          │  │
│  │Gemini API │   │ (vektor   │   │ • users         │  │
│  │(tashqi)   │   │  bazasi)  │   │ • medical_prof  │  │
│  │           │   │           │   │ • chat_messages  │  │
│  │           │   │           │   │ • glucose_read   │  │
│  └───────────┘   └───────────┘   └─────────────────┘  │
└────────────────────────────────────────────────────────┘
```

---

## Loyiha fayl tuzilmasi

BMI 3.2 bo'limidagi tuzilma asosida, Telegram Bot + Mini App uchun kengaytirilgan:

```
ShifoAI/
│
├── backend/
│   ├── main.py                  # FastAPI server (API Server komponenti)
│   ├── bot.py                   # Telegram bot handlerlari
│   ├── chat_engine.py           # ChatEngine sinfi (BMI: Chat Engine komponenti)
│   ├── database.py              # Database Manager komponenti (4 ta jadval)
│   ├── rag_engine.py            # RAG Engine komponenti (KnowledgeBase sinfi)
│   ├── config.py                # Konfiguratsiya + System Prompt
│   ├── models.py                # Pydantic modellar (API request/response)
│   ├── auth.py                  # Telegram Mini App initData tekshirish
│   ├── requirements.txt
│   ├── .env
│   ├── knowledge_base/
│   │   └── diabetes_info.json   # Tibbiy bilim bazasi (50+ fragment, o'zbek tilida)
│   └── data/
│       └── (shifoai.db — avtomatik yaratiladi)
│
├── frontend/                    # Mini App (Telegram Web App)
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   ├── src/
│   │   ├── main.jsx
│   │   ├── App.jsx              # Router + NavBar
│   │   ├── api.js               # Backend API chaqiruvlari
│   │   ├── telegram.js          # Telegram WebApp SDK yordamchi
│   │   ├── pages/
│   │   │   ├── ChatPage.jsx     # 💬 Asosiy AI chat
│   │   │   ├── GlucosePage.jsx  # 📊 Glyukoza kiritish + grafik
│   │   │   ├── ProfilePage.jsx  # 👤 Profil ko'rish/tahrirlash
│   │   │   ├── FoodPage.jsx     # 🍎 Ovqatlanish tavsiyalari
│   │   │   └── RegisterPage.jsx # Registratsiya formasi
│   │   ├── components/
│   │   │   ├── ChatBubble.jsx   # Chat xabar komponenti
│   │   │   ├── GlucoseChart.jsx # Glyukoza grafigi (recharts)
│   │   │   ├── NavBar.jsx       # Pastki navigatsiya (4 tab)
│   │   │   ├── Loading.jsx      # Yuklanish animatsiyasi
│   │   │   └── AlertBanner.jsx  # Ogohlantirish (gipo/giper)
│   │   └── styles/
│   │       └── global.css       # Telegram tema ranglari (CSS variables)
│   └── public/
│
├── .gitignore
└── README.md
```

---

## BACKEND — BMI arxitekturasiga mos

### config.py
```python
import os
from dotenv import load_dotenv
load_dotenv()

TELEGRAM_BOT_TOKEN = os.getenv("TELEGRAM_BOT_TOKEN")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
WEBAPP_URL = os.getenv("WEBAPP_URL")  # Mini App URL (HTTPS majburiy)
DATABASE_PATH = "data/shifoai.db"
CHROMA_PATH = "data/chroma_db"
KNOWLEDGE_BASE_PATH = "knowledge_base/diabetes_info.json"
```

**System Prompt** (BMI 3.2 bo'limidan aynan ko'chirilgan):
```python
SYSTEM_PROMPT = """
Siz ShifoAI — qandli diabet bo'yicha o'zbek tilida ishlovchi intellektual tibbiy maslahatchi chatbotsiz. Sizning vazifangiz bemorlarni kasalliklari haqida o'zbek tilida ma'lumot berish, ovqatlanish va hayot tarzi bo'yicha tavsiyalar berish va ularni qo'llab-quvvatlash.

CHEKLOVLAR:
Siz shifokor emassiz va shifokor o'rnini bosolmaysiz. Bemorga aniq tashxis qo'ymang va dori tayinlamang. Har doim shifokor bilan maslahatlashishni tavsiya qiling. Favqulodda holatlarda (juda yuqori yoki past shakar, hushdan ketish, ko'rish yo'qolishi) darhol tez tibbiy yordamni chaqirishni tavsiya qiling.

JAVOB FORMATI:
Javoblarni o'zbek tilida, sodda va tushunarli qilib bering. Tibbiy atamalarni ishlatganda ularning ma'nosini tushuntiring. Javoblar 200-300 so'zdan oshmasin. Zarur bo'lganda ro'yxatlar va tavsiyalar shaklida javob bering. Emoji ishlatish mumkin (💊🍎🏃‍♂️⚠️✅).

KONTEKST:
Bemorning tibbiy profilini (diabet turi, yoshi, dori-darmonlari) hisobga olib, shaxsiylashtirilgan javob bering. Agar bilim bazasidan tegishli ma'lumot topilgan bo'lsa, undan foydalaning.
"""
```

### database.py — BMI 3.1 ER diagrammasiga to'liq mos

**4 ta jadval (BMI da aynan shu tuzilma yozilgan):**

```sql
-- users jadvali (BMI: User sinfi)
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    telegram_id INTEGER UNIQUE NOT NULL,
    username TEXT,
    email TEXT,
    password_hash TEXT,
    full_name TEXT,
    age INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- medical_profiles jadvali (BMI: MedicalProfile sinfi, users bilan 1:1)
CREATE TABLE medical_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id),
    diabetes_type TEXT CHECK(diabetes_type IN ('type1','type2','gestational','other')),
    medications TEXT,      -- JSON string: ["metformin", "insulin glargin"]
    allergies TEXT,
    height REAL,           -- sm
    weight REAL,           -- kg
    hba1c_latest REAL,
    diagnosis_date TEXT
);

-- chat_messages jadvali (BMI: ChatMessage sinfi, users bilan 1:N)
CREATE TABLE chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    role TEXT NOT NULL CHECK(role IN ('user','assistant')),
    content TEXT NOT NULL,
    session_id TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- glucose_readings jadvali (BMI: GlucoseReading sinfi, users bilan 1:N)
CREATE TABLE glucose_readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL REFERENCES users(id),
    value REAL NOT NULL,
    unit TEXT DEFAULT 'mmol/L',
    reading_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    meal_context TEXT CHECK(meal_context IN ('fasting','before_meal','after_meal','bedtime'))
);
```

**Funksiyalar (BMI Class diagrammasidagi metodlarga mos):**
```python
# User sinfi metodlari
def init_db()
def get_or_create_user(telegram_id, username, full_name)  # register()
def get_user_by_id(user_id)                                # login() o'rniga
def update_user(user_id, **kwargs)                         # update_profile()

# MedicalProfile sinfi metodlari
def update_medical_profile(user_id, **kwargs)              # update_medications()
def get_medical_profile(user_id)                           # get_medical_summary()
def calculate_bmi(user_id)                                 # calculate_bmi()

# ChatMessage sinfi metodlari
def save_message(user_id, role, content, session_id=None)  # save()
def get_recent_messages(user_id, limit=10)                 # get_session_messages()
def get_chat_history(user_id, limit=50)                    # get_history()

# GlucoseReading sinfi metodlari
def save_glucose(user_id, value, meal_context)             # save()
def get_glucose_readings(user_id, days=30)                 # get_trend() uchun
def get_glucose_stats(user_id, days=7)                     # get_weekly_average(), is_in_range()
```

### chat_engine.py — BMI: ChatEngine sinfi + 6 bosqichli jarayon

BMI 3.1 Sequence diagrammasidagi 6 bosqich:
```python
import google.generativeai as genai
from config import GEMINI_API_KEY, SYSTEM_PROMPT
from database import get_medical_profile, get_recent_messages, save_message
from rag_engine import RAGEngine

class ChatEngine:
    """BMI Class diagrammasi: ChatEngine sinfi"""
    
    def __init__(self):
        # Atributlar: model_name, system_prompt, max_tokens, temperature
        genai.configure(api_key=GEMINI_API_KEY)
        self.model = genai.GenerativeModel('gemini-pro')
        self.system_prompt = SYSTEM_PROMPT
        self.max_tokens = 1024
        self.temperature = 0.7
        self.rag = RAGEngine()
    
    def build_context(self, user_id):
        """BMI metod: build_context(user_id)"""
        profile = get_medical_profile(user_id)
        history = get_recent_messages(user_id, limit=10)
        return profile, history
    
    def search_knowledge_base(self, query):
        """BMI metod: search_knowledge_base(query)"""
        return self.rag.search(query, top_k=3)
    
    def validate_response(self, response):
        """BMI metod: validate_response(response)
        Tibbiy xavfsizlik tekshiruvi"""
        if not response:
            return "Kechirasiz, javob generatsiya qilishda xatolik yuz berdi."
        # Har doim eslatma qo'shish
        if "shifokor" not in response.lower():
            response += "\n\n⚠️ Eslatma: Bu ma'lumot faqat umumiy xarakterga ega. Aniq maslahat uchun shifokoringizga murojaat qiling."
        return response
    
    async def generate_response(self, user_id, user_message):
        """
        BMI metod: generate_response(user_message, context)
        
        BMI Sequence diagrammasi — 6 bosqich:
        1-bosqich: Savolni qabul qilish ✓ (user_message parametri)
        2-bosqich: Kontekst shakllantirish
        3-bosqich: Bilim bazasidan qidirish (RAG)
        4-bosqich: Prompt shakllantirish
        5-bosqich: AI model chaqiruvi (Gemini API)
        6-bosqich: Javobni tekshirish va qaytarish
        """
        # Bosqich 1: Savolni saqlash
        save_message(user_id, "user", user_message)
        
        # Bosqich 2: Kontekst shakllantirish
        profile, history = self.build_context(user_id)
        
        profile_text = "Ma'lumot yo'q"
        if profile:
            profile_text = f"Diabet turi: {profile.get('diabetes_type','noaniq')}, Yosh: {profile.get('age','noaniq')}, Dorilar: {profile.get('medications','noaniq')}, HbA1c: {profile.get('hba1c_latest','noaniq')}"
        
        history_text = ""
        for msg in history:
            role = "Bemor" if msg['role'] == 'user' else "ShifoAI"
            history_text += f"{role}: {msg['content']}\n"
        
        # Bosqich 3: RAG — bilim bazasidan qidirish
        rag_context = self.search_knowledge_base(user_message)
        
        # Bosqich 4: Prompt shakllantirish
        full_prompt = f"""{self.system_prompt}

BEMOR PROFILI:
{profile_text}

BILIM BAZASIDAN TOPILGAN MA'LUMOT:
{rag_context}

MULOQOT TARIXI:
{history_text}

BEMOR SAVOLI: {user_message}

JAVOB:"""
        
        # Bosqich 5: AI model chaqiruvi
        try:
            response = self.model.generate_content(full_prompt)
            answer = response.text
        except Exception as e:
            answer = "Kechirasiz, texnik xatolik yuz berdi. Iltimos, qayta urinib ko'ring."
        
        # Bosqich 6: Javobni tekshirish va qaytarish
        answer = self.validate_response(answer)
        save_message(user_id, "assistant", answer)
        
        return answer
```

### rag_engine.py — BMI: KnowledgeBase sinfi + RAG Engine komponenti
```python
import chromadb
import json
from config import CHROMA_PATH, KNOWLEDGE_BASE_PATH

class RAGEngine:
    """BMI Class diagrammasi: KnowledgeBase sinfi"""
    
    def __init__(self):
        # Atributlar: db_path, collection_name, embedding_model
        self.client = chromadb.PersistentClient(path=CHROMA_PATH)
        self.collection = self.client.get_or_create_collection("diabetes_knowledge")
    
    def add_documents(self, json_path=None):
        """BMI metod: add_documents(docs)"""
        path = json_path or KNOWLEDGE_BASE_PATH
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        documents, ids, metadatas = [], [], []
        for i, item in enumerate(data):
            documents.append(item["content"])
            ids.append(f"doc_{i}")
            metadatas.append({"category": item["category"], "title": item["title"]})
        self.collection.upsert(documents=documents, ids=ids, metadatas=metadatas)
        print(f"✅ {len(documents)} ta hujjat yuklandi")
    
    def search(self, query, top_k=3):
        """BMI metod: search(query, top_k)"""
        results = self.collection.query(query_texts=[query], n_results=top_k)
        if results and results['documents']:
            return "\n\n".join(results['documents'][0])
        return ""
    
    def update_document(self, doc_id, content):
        """BMI metod: update_document(doc_id, content)"""
        self.collection.update(ids=[doc_id], documents=[content])
    
    def delete_document(self, doc_id):
        """BMI metod: delete_document(doc_id)"""
        self.collection.delete(ids=[doc_id])
```

### auth.py — Telegram Mini App autentifikatsiya
```python
import hmac, hashlib, json
from urllib.parse import parse_qs
from config import TELEGRAM_BOT_TOKEN

def validate_telegram_webapp(init_data: str) -> dict:
    """Telegram initData ni HMAC-SHA256 bilan tekshirish"""
    parsed = parse_qs(init_data)
    received_hash = parsed.get('hash', [''])[0]
    data_pairs = sorted([f"{k}={v[0]}" for k, v in parsed.items() if k != 'hash'])
    data_check_string = "\n".join(data_pairs)
    secret_key = hmac.new(b"WebAppData", TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
    if calculated_hash != received_hash:
        raise ValueError("Invalid Telegram Web App data")
    return json.loads(parsed.get('user', ['{}'])[0])
```

### main.py — BMI: API Server komponenti (FastAPI)

BMI dagi endpointlar:
```
POST /api/chat       — chatbot bilan muloqot
POST /api/register   — foydalanuvchini ro'yxatga olish
POST /api/login      — tizimga kirish (Telegram ID orqali avtomatik)
GET  /api/history    — muloqot tarixini olish
POST /api/glucose    — glyukoza ko'rsatkichini kiritish
GET  /api/glucose    — glyukoza ko'rsatkichlari ro'yxati
GET  /api/profile    — profil ma'lumotlarini olish
POST /webhook        — Telegram bot webhook
```

### bot.py — Telegram Bot handlerlari

/start buyrug'ida Mini App tugmasini ko'rsatish:
```python
from telegram import InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo

keyboard = InlineKeyboardMarkup([
    [InlineKeyboardButton("📱 Ilovani ochish", web_app=WebAppInfo(url=WEBAPP_URL))],
    [InlineKeyboardButton("ℹ️ Yordam", callback_data="help")]
])
```

Bot buyruqlari:
- `/start` — salom + Mini App tugmasi
- `/help` — buyruqlar ro'yxati
- `/register` — ConversationHandler (yosh → diabet turi → dorilar → vazn → bo'y)
- `/glucose` — ConversationHandler (qiymat → vaqt konteksti → saqlash + ogohlantirish)
- `/profile` — profil ma'lumotlari
- `/stats` — glyukoza statistikasi
- Oddiy matn → ChatEngine.generate_response() → Gemini javob

### knowledge_base/diabetes_info.json

50+ fragment, har biri:
```json
[
  {"title": "...", "category": "umumiy|ovqatlanish|dorilar|jismoniy|favqulodda|asoratlar|psixologik", "content": "..."}
]
```

---

## FRONTEND — Mini App (React)

### telegram.js — Telegram WebApp SDK
```javascript
const tg = window.Telegram?.WebApp;
export const initTelegram = () => { tg?.ready(); tg?.expand(); };
export const getInitData = () => tg?.initData || "";
export const getUser = () => tg?.initDataUnsafe?.user || null;
export const haptic = () => tg?.HapticFeedback?.impactOccurred("medium");
```

### api.js — Backend bilan aloqa
Har bir so'rovda `X-Telegram-Init-Data` header yuboriladi (auth uchun).

### Sahifalar:
- **ChatPage.jsx** — AI chat (xabarlar tarixi + yangi xabar yuborish)
- **GlucosePage.jsx** — glyukoza kiritish + recharts grafik (30 kunlik trend, me'yor zonalari)
- **ProfilePage.jsx** — tibbiy profil (diabet turi, dorilar, BMI, HbA1c)
- **FoodPage.jsx** — ovqatlanish tavsiyalari (ruxsat/taqiq kartalar + AI maslahat)
- **NavBar.jsx** — 4 ta tab: 💬 Chat | 📊 Glyukoza | 🍎 Ovqat | 👤 Profil

### global.css — Telegram tema ranglari
```css
:root {
  --bg: var(--tg-theme-bg-color, #ffffff);
  --text: var(--tg-theme-text-color, #000000);
  --button: var(--tg-theme-button-color, #2678b6);
  --secondary-bg: var(--tg-theme-secondary-bg-color, #f0f0f0);
}
```

---

## requirements.txt (backend)
```
fastapi==0.109.0
uvicorn==0.27.0
python-telegram-bot==20.7
google-generativeai==0.3.2
chromadb==0.4.22
python-dotenv==1.0.0
pydantic==2.5.0
```

## .env
```
TELEGRAM_BOT_TOKEN=your_token_from_botfather
GEMINI_API_KEY=your_google_ai_key
WEBAPP_URL=https://your-domain.com
```

## Yozish tartibi
1. backend/config.py
2. backend/database.py (4 ta jadval + barcha funksiyalar)
3. backend/rag_engine.py (KnowledgeBase sinfi)
4. backend/chat_engine.py (ChatEngine sinfi + 6 bosqich)
5. backend/auth.py
6. backend/models.py
7. backend/bot.py (Telegram handlerlari + Mini App tugmasi)
8. backend/main.py (FastAPI + webhook)
9. backend/knowledge_base/diabetes_info.json (50+ fragment)
10. frontend/ (React Mini App — barcha sahifalar)
11. README.md

## BotFather sozlash
```
/setmenubutton → Bot tanlash → URL: https://your-domain.com → Matn: 📱 Ilovani ochish
```
