import json
import os
from dotenv import load_dotenv
from google import genai
from google.genai import types
import firebase_admin
from firebase_admin import credentials, firestore

# Tự động đọc file .env hoặc .env.local
load_dotenv(".env.local")
load_dotenv(".env")

# ===== INIT =====
cred = credentials.Certificate("serviceAccountKey.json")
if not firebase_admin._apps:
    firebase_admin.initialize_app(cred)
db = firestore.client()

gemini_key = os.environ.get("GEMINI_API_KEY")
if not gemini_key:
    raise RuntimeError("❌ GEMINI_API_KEY chưa được set! Hãy thêm vào biến môi trường.")
client = genai.Client(api_key=gemini_key)

# =====================================================================
# ALIAS MAPPING — 46 trường
# =====================================================================
SCHOOL_ALIASES = {
    # --- TPHCM ---
    "ueh": "KSA", "kinh tế tphcm": "KSA", "đại học kinh tế tphcm": "KSA", "kinh te tphcm": "KSA",
    "kiến trúc": "KTS", "kiến trúc tphcm": "KTS",
    "ngoại thương nam": "NTS", "ngoại thương phía nam": "NTS", "ngoại thương sài gòn": "NTS",
    "bách khoa tphcm": "QSB", "bách khoa": "QSB", "bk": "QSB", "hcmut": "QSB", "bk tphcm": "QSB", "đhbk": "QSB",
    "uit": "QSC", "công nghệ thông tin": "QSC", "cntt tphcm": "QSC", "uit tphcm": "QSC",
    "kinh tế luật": "QSK", "uel": "QSK", "kinh tế - luật": "QSK",
    "khoa học tự nhiên tphcm": "QST", "khtn tphcm": "QST", "tự nhiên tphcm": "QST",
    "khoa học xã hội tphcm": "QSX", "nhân văn tphcm": "QSX", "xã hội nhân văn tphcm": "QSX", "ussh tphcm": "QSX",
    "phạm ngọc thạch": "TYS", "y khoa phạm ngọc thạch": "TYS",
    "y dược tphcm": "YDS", "y dược": "YDS", "ump": "YDS",
    "công nghiệp tphcm": "IUH", "iuh": "IUH", "công nghiệp": "IUH",
    "sư phạm tphcm": "SPS", "sư phạm": "SPS", "sp tphcm": "SPS",
    "nông lâm": "NLS", "nông lâm tphcm": "NLS",
    "tôn đức thắng": "DTT", "tdt": "DTT", "tdtu": "DTT",
    "sài gòn": "SGD", "đại học sài gòn": "SGD",
    "quốc tế tphcm": "QSQ", "iu": "QSQ", "quốc tế": "QSQ",
    "luật tphcm": "LPS", "luật": "LPS",
    "sư phạm kỹ thuật": "SPK", "spkt": "SPK", "ute": "SPK", "sư phạm kỹ thuật tphcm": "SPK",
    "mở tphcm": "MBS", "mở": "MBS", "ou": "MBS",
    "văn lang": "DVL",
    "hutech": "DKC", "công nghệ tphcm": "DKC",
    "tài chính marketing": "DMS", "ufm": "DMS",
    "văn hiến": "DVH",
    "hoa sen": "HSU",
    "fpt": "FPT", "đại học fpt": "FPT",
    # --- HÀ NỘI ---
    "bách khoa hà nội": "BKA", "bk hà nội": "BKA", "bkhn": "BKA", "hust": "BKA", "bách khoa hn": "BKA",
    "công nghệ hà nội": "QHI", "uet": "QHI", "công nghệ đhqg hn": "QHI",
    "khoa học tự nhiên hà nội": "HUS", "khtn hà nội": "HUS", "hus": "HUS",
    "khoa học xã hội hà nội": "QHX", "nhân văn hà nội": "QHX", "ussh hà nội": "QHX",
    "kinh tế hà nội": "QHE", "kinh tế đhqg": "QHE",
    "ngoại thương": "NTH", "ngoại thương hà nội": "NTH", "ftu": "NTH",
    "đại học hà nội": "NHF", "hanu": "NHF",
    "sư phạm hà nội": "SPH", "hnue": "SPH",
    "y hà nội": "YHB", "đại học y hà nội": "YHB", "hmu": "YHB",
    "dược hà nội": "DKH",
    "nông nghiệp": "HVN", "nông nghiệp việt nam": "HVN", "học viện nông nghiệp": "HVN",
    "luật hà nội": "LPH",
    "ngoại ngữ hà nội": "QHF", "ngoại ngữ đhqg": "QHF", "ulis": "QHF",
    "giao thông vận tải": "GHA", "gtvt": "GHA",
    "báo chí": "HBT", "báo chí tuyên truyền": "HBT",
    # --- ĐÀ NẴNG / HUẾ / KHÁC ---
    "bách khoa đà nẵng": "DDK", "bk đà nẵng": "DDK",
    "ngoại ngữ đà nẵng": "DDF",
    "y dược cổ truyền": "HYD",
    "khoa học huế": "DHT",
    "y dược huế": "DHY",
    "cần thơ": "TCT", "đại học cần thơ": "TCT",
}

# Ma_truong → ten_truong (để hiển thị)
SCHOOL_NAMES = {
    "KSA": "Đại học Kinh tế TPHCM", "KTS": "Trường ĐH Kiến trúc TPHCM",
    "NTS": "Trường ĐH Ngoại thương – CS phía Nam", "QSB": "Trường ĐH Bách Khoa TPHCM",
    "QSC": "Trường ĐH Công nghệ Thông tin TPHCM", "QSK": "Trường ĐH Kinh tế - Luật",
    "QST": "Trường ĐH Khoa học Tự nhiên TPHCM", "QSX": "Trường ĐH KHXH&NV TPHCM",
    "TYS": "Trường ĐH Y khoa Phạm Ngọc Thạch", "YDS": "Trường ĐH Y Dược TPHCM",
    "IUH": "Trường ĐH Công Nghiệp TPHCM", "SPS": "Trường ĐH Sư phạm TPHCM",
    "NLS": "Trường ĐH Nông Lâm TPHCM", "DTT": "Trường ĐH Tôn Đức Thắng",
    "SGD": "Trường ĐH Sài Gòn", "QSQ": "Trường ĐH Quốc tế – ĐHQG TPHCM",
    "TCT": "Trường ĐH Cần Thơ", "BKA": "ĐH Bách khoa Hà Nội",
    "QHI": "Trường ĐH Công nghệ – ĐHQG HN", "HUS": "Trường ĐH KHTN – ĐHQG HN",
    "QHX": "Trường ĐH KHXH&NV – ĐHQG HN", "QHE": "Trường ĐH Kinh tế – ĐHQG HN",
    "NTH": "Trường ĐH Ngoại thương HN", "NHF": "Trường ĐH Hà Nội",
    "SPH": "Trường ĐH Sư phạm HN", "YHB": "Trường ĐH Y Hà Nội",
    "DKH": "Trường ĐH Dược Hà Nội", "HVN": "Học viện Nông nghiệp VN",
    "LPH": "Trường ĐH Luật Hà Nội", "QHF": "Trường ĐH Ngoại Ngữ – ĐHQG HN",
    "GHA": "Trường ĐH Giao thông Vận tải", "HBT": "Học viện Báo chí và Tuyên truyền",
    "DDK": "Trường ĐH Bách khoa Đà Nẵng", "DDF": "Trường ĐH Ngoại ngữ Đà Nẵng",
    "HYD": "HV Y Dược Học Cổ Truyền VN", "DHT": "Trường ĐH Khoa học – ĐH Huế",
    "DHY": "Trường ĐH Y Dược Huế", "FPT": "Trường ĐH FPT",
    "HSU": "Trường ĐH Hoa Sen", "MBS": "Trường ĐH Mở TPHCM",
    "LPS": "Trường ĐH Luật TPHCM", "SPK": "Trường ĐH Sư phạm Kỹ thuật TPHCM",
    "DVL": "Trường ĐH Văn Lang", "DKC": "Trường ĐH Công nghệ TPHCM (HUTECH)",
    "DMS": "Trường ĐH Tài chính Marketing TPHCM", "DVH": "Trường ĐH Văn Hiến",
}

# =====================================================================
# TỔ HỢP MÔN
# =====================================================================
TO_HOP_MAP = {
    "A00": ["toan", "vatLy", "hoaHoc"],
    "A01": ["toan", "vatLy", "tiengAnh"],
    "A02": ["toan", "vatLy", "sinhHoc"],
    "B00": ["toan", "hoaHoc", "sinhHoc"],
    "B08": ["toan", "sinhHoc", "tiengAnh"],
    "C00": ["nguVan", "lichSu", "diaLy"],
    "C01": ["nguVan", "toan", "vatLy"],
    "D01": ["toan", "nguVan", "tiengAnh"],
    "D07": ["toan", "hoaHoc", "tiengAnh"],
    "D09": ["toan", "lichSu", "tiengAnh"],
    "D10": ["toan", "diaLy", "tiengAnh"],
    "D14": ["nguVan", "lichSu", "tiengAnh"],
    "D15": ["nguVan", "diaLy", "tiengAnh"],
}

# =====================================================================
# SYSTEM PROMPT
# =====================================================================
SYSTEM_PROMPT = """SYSTEM INSTRUCTIONS - CHATBOT TƯ VẤN TUYỂN SINH CAMPUS COMPASS
Bạn là CHATNPT, trợ lý tư vấn tuyển sinh thông minh của nhóm Campus Compass (4 thành viên từ ĐH Bách Khoa TPHCM).

NGUYÊN TẮC CỐT LÕI:
- Trả lời ngắn gọn, tối đa 150 từ, chính xác dựa trên dữ liệu được cung cấp
- KHÔNG bịa đặt số liệu. Nếu không có dữ liệu → nói thật
- Sử dụng Markdown (in đậm, bullet), emoji nhẹ nhàng
- Giọng văn thân thiện, gần gũi học sinh THPT
- Khi có "HỒ SƠ HỌC SINH" → tư vấn CÁ NHÂN HÓA, không trả lời chung chung
- Khi có "DỮ LIỆU FIRESTORE" → ƯU TIÊN dùng dữ liệu đó, không tự suy đoán

PHẠM VI: Định hướng ngành, thông tin trường, tuyển sinh, nghề nghiệp, ôn thi, tâm lý học sinh.
NGOÀI PHẠM VI → Lịch sự từ chối.

Nếu học sinh MƠ HỒ về bản thân (không biết thích gì, giỏi gì): Hãy hỏi về hoạt động thường ngày, sở thích lúc rảnh, để phân tích điểm mạnh tiềm ẩn.
"""


# =====================================================================
# Mapping phương thức → mã phương thức (khớp schema Firebase)
# =====================================================================
PHUONG_THUC_MAP = {
    "THPT": "PT2",
    "thpt": "PT2",
    "DGNL": "PT3",
    "dgnl": "PT3",
    "đgnl": "PT3",
    "ĐGNL": "PT3",
    "UTXT": "PT1",
    "utxt": "PT1",
    "học bạ": "PT1",
    "hoc ba": "PT1",
    "xét tuyển kết hợp": "PT1",
    "PT1": "PT1",
    "PT2": "PT2",
    "PT3": "PT3",
}


# =====================================================================
# 1. ANALYZE USER QUERY (Gộp Intent + Entities để giảm số lần gọi API)
# =====================================================================
def analyze_user_query(question, chat_history=None):
    """
    Phân tích câu hỏi 1 lần duy nhất để lấy cả Ý định (Intent) và Thực thể (Entities).
    Giúp tiết kiệm 1 lượng lớn request lên Gemini (tránh lỗi 429 Quota).
    """
    school_list_str = ", ".join([f"{v}: {SCHOOL_NAMES[v]}" for v in SCHOOL_NAMES])
    
    prompt = f"""Phân tích câu hỏi tuyển sinh đại học của học sinh THPT.

CÁC LOẠI Ý ĐỊNH (intent):
A = Hướng nghiệp, sở thích, chọn ngành chung chung (VD: em thích vẽ, CNTT học gì?)
B = Lịch tuyển sinh, thủ tục đăng ký, quy chế thi (thông tin cần Google search)
C = Điểm chuẩn, học phí, so sánh trường CỤ THỂ
D = Tìm trường theo ngành học (VD: trường nào có ngành Kế toán?)

DANH SÁCH TRƯỜNG TRONG HỆ THỐNG:
{school_list_str}

CÂU HỎI: "{question}"

LƯU Ý: Nếu câu hỏi ngắn gọn kiểu "Thế còn X?", "Còn trường Y?", "So với Z?" 
→ Đây là câu hỏi follow-up, hãy extract entity X/Y/Z.

YÊU CẦU TRẢ VỀ CHỈ 1 JSON:
{{
  "intent": "A", "B", "C" hoặc "D",
  "truong": ["Danh sách Tên trường / Mã trường được nhắc đến"] (trả về mảng rỗng [] nếu không có),
  "nganh": "Tên ngành được nhắc đến (hoặc null)",
  "phuong_thuc": "THPT, DGNL, UTXT (hoặc null)",
  "needs_clarification": false, // Trả về true nếu câu hỏi thuộc intent C hoặc D nhưng thiếu hẳn Tên trường hoặc Tên ngành
  "missing_info": "Bạn đang muốn hỏi thông tin của trường nào và ngành nào vậy?" // Câu hỏi Bot dùng để hỏi lại người dùng nếu needs_clarification là true
}}"""

    response = client.models.generate_content(
        model="gemini-2.5-flash", 
        contents=prompt,
        config=types.GenerateContentConfig(
            response_mime_type="application/json"
        )
    )
    
    text = response.text
    try:
        entities = json.loads(text)
    except:
        print("❌ Analyze query failed:", text)
        return {"intent": "A", "truong": [], "nganh": None, "phuong_thuc": None, "ma_phuong_thuc": None, "needs_clarification": False, "missing_info": None}
    
    print(f"🔍 ANALYZED: {entities}")
    
    # Chuẩn hóa phuong_thuc → ma_phuong_thuc (PT1/PT2/PT3)
    raw_pt = entities.get("phuong_thuc")
    if raw_pt:
        entities["ma_phuong_thuc"] = PHUONG_THUC_MAP.get(raw_pt, PHUONG_THUC_MAP.get(raw_pt.upper()))
    else:
        entities["ma_phuong_thuc"] = None
        
    # Đảm bảo intent đúng dạng
    if entities.get("intent") not in ["A", "B", "C", "D"]:
        entities["intent"] = "A"
        
    # Backward compatibility: đảm bảo truong là list
    if "truong" in entities:
        if entities["truong"] is None:
            entities["truong"] = []
        elif isinstance(entities["truong"], str):
            entities["truong"] = [entities["truong"]]
            
    return entities


# =====================================================================
# 2. FOLLOW-UP CONTEXT HANDLING (Mới)
# =====================================================================
def extract_session_context(chat_history):
    """
    Quét chat history để tìm các trường/ngành đã được nhắc đến gần đây.
    Giúp xử lý các câu hỏi follow-up như "Thế còn UIT?".
    Dùng pattern matching thô, không gọi LLM để tối ưu tốc độ.
    """
    context = {
        "discussed_schools": [],
        "discussed_majors": []
    }
    
    if not chat_history:
        return context
        
    # Chỉ xét 3 lượt gần nhất để lấy context mới nhất
    recent = chat_history[-6:]
    
    for msg in recent:
        if msg.get("role") != "assistant":
            continue
            
        content = msg.get("content", "").lower()
        
        # Detect trường đã nhắc
        for code, name in SCHOOL_NAMES.items():
            # Tránh lặp lại code
            if code not in context["discussed_schools"]:
                if name.lower() in content or code.lower() in content:
                    context["discussed_schools"].append(code)
                    
        # Detect ngành phổ biến đã nhắc (Basic pattern matching)
        common_majors = ["khoa học máy tính", "công nghệ thông tin", "cntt", "marketing", "quản trị kinh doanh", "kế toán", "tài chính", "ngôn ngữ anh", "logistics"]
        for major in common_majors:
            if major not in [m.lower() for m in context["discussed_majors"]]:
                if major in content:
                    context["discussed_majors"].append(major)
                    
    print(f"🧠 Session Context extracted: {context}")
    return context

def enrich_analysis_with_context(analysis, session_ctx):
    """
    Kết hợp kết quả phân tích Intent mới với Session Context cũ.
    Tự động điền các entities còn thiếu.
    """
    truong_list = analysis.get("truong", [])
    nganh = analysis.get("nganh")
    intent = analysis.get("intent", "A")
    
    context_used = False
    
    # 1. Fill trường bị thiếu
    if not truong_list and session_ctx["discussed_schools"]:
        analysis["truong"] = session_ctx["discussed_schools"]
        context_used = True
        
    # 2. Fill ngành bị thiếu
    if not nganh and session_ctx["discussed_majors"]:
        analysis["nganh"] = session_ctx["discussed_majors"][-1] # Lấy ngành được nhắc gần nhất
        context_used = True
        
    # 3. Override intent nếu user hỏi cộc lốc nhưng có context
    if intent == "A" and context_used:
        # Ví dụ: "Thế còn UIT?" -> Gemini phân loại A (vì không thấy từ khóa hỏi điểm)
        # nhưng ta biết đang nói về context cũ -> Ép về C
        analysis["intent"] = "C"
        
    if context_used:
        print(f"🔄 Enriched Analysis via Context: {analysis}")
        
    return analysis


# =====================================================================
# 3. RESOLVE SCHOOL CODE (Fuzzy matching tên trường → ma_truong)
# =====================================================================
def resolve_school_code(raw_name):
    """Chuyển tên trường bất kỳ thành ma_truong chuẩn."""
    if not raw_name:
        return None

    # Bảo vệ: nếu vô tình truyền list thay vì string → lấy phần tử đầu tiên
    if isinstance(raw_name, list):
        raw_name = raw_name[0] if raw_name else None
    if not raw_name:
        return None

    name_lower = raw_name.lower().strip()

    
    # Kiểm tra trực tiếp là ma_truong
    if name_lower.upper() in SCHOOL_NAMES:
        return name_lower.upper()
    
    # Tìm trong alias
    if name_lower in SCHOOL_ALIASES:
        return SCHOOL_ALIASES[name_lower]
    
    # Tìm partial match
    for alias, code in SCHOOL_ALIASES.items():
        if alias in name_lower or name_lower in alias:
            return code
    
    # Tìm trong tên đầy đủ
    for code, full_name in SCHOOL_NAMES.items():
        if name_lower in full_name.lower() or full_name.lower() in name_lower:
            return code
    
    return None  # Không tìm thấy → sẽ fallback sang Google Search


# =====================================================================
# 4. BUILD USER CONTEXT (Hồ sơ cá nhân hóa từ Firestore)
# =====================================================================
def build_user_context(uid):
    """Đọc hồ sơ user từ Firestore và tạo chuỗi context."""
    if not uid:
        return ""
    
    try:
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            return ""
        
        u = doc.to_dict()
        ac = u.get("academic", {})
        pr = u.get("preferences", {})
        profile = u.get("profile", {})
        scores = ac.get("scores", {})
        
        # Tính điểm các tổ hợp phổ biến
        combo_scores = {}
        for combo_name, subjects in TO_HOP_MAP.items():
            subject_scores = [scores.get(s) for s in subjects]
            if all(s is not None for s in subject_scores):
                combo_scores[combo_name] = round(sum(subject_scores), 2)
        
        combo_str = ", ".join([f"{k}: {v}" for k, v in combo_scores.items()]) if combo_scores else "chưa nhập điểm"
        
        # Ưu tiên khu vực
        priority_map = {"1": "+0.75", "2": "+0.5", "2NT": "+0.25", "3": "+0"}
        priority = profile.get("priorityArea", "3")
        priority_bonus = priority_map.get(str(priority), "+0")
        
        groups = ac.get("academicGroups", [])
        interests = pr.get("interestedMajorGroups", [])
        career = pr.get("careerObjective", "chưa chọn")
        uni_prefs = pr.get("universityPrefs", {})
        
        context = f"""=== HỒ SƠ HỌC SINH ===
Lớp: {ac.get('currentGrade', 'chưa cung cấp')}
Tỉnh/thành: {profile.get('province', 'chưa cung cấp')}
Khu vực ưu tiên: KV{priority} ({priority_bonus} điểm)
Tổ hợp đăng ký: {', '.join(groups) if groups else 'chưa chọn'}
Điểm tổ hợp: {combo_str}
Điểm ĐGNL HCM: {ac.get('competencyScoreHcm') or 'chưa nhập'}
Điểm ĐGNL HN: {ac.get('competencyScoreHn') or 'chưa nhập'}
IELTS: {ac.get('ieltsScore') or 'chưa nhập'}
Nhóm ngành quan tâm: {', '.join(interests) if interests else 'chưa chọn'}
Mục tiêu nghề nghiệp: {career}
Loại trường ưu tiên: {', '.join(uni_prefs.get('universityTypes', [])) or 'tất cả'}
Khu vực ưu tiên: {uni_prefs.get('preferredRegion') or 'tất cả'}
Học phí tối đa: {str(uni_prefs.get('maxTuitionPerYear')) + ' triệu/năm' if uni_prefs.get('maxTuitionPerYear') else 'không giới hạn'}"""

        # Thêm Gợi ý chủ động (Proactive Suggestion) dựa trên hoạt động
        activity = u.get("activity", {})
        viewed_unis = activity.get("viewedUniversities", [])
        top_viewed = None
        
        # Tìm trường xem nhiều nhất (>= 3 lần)
        max_views = 2 
        for uni in viewed_unis:
            if uni.get("viewCount", 0) > max_views:
                max_views = uni.get("viewCount")
                top_viewed = uni.get("universityName") or uni.get("universityId")
                
        if top_viewed:
            context += f"\n\n🚨 LƯU Ý HÀNH VI ĐẶC BIÊT: Học sinh này đang rất quan tâm và liên tục xem thông tin về trường **{top_viewed}**. Trong quá trình tư vấn, hãy tìm cách CHỦ ĐỘNG GỢI Ý cực kỳ tự nhiên kiểu như: 'Mình thấy bạn có vẻ khá quan tâm đến trường {top_viewed}, bạn có muốn mình phân tích sâu hơn cơ hội đậu của bạn vào trường này dựa trên điểm số hiện tại không?'"

        print(f"📋 User context loaded for uid={uid[:8]}...")
        return context
    except Exception as e:
        print(f"⚠️ Error loading user context: {e}")
        return ""


# =====================================================================
# 5. QUERY FIRESTORE (Lấy dữ liệu trường/ngành)
# =====================================================================
def get_school_full_data(school_code):
    """Lấy toàn bộ data của 1 trường từ Firestore."""
    doc_ref = db.collection("schools").document(school_code)
    doc = doc_ref.get()
    if not doc.exists:
        return None
    
    data = doc.to_dict()
    nganh_docs = doc_ref.collection("nganh_hoc").stream()
    data["nganh_hoc"] = [n.to_dict() for n in nganh_docs]
    return data


def compare_raw_scores(uid, nganh_tim_thay_list):
    """
    So sánh điểm THPT (raw) của user với điểm chuẩn các ngành tìm thấy.
    Tính toán chênh lệch và đính kèm vào dữ liệu để LLM dễ nhận định.
    """
    if not uid or not nganh_tim_thay_list:
        return nganh_tim_thay_list
        
    try:
        doc_ref = db.collection("users").document(uid)
        doc = doc_ref.get()
        if not doc.exists:
            return nganh_tim_thay_list
            
        u = doc.to_dict()
        scores = u.get("academic", {}).get("scores", {})
        
        # Lặp qua các ngành để bổ sung số liệu so sánh
        for nganh in nganh_tim_thay_list:
            
            # GTìm điểm THPT chuẩn (PT2)
            diem_chuan_thpt = None
            to_hop_list = []
            
            # Nếu phuong_thuc là dict đơn (do filter trên) -> chuyển thành list để chung logic
            pt_list = nganh.get("phuong_thuc_xet_tuyen", [])
            if "phuong_thuc" in nganh:
                pt_list = [nganh["phuong_thuc"]]
                
            for pt in pt_list:
                if pt.get("ma_phuong_thuc") == "PT2":
                    diem_chuan_thpt = pt.get("diem_chuan_2025")
                    to_hop_list = pt.get("to_hop", [])
                    break
                    
            if not diem_chuan_thpt or not to_hop_list:
                continue # Không có điểm chuẩn hoặc tổ hợp thì skip
                
            # Tìm điểm tổ hợp cao nhất của user trong các tổ hợp cho phép
            best_score = 0
            best_combo = None
            for combo in to_hop_list:
                subjects = TO_HOP_MAP.get(combo, [])
                subject_scores = [scores.get(s) for s in subjects]
                # Nếu đủ điểm 3 môn
                if all(s is not None for s in subject_scores):
                    total = sum(subject_scores)
                    if total > best_score:
                        best_score = total
                        best_combo = combo
                        
            # Gắn kết quả so sánh vào dữ liệu
            if best_score > 0:
                gap = best_score - diem_chuan_thpt
                gap_str = f"+{gap:.2f}" if gap >= 0 else f"{gap:.2f}"
                
                nganh["raw_compare"] = dict(
                    to_hop_tot_nhat=best_combo,
                    diem_cua_em=round(best_score, 2),
                    diem_chuan=diem_chuan_thpt,
                    chenh_lech=gap_str,
                    ket_luan="Nhiều khả năng đậu" if gap >= 0 else "Thiếu điểm (Cân nhắc kỹ)"
                )
                
    except Exception as e:
        print(f"⚠️ Error comparing raw scores: {e}")
        
    return nganh_tim_thay_list


def query_firestore_by_entities(entities, uid=None):
    """Query Firestore dựa trên entities đã trích xuất."""
    truong_raw = entities.get("truong")
    nganh_raw = entities.get("nganh")
    ma_phuong_thuc = entities.get("ma_phuong_thuc")  # Đã chuẩn hóa: PT1/PT2/PT3

    # Gemini trả về truong luôn là list → lấy phần tử đầu tiên nếu cần
    if isinstance(truong_raw, list):
        truong_raw = truong_raw[0] if truong_raw else None

    school_code = resolve_school_code(truong_raw)
    
    if not school_code:
        return None  # Trường không có trong DB → sẽ fallback
    
    school_data = get_school_full_data(school_code)
    if not school_data:
        return None
    
    result = {
        "ten_truong": SCHOOL_NAMES.get(school_code, school_code),
        "ma_truong": school_code,
        "loai": school_data.get("loai"),
        "tinh_thanh": school_data.get("tinh_thanh"),
        "website": school_data.get("website"),
        "hoc_phi": school_data.get("hoc_phi", []),
    }
    
    nganh_list = school_data.get("nganh_hoc", [])
    
    if nganh_raw:
        # Tìm ngành cụ thể
        matched = []
        for n in nganh_list:
            ten_nganh = n.get("ten_nganh", "").lower()
            if nganh_raw.lower() in ten_nganh or ten_nganh in nganh_raw.lower():
                # Filter phương thức bằng ma_phuong_thuc (chính xác, không substring match)
                if ma_phuong_thuc:
                    for pt in n.get("phuong_thuc_xet_tuyen", []):
                        if pt.get("ma_phuong_thuc") == ma_phuong_thuc:
                            matched.append({
                                "ten_nganh": n.get("ten_nganh"),
                                "ma_nganh": n.get("ma_nganh"),
                                "chi_tieu_2025": n.get("chi_tieu_2025"),
                                "muc_do_canh_tranh": n.get("muc_do_canh_tranh"),
                                "phuong_thuc": pt,
                                "nganh_nhom": n.get("nganh_nhom"),
                                "co_hoi_nghe_nghiep": n.get("co_hoi_nghe_nghiep", []),
                            })
                else:
                    matched.append({
                        "ten_nganh": n.get("ten_nganh"),
                        "ma_nganh": n.get("ma_nganh"),
                        "chi_tieu_2025": n.get("chi_tieu_2025"),
                        "muc_do_canh_tranh": n.get("muc_do_canh_tranh"),
                        "phuong_thuc_xet_tuyen": n.get("phuong_thuc_xet_tuyen", []),
                        "nganh_nhom": n.get("nganh_nhom"),
                        "co_hoi_nghe_nghiep": n.get("co_hoi_nghe_nghiep", []),
                    })
        result["nganh_tim_thay"] = compare_raw_scores(uid, matched)
    else:
        # Không chỉ định ngành → trả tổng quan trường
        result["tong_so_nganh"] = len(nganh_list)
        result["danh_sach_nganh"] = [
            {"ten_nganh": n.get("ten_nganh"), "ma_nganh": n.get("ma_nganh"), "muc_do_canh_tranh": n.get("muc_do_canh_tranh")}
            for n in nganh_list[:15]  # Giới hạn 15 ngành tránh context quá dài
        ]
    
    return result

def query_firestore_multi_school(entities, uid=None):
    """
    Query nhiều trường cùng lúc cho các câu hỏi so sánh (VD: BK vs UIT).
    Trả về list các trường hợp lệ.
    """
    truong_list_raw = entities.get("truong", [])
    if not truong_list_raw:
        return []
        
    results = []
    for t_raw in truong_list_raw:
        # Fake 1 entity đơn để dùng lại hàm cũ
        single_entity = entities.copy()
        single_entity["truong"] = t_raw
        
        data = query_firestore_by_entities(single_entity, uid)
        if data:
            results.append(data)
            
    return results


# =====================================================================
# 6. TÌM TRƯỜNG THEO NGÀNH (Type D)
# =====================================================================
def find_schools_by_major(major_keyword, uid=None, max_results=20):
    """Quét Firestore tìm trường có ngành matching, dừng khi đủ max_results."""
    print(f"⏳ Đang quét hệ thống tìm ngành '{major_keyword}'...")
    found = []
    
    schools = db.collection("schools").stream()
    for school_doc in schools:
        if len(found) >= max_results:
            break  # Đủ kết quả → dừng scan
        
        school_data = school_doc.to_dict()
        school_code = school_doc.id
        ten_truong = school_data.get("ten_truong", school_code)

        nganh_docs = db.collection("schools").document(school_code).collection("nganh_hoc").stream()
        for nganh_doc in nganh_docs:
            if len(found) >= max_results:
                break  # Đủ kết quả → dừng scan
            
            nganh = nganh_doc.to_dict()
            ten_nganh = nganh.get("ten_nganh", "")
            if major_keyword and major_keyword.lower() in ten_nganh.lower():
                # Lấy điểm chuẩn THPT (ma_phuong_thuc == PT2)
                diem_thpt = None
                for pt in nganh.get("phuong_thuc_xet_tuyen", []):
                    if pt.get("ma_phuong_thuc") == "PT2":
                        diem_thpt = pt.get("diem_chuan_2025")
                        break
                
                found.append({
                    "ten_truong": ten_truong,
                    "ma_truong": school_code,
                    "ten_nganh": ten_nganh,
                    "diem_chuan_thpt": diem_thpt,
                    "muc_do_canh_tranh": nganh.get("muc_do_canh_tranh"),
                })
    
    if not found:
        return None
        
    print(f"✅ Tìm thấy {len(found)} kết quả (giới hạn {max_results})")

    # Tính điểm ranking nếu có user_id
    if uid:
        try:
            doc = db.collection("users").document(uid).get()
            if doc.exists:
                user_data = doc.to_dict()
                activity = user_data.get("activity", {})
                prefs = user_data.get("profile", {}).get("universityPrefs", {})
                
                saved_items = activity.get("savedItems", [])
                viewed_unis = activity.get("viewedUniversities", [])
                pref_region = prefs.get("preferredRegion")
                
                # Pre-process sets/dicts for quick lookup
                saved_uni_ids = {item.get("universityId") for item in saved_items if item.get("type") == "university"}
                viewed_uni_map = {item.get("universityId"): item.get("viewCount", 0) for item in viewed_unis}

                for item in found:
                    score = 0
                    ma_truong = item["ma_truong"]
                    
                    # 1. Đã lưu/yêu thích
                    if ma_truong in saved_uni_ids:
                        score += 50
                        
                    # 2. Đã từng xem nhiều lần (max 30 điểm cho 3+ view)
                    view_count = viewed_uni_map.get(ma_truong, 0)
                    score += min(view_count * 10, 30)
                    
                    # 3. Phù hợp vùng miền
                    # Lưu ý: cần truyền thêm thông tin vùng miền vào find_schools_by_major lúc scan nếu muốn check chính xác.
                    # Ở đây ta giả sử ưu tiên điểm hành vi > điểm chuẩn
                    item["ranking_score"] = score
                    
        except Exception as e:
            print(f"⚠️ Lỗi khi tính ranking: {e}")
            for item in found:
                item["ranking_score"] = 0
    else:
        for item in found:
            item["ranking_score"] = 0

    # Sort ưu tiên ranking score trước, rồi đến điểm chuẩn tăng dần
    found.sort(key=lambda x: (-x.get("ranking_score", 0), x.get("diem_chuan_thpt") or 99))
    
    return found


# =====================================================================
# 6.5 RECOMMENDATION CACHING (Mới)
# =====================================================================
def cache_recommendation(uid, intent, analysis, result_data):
    """
    Lưu lại thông tin gợi ý hữu ích vào Firestore (user schema).
    Hỗ trợ frontend hiển thị tab "Gợi ý ngành nghề" nhanh chóng.
    """
    from datetime import datetime
    
    if not uid or not result_data:
        return
        
    try:
        user_ref = db.collection("users").document(uid)
        recomm_ref = user_ref.collection("recommendations")
        
        now = datetime.now()
        
        # Cache cho Type C: Có "raw_compare"
        # Type C trả về dict nếu queries 1 trường, hoặc list các dict nếu queries nhiều trường
        if intent == "C":
            
            # Chuẩn hóa để duyệt qua danh sách trường
            tr_list = result_data if isinstance(result_data, list) else [result_data]
            
            for tr in tr_list:
                ma_truong = tr.get("ma_truong")
                ten_truong = tr.get("ten_truong")
                nganh_tim_thay = tr.get("nganh_tim_thay", [])
                
                for nganh in nganh_tim_thay:
                    if "raw_compare" in nganh:
                        rc = nganh["raw_compare"]
                        # Chỉ lưu nếu chênh lệch >= -3 điểm (có cơ hội)
                        # Gap có thể là chuỗi string "+1.50" hoặc "-2.00"
                        gap_str = rc.get("chenh_lech", "0")
                        try:
                            gap = float(gap_str.replace("+", ""))
                            if gap >= -3.0:
                                match_score = min(100, max(50, 80 + gap * 5)) # Giả lập điểm phù hợp %
                                
                                doc_id = f"{ma_truong}_{nganh.get('ma_nganh')}"
                                recomm_ref.document(doc_id).set({
                                    "majorId": nganh.get("ma_nganh"),
                                    "majorName": nganh.get("ten_nganh"),
                                    "universityId": ma_truong,
                                    "universityName": ten_truong,
                                    "matchScore": int(match_score),
                                    "reason": f"Chênh lệch điểm chuẩn: {gap_str}",
                                    "suggestedAt": now
                                })
                        except:
                            pass
                            
        # Cache cho Type D: Lưu top 3 kết quả ranking tốt nhất
        elif intent == "D":
            # result_data ở type D là List của found items
            top_3 = result_data[:3]
            for item in top_3:
                doc_id = f"{item['ma_truong']}_{item['ten_nganh'].replace(' ', '')}"
                recomm_ref.document(doc_id).set({
                    "majorId": None, # Không có sẵn trong search result
                    "majorName": item["ten_nganh"],
                    "universityId": item["ma_truong"],
                    "universityName": item["ten_truong"],
                    "matchScore": 85, # Default cho Type D behavior
                    "reason": f"Dựa trên các trường và ngành bạn từng quan tâm",
                    "suggestedAt": now
                })
                
        print(f"💾 Đã lưu cache recommendation cho uid={uid[:8]}")
    except Exception as e:
        print(f"⚠️ Lỗi lưu cache recommendation: {e}")


# =====================================================================
# 6.6 CONVERSATION SUMMARIZER (Mới - Chạy ngầm)
# =====================================================================
def summarize_session_background(uid, chat_history):
    """
    Tóm tắt ngữ cảnh trò chuyện gần đây lưu vào Firebase để giữ insight.
    Chạy background để không làm chậm response trả về cho user.
    """
    if not uid or not chat_history or len(chat_history) < 2:
        return
        
    try:
        # Lấy 6 đoạn thoại gần nhất (3 cặp hỏi đáp)
        recent_turns = chat_history[-6:]
        lines = []
        for msg in recent_turns:
            role = "Học sinh" if msg.get("role") == "user" else "ChatNPT"
            lines.append(f"{role}: {msg.get('content')}")
            
        history_text = "\n".join(lines)
        
        prompt = f"""Dựa vào lịch sử trò chuyện ngắn sau đây:
{history_text}

Hãy tóm tắt thật ngắn gọn (1-2 câu) nội dung chính, hoặc mục tiêu, hoặc nỗi băn khoăn lớn nhất của học sinh hiện tại. 
Ví dụ: "Học sinh đang phân vân giữa ngành CNTT trường Bách Khoa và KHTN, lo lắng về mức học phí."
Trả về chỉ câu tóm tắt, không có lời mở đầu hay giải thích gì thêm."""

        response = client.models.generate_content(
            model="gemini-2.5-flash", 
            contents=prompt,
            config=types.GenerateContentConfig(temperature=0.2)
        )
        summary = response.text.strip()
        
        # Cập nhật vào DB
        if summary:
            user_ref = db.collection("users").document(uid)
            user_ref.set({
                "activity": {
                    "recentSessionSummary": summary
                }
            }, merge=True)
            print(f"📝 Đã tóm tắt session cho uid={uid[:8]}: {summary}")
            
    except Exception as e:
        print(f"⚠️ Error in session summarization: {e}")


# =====================================================================
# 7. HELPER: Format lịch sử chat cho prompt
# =====================================================================
def format_chat_history(history, max_turns=5):
    """Format N lượt gần nhất thành chuỗi cho prompt."""
    if not history:
        return ""
    
    # Giữ max_turns lượt gần nhất (mỗi lượt = 1 user + 1 assistant)
    recent = history[-(max_turns * 2):]
    lines = []
    for msg in recent:
        role = msg.get("role", "user")
        content = msg.get("content", "")
        if role == "user":
            lines.append(f"Học sinh: {content}")
        else:
            lines.append(f"ChatNPT: {content}")
    
    return "=== LỊCH SỬ TRÒ CHUYỆN (gần nhất) ===\n" + "\n".join(lines)


# =====================================================================
# 8. GENERATION FUNCTIONS (có chat history)
# =====================================================================
def generate_type_A(question, user_context, chat_history=None):
    """Type A: Hướng nghiệp — Gemini + Profile Context + History."""
    prompt = SYSTEM_PROMPT
    if user_context:
        prompt += f"\n\n{user_context}"
    history_str = format_chat_history(chat_history)
    if history_str:
        prompt += f"\n\n{history_str}"
    prompt += f"\n\nCâu hỏi hiện tại: {question}"
    
    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return response.text


def generate_type_B(question, chat_history=None):
    """Type B: Lịch tuyển sinh — Gemini + Google Search Grounding + History."""
    history_str = format_chat_history(chat_history)
    prompt = f"""{SYSTEM_PROMPT}
{history_str}

Câu hỏi cần tìm kiếm thông tin cập nhật trên Internet: "{question}"
Hãy tìm và trả lời dựa trên thông tin mới nhất."""
    
    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
    )
    return response.text


def generate_type_C(question, firestore_data, user_context="", chat_history=None):
    """Type C: Điểm chuẩn/So sánh — Gemini + Firestore Data + Profile + History."""
    context_json = json.dumps(firestore_data, ensure_ascii=False, indent=2)
    
    prompt = SYSTEM_PROMPT
    if user_context:
        prompt += f"\n\n{user_context}"
    history_str = format_chat_history(chat_history)
    if history_str:
        prompt += f"\n\n{history_str}"
        
    # Thêm gợi ý so sánh nếu có nhiều trường
    compare_hint = ""
    if isinstance(firestore_data, list) and len(firestore_data) > 1:
        compare_hint = "\n⚠️ CÓ NHIỀU TRƯỜNG ĐƯỢC NHẮC ĐẾN. Hãy SO SÁNH rõ ràng giữa các trường về điểm chuẩn, cơ hội việc làm, học phí. Trình bày dạng bảng nếu phù hợp để học sinh dễ nhìn."

    prompt += f"""

=== DỮ LIỆU TỪ HỆ THỐNG (FIRESTORE) ===
{context_json}
{compare_hint}

Câu hỏi hiện tại: {question}

LƯU Ý QUAN TRỌNG VỀ ĐIỂM: 
- Nếu trong DỮ LIỆU có thuộc tính "raw_compare", hãy CHỈ sử dụng thông tin và kết luận ('ket_luan') từ đó để tư vấn (không tự làm toán cộng trừ điểm).
- NHỚ THÊM DISCLAIMER: "Đây chỉ là mức so sánh tham khảo dựa trên điểm quy chuẩn THPT môn tổ hợp, mỗi phương thức hệ thống trường sẽ tính khác nhau."
- Chỉ dựa vào profile user để tư vấn hướng nghiệp/sở thích (nếu có). Tránh để LLM phân tích khả năng điểm chuẩn nếu đã có `raw_compare`."""

    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return response.text


def generate_type_C_fallback(question, chat_history=None):
    """Type C Fallback: Trường không có trong DB → dùng Google Search + History."""
    history_str = format_chat_history(chat_history)
    prompt = f"""{SYSTEM_PROMPT}
{history_str}

⚠️ Trường được hỏi KHÔNG có trong cơ sở dữ liệu 46 trường của hệ thống.
Hãy tìm kiếm trên Internet để trả lời, kèm disclaimer:
"⚠️ Thông tin này được tìm từ Internet và có thể chưa chính xác 100%. Vui lòng kiểm tra lại tại website chính thức của trường."

Câu hỏi: "{question}" """

    response = client.models.generate_content(
        model="gemini-2.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            tools=[types.Tool(google_search=types.GoogleSearch())]
        )
    )
    return response.text


def generate_type_D(question, found_schools, user_context="", chat_history=None):
    """Type D: Tìm trường theo ngành — Gemini + danh sách trường + History."""
    context_json = json.dumps(found_schools, ensure_ascii=False, indent=2)
    
    prompt = SYSTEM_PROMPT
    if user_context:
        prompt += f"\n\n{user_context}"
    history_str = format_chat_history(chat_history)
    if history_str:
        prompt += f"\n\n{history_str}"
    prompt += f"""

=== DANH SÁCH TRƯỜNG ĐÀO TẠO NGÀNH NÀY ===
{context_json}

Câu hỏi hiện tại: {question}

Hãy trình bày danh sách trường rõ ràng, kèm điểm chuẩn THPT nếu có. Nếu user có hồ sơ, hãy gợi ý trường phù hợp nhất."""

    response = client.models.generate_content(model="gemini-2.5-flash", contents=prompt)
    return response.text
