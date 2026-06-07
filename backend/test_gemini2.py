import chromadb.utils.embedding_functions as embedding_functions
import os
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GEMINI_API_KEY")

try:
    gemini_ef = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=api_key, model_name="models/gemini-embedding-2")
    res = gemini_ef(["hello world"])
    print("models/gemini-embedding-2 worked:", len(res[0]))
except Exception as e:
    print("models/gemini-embedding-2 failed:", e)

try:
    gemini_ef2 = embedding_functions.GoogleGenerativeAiEmbeddingFunction(api_key=api_key, model_name="models/text-embedding-004")
    res = gemini_ef2(["hello world"])
    print("models/text-embedding-004 worked:", len(res[0]))
except Exception as e:
    print("models/text-embedding-004 failed:", e)
