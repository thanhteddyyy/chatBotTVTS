from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from api2data import (
    analyze_user_query, build_user_context,
    extract_session_context, enrich_analysis_with_context,
    query_firestore_by_entities, query_firestore_multi_school, 
    find_schools_by_major, cache_recommendation,
    summarize_session_background,
    generate_type_A, generate_type_B, generate_type_C,
    generate_type_C_fallback, generate_type_D
)

app = FastAPI(title="Campus Compass API", version="2.1")

# CORS cho Next.js
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)


class ChatMessage(BaseModel):
    role: str  # "user" | "assistant"
    content: str


class Question(BaseModel):
    question: str
    uid: str | None = None
    history: list[ChatMessage] = []  # Lịch sử chat từ frontend


@app.post("/chat")
def chat(q: Question, background_tasks: BackgroundTasks):
    try:
        user_question = q.question
        chat_history = [{"role": m.role, "content": m.content} for m in q.history]
        
        print(f"\n{'='*60}")
        print(f"📩 Câu hỏi: {user_question}")
        print(f"👤 UID: {q.uid or 'anonymous'}")
        print(f"📜 History: {len(chat_history)} messages")
        
        # Thêm Background Task: Tóm tắt ngữ cảnh (gồm lịch sử + câu hỏi hiện tại)
        if q.uid:
            history_for_summary = chat_history + [{"role": "user", "content": user_question}]
            background_tasks.add_task(summarize_session_background, q.uid, history_for_summary)
        
        # ---- Bước 1: Phân tích Ý định & Thực thể (1 API call) ----
        analysis = analyze_user_query(user_question, chat_history)

        # ---- Bước 1.5: Follow-up Context ----
        session_ctx = extract_session_context(chat_history)
        analysis = enrich_analysis_with_context(analysis, session_ctx)
        
        # ---- Bước 1.8: Clarification Loop ----
        if analysis.get("needs_clarification") and analysis.get("missing_info"):
            print("❓ Cần làm rõ câu hỏi:", analysis.get("missing_info"))
            return {
                "answer": analysis.get("missing_info"),
                "type": "CLARIFICATION"
            }
            
        q_type = analysis.get("intent", "A")
        
        # ---- Bước 2: Load hồ sơ user (nếu có) ----
        user_context = build_user_context(q.uid) if q.uid else ""
        
        # ---- Bước 3: Routing theo Type ----
        
        # === TYPE A: Hướng nghiệp & Sở thích ===
        if q_type == "A":
            print("🧭 Route: Type A (Hướng nghiệp)")
            answer = generate_type_A(user_question, user_context, chat_history)
            return {"answer": answer, "type": "A"}
        
        # === TYPE B: Lịch tuyển sinh & Thủ tục ===
        elif q_type == "B":
            print("🔍 Route: Type B (Google Search)")
            answer = generate_type_B(user_question, chat_history)
            return {"answer": answer, "type": "B"}
        
        # === TYPE C: Điểm chuẩn & So sánh (Firestore + Fallback) ===
        elif q_type == "C":
            print("📊 Route: Type C (Firestore RAG)")
            
            truong_list = analysis.get("truong", [])
            
            # Nếu có nhiều trường -> so sánh đa trường
            if len(truong_list) > 1:
                print(f"📊 Multi-school comparison cho {len(truong_list)} trường")
                data_list = query_firestore_multi_school(analysis, q.uid)
                
                if data_list:
                    print(f"✅ Tìm thấy dữ liệu cho {len(data_list)} trường")
                    answer = generate_type_C(user_question, data_list, user_context, chat_history)
                    # Cache recommendation
                    cache_recommendation(q.uid, q_type, analysis, data_list)
                    return {"answer": answer, "type": "C"}
                else:
                    print("⚠️ Các trường không có trong DB → Fallback")
                    answer = generate_type_C_fallback(user_question, chat_history)
                    return {"answer": answer, "type": "C_FALLBACK"}
            else:
                # Bước C2: Query Firestore đơn trường (logic cũ)
                data = query_firestore_by_entities(analysis, q.uid)
                
                if data:
                    # ✅ Tìm thấy trong DB → dùng data chính xác
                    print(f"✅ Tìm thấy trong Firestore: {data.get('ten_truong', 'N/A')}")
                    answer = generate_type_C(user_question, data, user_context, chat_history)
                    # Cache recommendation
                    cache_recommendation(q.uid, q_type, analysis, data)
                    return {"answer": answer, "type": "C"}
                else:
                    # ⚠️ FALLBACK: Trường không có trong DB → dùng Google Search
                    print("⚠️ Trường không có trong DB → Fallback sang Google Search")
                    answer = generate_type_C_fallback(user_question, chat_history)
                    return {"answer": answer, "type": "C_FALLBACK"}
        
        # === TYPE D: Tìm trường theo ngành ===
        elif q_type == "D":
            print("🏫 Route: Type D (Search by Major)")
            
            major = analysis.get("nganh")
            print(f"🎯 Ngành tìm kiếm: {major}")
            
            if not major:
                return {
                    "answer": "Bạn đang quan tâm đến ngành học nào vậy? Hãy nói rõ tên ngành để mình tìm trường nhé! 🔍",
                    "type": "D"
                }
            
            found = find_schools_by_major(major, q.uid)
            
            if found:
                print(f"✅ Tìm thấy {len(found)} trường đào tạo ngành {major}")
                answer = generate_type_D(user_question, found, user_context, chat_history)
                # Cache recommendation
                cache_recommendation(q.uid, q_type, analysis, found)
            else:
                answer = f"Hiện tại trong hệ thống 46 trường, mình chưa tìm thấy trường nào đào tạo ngành **{major}**. Bạn có thể thử tên ngành khác hoặc hỏi mình thông tin khác nhé! 😊"
            
            return {"answer": answer, "type": "D"}
        
        # === Fallback ===
        return {
            "answer": "Xin lỗi, câu hỏi này nằm ngoài phạm vi hỗ trợ của mình. Mình chuyên tư vấn ngành học, chọn trường và thông tin tuyển sinh đại học! 📚",
            "type": "UNKNOWN"
        }
        
    except Exception as e:
        import logging
        logging.error(f"❌ Lỗi hệ thống: {str(e)}")
        print(f"❌ ERROR: {str(e)}")
        
        if "429" in str(e) or "Resource has been exhausted" in str(e) or "quota" in str(e).lower() or "403" in str(e):
            return {
                "answer": "⏳ Hệ thống AI đang bị quá tải (vượt giới hạn API miễn phí). Bạn vui lòng đợi 30 giây rồi hỏi lại nhé!",
                "type": "ERROR"
            }
        return {
            "answer": f"Đã xảy ra lỗi kỹ thuật. Vui lòng thử lại sau! 😊",
            "type": "ERROR"
        }


@app.get("/health")
def health():
    return {"status": "ok", "version": "2.1", "schools": 46}