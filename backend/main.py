import os
import sys
from fastapi import FastAPI, HTTPException, Header, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from typing import Optional
import asyncio

sys.path.insert(0, os.path.dirname(__file__))

from config import TELEGRAM_BOT_TOKEN
from database import (
    init_db, get_or_create_user, get_user_by_telegram_id,
    update_medical_profile, get_medical_profile, get_chat_history,
    save_glucose, get_glucose_readings, get_glucose_stats, calculate_bmi,
    create_reminder, get_reminders, toggle_reminder, delete_reminder
)
from models import (
    ChatRequest, ChatResponse, GlucoseRequest,
    MedicalProfileRequest, RegisterRequest,
    ReminderRequest, ReminderToggleRequest
)
from auth import get_user_from_init_data
from chat_engine import ChatEngine
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from datetime import datetime

scheduler = AsyncIOScheduler()

app = FastAPI(title="ShifoAI API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

chat_engine = ChatEngine()

from bot import get_bot_application

bot_app = get_bot_application()

@app.on_event("startup")
async def startup():
    init_db()
    print("ShifoAI API ishga tushdi")
    await bot_app.initialize()
    await bot_app.start()
    await bot_app.updater.start_polling(drop_pending_updates=True)
    print("Telegram Bot orqa fonda ishga tushdi")
    
    from database import get_all_active_reminders
    async def check_and_send_reminders():
        now = datetime.now()
        current_time_str = now.strftime("%H:%M")
        day_key = now.strftime("%a").lower()[:3] # e.g. 'mon', 'tue'
        
        reminders = get_all_active_reminders()
        for r in reminders:
            if r['time'] == current_time_str:
                days = r.get('days_of_week')
                if not days or day_key in days:
                    try:
                        await bot_app.bot.send_message(
                            chat_id=r['telegram_id'],
                            text=f"🔔 *Eslatma!* Vaqti keldi:\n\n👉 {r['title']}",
                            parse_mode="Markdown"
                        )
                    except Exception as e:
                        print(f"Eslatma yuborishda xatolik: {e}")
                        
    scheduler.add_job(check_and_send_reminders, 'cron', minute='*')
    scheduler.start()
    print("APScheduler ishga tushdi (Har daqiqada tekshiriladi)")

@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown()
    await bot_app.updater.stop()
    await bot_app.stop()
    await bot_app.shutdown()
    print("Telegram Bot to'xtatildi")

def get_current_user(x_telegram_init_data: Optional[str] = None):
    if not x_telegram_init_data:
        raise HTTPException(status_code=401, detail="Telegram init data kerak")

    tg_user = get_user_from_init_data(x_telegram_init_data)
    if not tg_user or not tg_user.get('id'):
        raise HTTPException(status_code=401, detail="Noto'g'ri auth ma'lumotlari")

    db_user = get_or_create_user(
        telegram_id=tg_user['id'],
        username=tg_user.get('username'),
        full_name=f"{tg_user.get('first_name','')} {tg_user.get('last_name','')}".strip()
    )
    return db_user

@app.post("/api/register")
async def register(
    data: RegisterRequest,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    if data.full_name or data.age:
        from database import update_user
        kwargs = {}
        if data.full_name:
            kwargs['full_name'] = data.full_name
        if data.age:
            kwargs['age'] = data.age
        update_user(user['id'], **kwargs)
    return {"success": True, "user_id": user['id']}

@app.post("/api/login")
async def login(x_telegram_init_data: Optional[str] = Header(None)):
    user = get_current_user(x_telegram_init_data)
    return {"success": True, "user_id": user['id'], "user": user}

@app.post("/api/chat")
async def chat(
    request: ChatRequest,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    reply = await chat_engine.generate_response(user['id'], request.message)
    return ChatResponse(reply=reply, session_id=request.session_id)

@app.get("/api/history")
async def history(
    limit: int = 50,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    messages = get_chat_history(user['id'], limit=limit)
    return {"messages": messages}

@app.post("/api/glucose")
async def add_glucose(
    data: GlucoseRequest,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    save_glucose(user['id'], data.value, data.meal_context, data.unit)

    warning = None
    if data.value < 3.9:
        warning = "GIPOGLIKEMIYA! Darhol shirinlik yeyin va shifokorga murojaat qiling!"
    elif data.value > 13.9:
        warning = "GIPERGLIKEMIYA! Shifokoringiz bilan bog'laning!"

    return {"success": True, "warning": warning}

@app.get("/api/glucose")
async def get_glucose(
    days: int = 30,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    readings = get_glucose_readings(user['id'], days=days)
    stats = get_glucose_stats(user['id'], days=7)
    return {"readings": readings, "stats": stats}

@app.get("/api/profile")
async def get_profile(x_telegram_init_data: Optional[str] = Header(None)):
    user = get_current_user(x_telegram_init_data)
    profile = get_medical_profile(user['id'])
    bmi = calculate_bmi(user['id'])
    return {
        "user": user,
        "medical_profile": profile,
        "bmi": bmi
    }

@app.put("/api/profile")
async def update_profile(
    data: MedicalProfileRequest,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    kwargs = data.model_dump(exclude_none=True)
    if kwargs:
        update_medical_profile(user['id'], **kwargs)
    return {"success": True}

@app.get("/api/reminders")
async def list_reminders(x_telegram_init_data: Optional[str] = Header(None)):
    user = get_current_user(x_telegram_init_data)
    return {"reminders": get_reminders(user['id'])}

@app.post("/api/reminders")
async def add_reminder(
    data: ReminderRequest,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    create_reminder(user['id'], data.kind, data.title, data.time, data.days_of_week)
    return {"success": True}

@app.put("/api/reminders/{reminder_id}")
async def update_reminder(
    reminder_id: int,
    data: ReminderToggleRequest,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    toggle_reminder(user['id'], reminder_id, data.active)
    return {"success": True}

@app.delete("/api/reminders/{reminder_id}")
async def remove_reminder(
    reminder_id: int,
    x_telegram_init_data: Optional[str] = Header(None)
):
    user = get_current_user(x_telegram_init_data)
    delete_reminder(user['id'], reminder_id)
    return {"success": True}

@app.get("/health")
async def health():
    return {"status": "ok", "service": "ShifoAI API"}

# --- Frontend static files ---
FRONTEND_DIST = os.path.join(os.path.dirname(__file__), '..', 'frontend', 'dist')

if os.path.exists(FRONTEND_DIST):
    app.mount("/assets", StaticFiles(directory=os.path.join(FRONTEND_DIST, "assets")), name="assets")

    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        index = os.path.join(FRONTEND_DIST, "index.html")
        return FileResponse(index)
else:
    @app.get("/")
    async def root():
        return {"message": "ShifoAI API ishlayapti. Frontend build qilinmagan."}

if __name__ == '__main__':
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
