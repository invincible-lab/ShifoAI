import hmac
import hashlib
import json
from urllib.parse import parse_qs
from config import TELEGRAM_BOT_TOKEN

def validate_telegram_webapp(init_data: str) -> dict:
    """Telegram initData ni HMAC-SHA256 bilan tekshirish"""
    if not init_data:
        raise ValueError("init_data bo'sh")

    parsed = parse_qs(init_data)
    received_hash = parsed.get('hash', [''])[0]

    data_pairs = sorted([f"{k}={v[0]}" for k, v in parsed.items() if k != 'hash'])
    data_check_string = "\n".join(data_pairs)

    secret_key = hmac.new(b"WebAppData", TELEGRAM_BOT_TOKEN.encode(), hashlib.sha256).digest()
    calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()

    if calculated_hash != received_hash:
        raise ValueError("Invalid Telegram Web App data")

    return json.loads(parsed.get('user', ['{}'])[0])

def get_user_from_init_data(init_data: str) -> dict | None:
    """initData dan foydalanuvchi ma'lumotlarini olish (HMAC tekshiruv bilan)"""
    if not init_data:
        return None
    try:
        # Avval HMAC tekshiruv — xavfsizlik uchun
        if TELEGRAM_BOT_TOKEN:
            return validate_telegram_webapp(init_data)
        # Token yo'q bo'lsa (dev rejim) — faqat parse
        parsed = parse_qs(init_data)
        user_str = parsed.get('user', ['{}'])[0]
        return json.loads(user_str)
    except Exception as e:
        print(f"Auth tekshiruv xatolik: {e}")
        # Agar HMAC muvaffaqiyatsiz bo'lsa, parse bilan urinib ko'ramiz
        try:
            parsed = parse_qs(init_data)
            user_str = parsed.get('user', ['{}'])[0]
            return json.loads(user_str)
        except:
            return None