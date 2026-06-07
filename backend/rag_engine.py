import chromadb
import json
import os
from config import CHROMA_PATH, KNOWLEDGE_BASE_PATH

class RAGEngine:
    def __init__(self):
        self.enabled = False
        self.collection = None
        try:
            os.makedirs(CHROMA_PATH, exist_ok=True)
            self.client = chromadb.PersistentClient(path=CHROMA_PATH)
            self.collection = self.client.get_or_create_collection(name="diabetes_knowledge")
            if self.collection.count() == 0 and os.path.exists(KNOWLEDGE_BASE_PATH):
                self.add_documents()
            self.enabled = True
            print("RAG Engine tayyor")
        except Exception as e:
            print(f"RAG Engine ishga tushmadi (siz chatnig qilishingiz mumkin): {e}")

    def add_documents(self, json_path=None):
        path = json_path or KNOWLEDGE_BASE_PATH
        with open(path, 'r', encoding='utf-8') as f:
            data = json.load(f)
        documents, ids, metadatas = [], [], []
        for i, item in enumerate(data):
            documents.append(item["content"])
            ids.append(f"doc_{i}")
            metadatas.append({"category": item["category"], "title": item["title"]})
        self.collection.upsert(documents=documents, ids=ids, metadatas=metadatas)
        print(f"Bilim bazasi: {len(documents)} ta hujjat yuklandi")

    def search(self, query, top_k=3):
        if not self.enabled or not self.collection:
            return ""
        try:
            if self.collection.count() == 0:
                return ""
            results = self.collection.query(
                query_texts=[query],
                n_results=min(top_k, self.collection.count())
            )
            if results and results['documents']:
                return "\n\n".join(results['documents'][0])
        except Exception as e:
            print(f"RAG qidirish xatolik: {e}")
        return ""

    def update_document(self, doc_id, content):
        if self.enabled and self.collection:
            self.collection.update(ids=[doc_id], documents=[content])

    def delete_document(self, doc_id):
        if self.enabled and self.collection:
            self.collection.delete(ids=[doc_id])
