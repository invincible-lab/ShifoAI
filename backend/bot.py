import logging
import asyncio
from telegram import (
    Update, InlineKeyboardButton, InlineKeyboardMarkup, WebAppInfo, ReplyKeyboardMarkup, KeyboardButton
)
from telegram.ext import (
    Application, CommandHandler, MessageHandler, ConversationHandler,
    CallbackQueryHandler, filters, ContextTypes
)
from config import TELEGRAM_BOT_TOKEN, WEBAPP_URL
from database import (
    init_db, get_or_create_user, get_medical_profile,
    update_medical_profile, update_user, save_glucose, get_glucose_stats, calculate_bmi
)
from chat_engine import ChatEngine

logging.basicConfig(format='%(asctime)s - %(name)s - %(levelname)s - %(message)s', level=logging.INFO)
logger = logging.getLogger(__name__)

chat_engine = ChatEngine()

# ConversationHandler states
AGE, DIABETES_TYPE, MEDICATIONS, WEIGHT, HEIGHT = range(5)
GLUCOSE_VALUE, GLUCOSE_CONTEXT = range(2)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    get_or_create_user(
        telegram_id=user.id,
        username=user.username,
        full_name=user.full_name
    )

    # Mini App ochish tugmasi (ReplyKeyboard)
    webapp_keyboard = ReplyKeyboardMarkup(
        [[KeyboardButton("🏥 ShifoAI Mini App", web_app=WebAppInfo(url=WEBAPP_URL))]],
        resize_keyboard=True
    )

    await update.message.reply_text(
        f"👋 Salom, {user.first_name}!\n\n"
        "🏥 *ShifoAI* — qandli diabet bo'yicha intellektual maslahatchi\n\n"
        "Men sizga quyidagilarda yordam bera olaman:\n"
        "• 💬 Diabet haqida savollaringizga javob\n"
        "• 📊 Glyukoza darajasini kuzatish\n"
        "• 🍎 Ovqatlanish bo'yicha maslahatlar\n"
        "• 💊 Dori-darmonlar haqida ma'lumot\n\n"
        "⬇️ Quyidagi tugma orqali ilovani oching yoki shunchaki savolingizni yozing!\n\n"
        "⚠️ *Eslatma:* Men shifokor emasman. Muhim tibbiy masalalar uchun mutaxassisga murojaat qiling.",
        parse_mode='Markdown',
        reply_markup=webapp_keyboard
    )

async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📋 *Buyruqlar ro'yxati:*\n\n"
        "/start — Botni ishga tushirish\n"
        "/register — Tibbiy profilni to'ldirish\n"
        "/glucose — Glyukoza ko'rsatkichini kiritish\n"
        "/profile — Profilingizni ko'rish\n"
        "/stats — Glyukoza statistikasi\n"
        "/help — Yordam\n\n"
        "💬 Yoki shunchaki savolingizni yozing!",
        parse_mode='Markdown'
    )

# --- /register ConversationHandler ---

async def register_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📝 *Tibbiy profilni to'ldirish*\n\nYoshingizni kiriting (masalan: 35):",
        parse_mode='Markdown'
    )
    return AGE

async def register_age(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        age = int(update.message.text.strip())
        if not 1 <= age <= 120:
            raise ValueError
        context.user_data['age'] = age
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri yosh. Iltimos, raqam kiriting (1-120):")
        return AGE

    keyboard = ReplyKeyboardMarkup([
        ["1-tur", "2-tur"],
        ["Gestatsion", "Boshqa"]
    ], one_time_keyboard=True, resize_keyboard=True)

    await update.message.reply_text(
        "Diabet turini tanlang:",
        reply_markup=keyboard
    )
    return DIABETES_TYPE

async def register_diabetes_type(update: Update, context: ContextTypes.DEFAULT_TYPE):
    type_map = {"1-tur": "type1", "2-tur": "type2", "gestatsion": "gestational", "boshqa": "other"}
    dtype = type_map.get(update.message.text.strip().lower(), "other")
    context.user_data['diabetes_type'] = dtype

    await update.message.reply_text(
        "💊 Qabul qilayotgan dorilaringizni kiriting (vergul bilan ajrating).\n"
        "Agar yo'q bo'lsa: *yo'q* deb yozing:",
        parse_mode='Markdown'
    )
    return MEDICATIONS

async def register_medications(update: Update, context: ContextTypes.DEFAULT_TYPE):
    text = update.message.text.strip()
    if text.lower() == "yo'q" or text.lower() == "yoq":
        context.user_data['medications'] = []
    else:
        context.user_data['medications'] = [m.strip() for m in text.split(',')]

    await update.message.reply_text("⚖️ Vaznizni kg da kiriting (masalan: 75):")
    return WEIGHT

async def register_weight(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        weight = float(update.message.text.strip())
        context.user_data['weight'] = weight
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri qiymat. Raqam kiriting:")
        return WEIGHT

    await update.message.reply_text("📏 Bo'yingizni sm da kiriting (masalan: 170):")
    return HEIGHT

async def register_height(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from telegram import ReplyKeyboardRemove
    try:
        height = float(update.message.text.strip())
        context.user_data['height'] = height
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri qiymat. Raqam kiriting:")
        return HEIGHT

    user = update.effective_user
    db_user = get_or_create_user(user.id, user.username, user.full_name)
    user_id = db_user['id']

    update_user(user_id, age=context.user_data['age'])
    update_medical_profile(
        user_id,
        diabetes_type=context.user_data['diabetes_type'],
        medications=context.user_data['medications'],
        weight=context.user_data['weight'],
        height=context.user_data['height']
    )

    bmi = calculate_bmi(user_id)
    bmi_text = f"\n📊 BMI: {bmi['bmi']} ({bmi['category']})" if bmi else ""

    await update.message.reply_text(
        f"✅ *Profil muvaffaqiyatli saqlandi!*{bmi_text}\n\n"
        "Endi savollaringizni berishingiz mumkin yoki /glucose buyrug'i bilan glyukoza kiriting.",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from telegram import ReplyKeyboardRemove
    await update.message.reply_text("❌ Bekor qilindi.", reply_markup=ReplyKeyboardRemove())
    return ConversationHandler.END

# --- /glucose ConversationHandler ---

async def glucose_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "📊 *Glyukoza darajasini kiritish*\n\n"
        "Glyukoza qiymatini mmol/L da kiriting (masalan: 6.5):",
        parse_mode='Markdown'
    )
    return GLUCOSE_VALUE

async def glucose_value(update: Update, context: ContextTypes.DEFAULT_TYPE):
    try:
        value = float(update.message.text.strip().replace(',', '.'))
        if not 0.5 <= value <= 50:
            raise ValueError
        context.user_data['glucose_value'] = value
    except ValueError:
        await update.message.reply_text("❌ Noto'g'ri qiymat. 0.5 dan 50 gacha raqam kiriting:")
        return GLUCOSE_VALUE

    keyboard = ReplyKeyboardMarkup([
        ["Och qoringa", "Ovqatdan oldin"],
        ["Ovqatdan keyin", "Uxlashdan oldin"]
    ], one_time_keyboard=True, resize_keyboard=True)

    await update.message.reply_text("Qachon o'lchadingiz?", reply_markup=keyboard)
    return GLUCOSE_CONTEXT

async def glucose_context(update: Update, context: ContextTypes.DEFAULT_TYPE):
    from telegram import ReplyKeyboardRemove
    ctx_map = {
        "och qoringa": "fasting",
        "ovqatdan oldin": "before_meal",
        "ovqatdan keyin": "after_meal",
        "uxlashdan oldin": "bedtime"
    }
    meal_ctx = ctx_map.get(update.message.text.strip().lower(), "fasting")
    value = context.user_data['glucose_value']

    user = update.effective_user
    db_user = get_or_create_user(user.id, user.username, user.full_name)
    save_glucose(db_user['id'], value, meal_ctx)

    # Ogohlantirish
    warning = ""
    if value < 3.9:
        warning = "\n\n🚨 *DIQQAT!* Gipoglikemiya (past qand)! Darhol shirinlik yeng va shifokorga murojaat qiling!"
    elif value > 13.9:
        warning = "\n\n⚠️ *DIQQAT!* Giperglikemiya (yuqori qand)! Shifokoringiz bilan bog'laning!"
    elif value > 10:
        warning = "\n\n⚠️ Qand darajasi me'yordan yuqori. Shifokorga ma'lum qiling."

    await update.message.reply_text(
        f"✅ Glyukoza saqlandi: *{value} mmol/L*{warning}",
        parse_mode='Markdown',
        reply_markup=ReplyKeyboardRemove()
    )
    return ConversationHandler.END

# --- Profil va statistika ---

async def profile_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    db_user = get_or_create_user(user.id, user.username, user.full_name)
    profile = get_medical_profile(db_user['id'])
    bmi = calculate_bmi(db_user['id'])

    if not profile:
        await update.message.reply_text(
            "📋 Profil to'ldirilmagan.\n/register buyrug'i bilan to'ldiring."
        )
        return

    meds = profile.get('medications', [])
    if isinstance(meds, list):
        meds_text = ", ".join(meds) if meds else "ko'rsatilmagan"
    else:
        meds_text = meds or "ko'rsatilmagan"

    dtype_map = {"type1": "1-tur", "type2": "2-tur", "gestational": "Gestatsion", "other": "Boshqa"}

    text = (
        f"👤 *Profil: {db_user.get('full_name', user.full_name)}*\n\n"
        f"🎂 Yosh: {db_user.get('age', 'noaniq')}\n"
        f"🏥 Diabet turi: {dtype_map.get(profile.get('diabetes_type',''), 'noaniq')}\n"
        f"💊 Dorilar: {meds_text}\n"
        f"⚖️ Vazn: {profile.get('weight', 'noaniq')} kg\n"
        f"📏 Bo'y: {profile.get('height', 'noaniq')} sm\n"
    )
    if bmi:
        text += f"📊 BMI: {bmi['bmi']} ({bmi['category']})\n"
    if profile.get('hba1c_latest'):
        text += f"🔬 HbA1c: {profile['hba1c_latest']}%\n"

    await update.message.reply_text(text, parse_mode='Markdown')

async def stats_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    db_user = get_or_create_user(user.id, user.username, user.full_name)
    stats = get_glucose_stats(db_user['id'], days=7)

    if stats['count'] == 0:
        await update.message.reply_text(
            "📊 Hali glyukoza ma'lumotlari yo'q.\n/glucose buyrug'i bilan kiriting."
        )
        return

    await update.message.reply_text(
        f"📊 *So'nggi 7 kunlik statistika:*\n\n"
        f"📈 O'lchovlar soni: {stats['count']}\n"
        f"📉 O'rtacha: {stats['average']} mmol/L\n"
        f"⬇️ Minimal: {stats['min']} mmol/L\n"
        f"⬆️ Maksimal: {stats['max']} mmol/L\n"
        f"✅ Me'yor zonasida: {stats['in_range_percent']}%",
        parse_mode='Markdown'
    )

async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    if query.data == "help":
        await query.message.reply_text(
            "📋 *Buyruqlar:*\n/start /register /glucose /profile /stats /help",
            parse_mode='Markdown'
        )
    elif query.data == "register":
        await query.message.reply_text(
            "📝 Ro'yxatdan o'tish uchun /register buyrug'ini yuboring."
        )

async def handle_message(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user = update.effective_user
    db_user = get_or_create_user(user.id, user.username, user.full_name)

    await update.message.chat.send_action("typing")

    try:
        reply = await chat_engine.generate_response(db_user['id'], update.message.text)
    except Exception as e:
        logger.error(f"handle_message xatolik: {e}")
        reply = "Kechirasiz, xatolik yuz berdi. Iltimos, qayta urinib ko'ring."

    await update.message.reply_text(reply)

def get_bot_application():
    app = Application.builder().token(TELEGRAM_BOT_TOKEN).build()

    register_conv = ConversationHandler(
        entry_points=[CommandHandler('register', register_start)],
        states={
            AGE: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_age)],
            DIABETES_TYPE: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_diabetes_type)],
            MEDICATIONS: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_medications)],
            WEIGHT: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_weight)],
            HEIGHT: [MessageHandler(filters.TEXT & ~filters.COMMAND, register_height)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    glucose_conv = ConversationHandler(
        entry_points=[CommandHandler('glucose', glucose_start)],
        states={
            GLUCOSE_VALUE: [MessageHandler(filters.TEXT & ~filters.COMMAND, glucose_value)],
            GLUCOSE_CONTEXT: [MessageHandler(filters.TEXT & ~filters.COMMAND, glucose_context)],
        },
        fallbacks=[CommandHandler('cancel', cancel)]
    )

    app.add_handler(CommandHandler('start', start))
    app.add_handler(CommandHandler('help', help_command))
    app.add_handler(CommandHandler('profile', profile_command))
    app.add_handler(CommandHandler('stats', stats_command))
    app.add_handler(register_conv)
    app.add_handler(glucose_conv)
    app.add_handler(CallbackQueryHandler(callback_handler))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_message))
    return app

def run_bot():
    init_db()
    app = get_bot_application()
    print("Bot ishga tushdi...")
    app.run_polling(drop_pending_updates=True)

if __name__ == '__main__':
    run_bot()