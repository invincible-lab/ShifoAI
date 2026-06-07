from pydantic import BaseModel
from typing import Optional, List

class ChatRequest(BaseModel):
    message: str
    session_id: Optional[str] = None

class ChatResponse(BaseModel):
    reply: str
    session_id: Optional[str] = None

class RegisterRequest(BaseModel):
    full_name: Optional[str] = None
    age: Optional[int] = None

class GlucoseRequest(BaseModel):
    value: float
    unit: str = "mmol/L"
    meal_context: Optional[str] = None

class MedicalProfileRequest(BaseModel):
    diabetes_type: Optional[str] = None
    medications: Optional[List[str]] = None
    allergies: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    hba1c_latest: Optional[float] = None
    diagnosis_date: Optional[str] = None

class UserResponse(BaseModel):
    id: int
    telegram_id: int
    username: Optional[str]
    full_name: Optional[str]
    age: Optional[int]
    created_at: str

class GlucoseResponse(BaseModel):
    id: int
    value: float
    unit: str
    reading_time: str
    meal_context: Optional[str]

class ReminderRequest(BaseModel):
    kind: str
    title: str
    time: str
    days_of_week: Optional[List[str]] = None

class ReminderToggleRequest(BaseModel):
    active: bool
