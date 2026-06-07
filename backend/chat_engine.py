import asyncio
from google import genai
from config import GEMINI_API_KEY, SYSTEM_PROMPT
from database import get_medical_profile, get_recent_messages, save_message
from rag_engine import RAGEngine

class ChatEngine:
    """BMI Class diagrammasi: ChatEngine sinfi"""

    def __init__(self):
        self.client = genai.Client(api_key=GEMINI_API_KEY)
        self.model_name = 'gemini-2.5-flash'
        self.system_prompt = SYSTEM_PROMPT
        try:
            self.rag = RAGEngine()
        except Exception as e:
            print(f"RAG yuklanmadi, chat'siz ishlaydi: {e}")
            self.rag = None

    def build_context(self, user_id):
        profile = get_medical_profile(user_id)
        history = get_recent_messages(user_id, limit=10)
        return profile, history

    def search_knowledge_base(self, query):
        if not self.rag:
            return ""
        return self.rag.search(query, top_k=3)

    def validate_response(self, response):
        """BMI metod: validate_response(response) — Tibbiy xavfsizlik tekshiruvi"""
        if not response:
            return "Kechirasiz, javob generatsiya qilishda xatolik yuz berdi."
        if "shifokor" not in response.lower():
            response += "\n\n⚠️ Eslatma: Bu ma'lumot faqat umumiy xarakterga ega. Aniq maslahat uchun shifokoringizga murojaat qiling."
        return response

    async def generate_response(self, user_id, user_message):
        # Bosqich 1: Savolni saqlash
        try:
            save_message(user_id, "user", user_message)
        except Exception as e:
            print(f"save_message xatolik: {e}")

        # Bosqich 2: Kontekst shakllantirish
        profile, history = self.build_context(user_id)

        profile_text = "Ma'lumot yo'q"
        if profile:
            meds = profile.get('medications', 'noaniq')
            if isinstance(meds, list):
                meds = ", ".join(meds)
            profile_text = (
                f"Diabet turi: {profile.get('diabetes_type','noaniq')}, "
                f"Yosh: {profile.get('age','noaniq')}, "
                f"Dorilar: {meds}, "
                f"HbA1c: {profile.get('hba1c_latest','noaniq')}"
            )

        history_text = ""
        for msg in history[-6:]:
            role = "Bemor" if msg['role'] == 'user' else "ShifoAI"
            history_text += f"{role}: {msg['content']}\n"

        # Bosqich 3: RAG — bilim bazasidan qidirish
        rag_context = self.search_knowledge_base(user_message)

        # Bosqich 4: Prompt shakllantirish
        full_prompt = f"""{self.system_prompt}

BEMOR PROFILI:
{profile_text}

BILIM BAZASIDAN TOPILGAN MA'LUMOT:
{rag_context if rag_context else "Tegishli ma'lumot topilmadi"}

MULOQOT TARIXI:
{history_text if history_text else "Yangi suhbat"}

BEMOR SAVOLI: {user_message}

JAVOB:"""

        # Bosqich 5: AI model chaqiruvi (3 marta urinish)
        # asyncio.to_thread ishlatamiz — sync Gemini call event loopni bloklamasin
        answer = None
        for attempt in range(3):
            try:
                if attempt > 0:
                    await asyncio.sleep(2)

                def _call_gemini():
                    return self.client.models.generate_content(
                        model=self.model_name,
                        contents=full_prompt
                    )

                response = await asyncio.to_thread(_call_gemini)
                answer = response.text
                break
            except Exception as e:
                print(f"Gemini urinish {attempt+1} xatolik: {e}")

        if not answer:
            answer = "Kechirasiz, texnik xatolik yuz berdi. Iltimos, qayta urinib ko'ring."

        # Bosqich 6: Javobni tekshirish va qaytarish
        answer = self.validate_response(answer)
        try:
            save_message(user_id, "assistant", answer)
        except Exception as e:
            print(f"save_message (assistant) xatolik: {e}")

        return answer

