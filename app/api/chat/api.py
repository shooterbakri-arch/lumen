import os
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google import genai
from supabase import create_client, Client
from datetime import datetime
from typing import Optional, List
from enum import Enum
from pathlib import Path
from fastapi.middleware.cors import CORSMiddleware 
import tempfile 
import requests 

# --- 1. تحميل المتغيرات البيئية ---
try:
    # يفترض أن هذا المسار يؤدي إلى ملف .env.local
    dotenv_path = Path(__file__).resolve().parent.parent.parent.parent / '.env.local' 
    load_dotenv(dotenv_path=dotenv_path)
    print(f"Loaded .env from: {dotenv_path}")
except Exception as e:
    print(f"Error loading .env file: {e}")

# --- 2. تهيئة FastAPI ---
app = FastAPI()

# 🛡️ إعدادات CORS
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# --- 3. تهيئة العملاء (Clients) ---

# Gemini Client
try:
    GEMINI_KEY = os.getenv("GEMINI_API_KEY")
    if not GEMINI_KEY:
        raise ValueError("GEMINI_API_KEY not found in environment variables.")
    client_gemini = genai.Client(api_key=GEMINI_KEY)
except Exception as e:
    print(f"Error initializing Gemini client: {e}")
    raise

# Supabase Client
SUPABASE_URL = os.getenv("SUPABASE_URL") or os.getenv('NEXT_PUBLIC_SUPABASE_URL')
SUPABASE_KEY = os.getenv("SUPABASE_KEY") or os.getenv('NEXT_PUBLIC_SUPABASE_ANON_KEY')

if not SUPABASE_URL or not SUPABASE_KEY:
    raise ValueError("One of SUPABASE_URL/NEXT_PUBLIC_SUPABASE_URL and SUPABASE_KEY/NEXT_PUBLIC_SUPABASE_ANON_KEY must be set.")

client_supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# --- 4. تعريف هيكل البيانات (Pydantic Models) ---

class StudentQuestion(BaseModel):
    student_id: str
    project_id: str
    question: str
    file_path: Optional[str] = None # هنا file_path هو الرابط الموقَّع الكامل

class HistoryRecord(BaseModel):
    id: str
    question: str
    answer: str
    created_at: datetime


# --- 5. وظيفة حفظ البيانات في Supabase ---

def save_qa_to_supabase(student_id: str, project_id: str, question: str, answer: str):
    """
    لحفظ السؤال والجواب في جدول 'questions'.
    """
    data_to_insert = {
        "student_id": student_id,
        "project_id": project_id,
        "question": question,
        "answer": answer,
        "created_at": datetime.now().isoformat()
    }

    try:
        response = client_supabase.table("questions").insert(data_to_insert).execute()
        return response.data
    except Exception as e:
        print(f"Error saving to Supabase: {e}")
        return None


# --- 6. الـ Endpoint الأساسي (طرح الأسئلة) ---

@app.post("/ask_question/")
async def ask_question(data: StudentQuestion):
    uploaded_file_to_gemini = None
    temp_local_path = None

    try:
        contents: List[any] = []
        
        # 1. معالجة الملفات: إذا تم تمرير رابط موقَّع (Signed URL)
        if data.file_path and data.file_path.strip():
            
            # 1.1 إنشاء ملف مؤقت محلي لحفظ البيانات التي سيتم تنزيلها
            # 🎯 الحل النهائي لـ Unknown mime type: إضافة suffix='.pdf'
            with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp_file:
                temp_local_path = tmp_file.name 
            
            try:
                signed_url = data.file_path 
                print(f"Attempting to download file from Signed URL: {signed_url[:80]}...") 
                
                # 1.2 استخدام requests لسحب الملف مباشرة من الرابط الموقَّع
                response_file = requests.get(signed_url, stream=True)
                response_file.raise_for_status()  
                
                # 1.3 كتابة البيانات التي تم تنزيلها إلى الملف المؤقت
                with open(temp_local_path, "wb") as f:
                    for chunk in response_file.iter_content(chunk_size=8192):
                        f.write(chunk)
                
                # 1.4 رفع الملف المؤقت إلى Gemini
                print(f"File downloaded successfully to {temp_local_path}. Uploading to Gemini...")
                
                # نتركها بدون mime_type لتجنب الخطأ السابق
                uploaded_file_to_gemini = client_gemini.files.upload(
                    file=temp_local_path
                )
                contents.append(uploaded_file_to_gemini) 

            except requests.exceptions.RequestException as e:
                print(f"Error downloading file via requests: {e}")
                raise HTTPException(status_code=400, detail=f"Failed to fetch file from URL (check URL validity/expiry): {str(e)}")
            except Exception as e:
                print(f"Error during file upload to Gemini: {e}")
                raise HTTPException(status_code=500, detail=f"Internal server error during file processing: {str(e)}")

        # 2. إضافة السؤال إلى المحتوى
        contents.append(data.question) 

        # 3. استدعاء Gemini API
        print("Calling Gemini API...")
        response = client_gemini.models.generate_content(
            model='gemini-2.0-flash',
            contents=contents
        )
        answer = response.text

        # 4. حفظ البيانات في Supabase
        save_result = save_qa_to_supabase(
            student_id=data.student_id,
            project_id=data.project_id,
            question=data.question,
            answer=answer
        )

        return {
            "question": data.question,
            "answer": answer,
            "student_id": data.student_id,
            "project_id": data.project_id,
            "db_save_status": "Success" if save_result else "Failure"
        }

    except HTTPException:
        raise
    except Exception as e:
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail="Failed to process request or communicate with AI/DB.")

    finally:
        # 5. التنظيف (مهم جداً!)
        
        # 5.1 حذف الملف من Gemini 
        if uploaded_file_to_gemini:
            client_gemini.files.delete(name=uploaded_file_to_gemini.name)
            print(f"Deleted uploaded file from Gemini: {uploaded_file_to_gemini.name}")
        
        # 5.2 حذف الملف المؤقت من النظام المحلي
        if temp_local_path and os.path.exists(temp_local_path):
            os.remove(temp_local_path)
            print(f"Deleted local temporary file: {temp_local_path}")


# --- 7. الـ Endpoint لجلب سجل الأسئلة (التاريخ) ---

@app.get("/get_history/", response_model=List[HistoryRecord])
async def get_history(student_id: str):
    """
    جلب جميع الأسئلة والأجوبة المحفوظة لطالب محدد.
    """
    try:
        response = client_supabase.table("questions").select("id, question, answer, created_at").eq("student_id", student_id).order("created_at", desc=True).execute()

        if response.data:
            return response.data
        else:
            return []
            
    except Exception as e:
        print(f"Error fetching history: {e}")
        raise HTTPException(status_code=500, detail="Failed to retrieve history log.")


# --- 8. الـ Endpoint للعمليات الإضافية (تلخيص/تفسير) ---

class AnalysisType(str, Enum):
    summarize = "summarize"
    explain = "explain"

class AnalysisRequest(BaseModel):
    answer_text: str
    operation: AnalysisType

@app.post("/analyze_answer/")
async def analyze_answer(data: AnalysisRequest):
    """
    يستقبل الإجابة النهائية ويطلب من Gemini تلخيصها أو تفسيرها.
    """

    if data.operation == AnalysisType.summarize:
        prompt = f"Summarize the following text concisely:\n\n{data.answer_text}"
    elif data.operation == AnalysisType.explain:
        prompt = f"Explain the following answer in simple terms suitable for a student:\n\n{data.answer_text}"
    else:
        raise HTTPException(status_code=400, detail="Invalid operation type.")

    try:
        response = client_gemini.models.generate_content(
            model='gemini-2.5-flash',
            contents=[prompt]
        )
        return {
            "operation": data.operation,
            "result": response.text
        }
    except Exception as e:
        print(f"Error in analysis API: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to perform {data.operation.value}.")