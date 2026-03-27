// lib/constants.ts — Hằng số dùng cho onboarding & profile forms

// ===== DANH SÁCH 63 TỈNH/THÀNH =====
export const PROVINCES = [
  "An Giang", "Bà Rịa - Vũng Tàu", "Bạc Liêu", "Bắc Giang", "Bắc Kạn",
  "Bắc Ninh", "Bến Tre", "Bình Dương", "Bình Định", "Bình Phước",
  "Bình Thuận", "Cà Mau", "Cao Bằng", "Cần Thơ", "Đà Nẵng",
  "Đắk Lắk", "Đắk Nông", "Điện Biên", "Đồng Nai", "Đồng Tháp",
  "Gia Lai", "Hà Giang", "Hà Nam", "Hà Nội", "Hà Tĩnh",
  "Hải Dương", "Hải Phòng", "Hậu Giang", "Hòa Bình", "Hưng Yên",
  "Khánh Hòa", "Kiên Giang", "Kon Tum", "Lai Châu", "Lâm Đồng",
  "Lạng Sơn", "Lào Cai", "Long An", "Nam Định", "Nghệ An",
  "Ninh Bình", "Ninh Thuận", "Phú Thọ", "Phú Yên", "Quảng Bình",
  "Quảng Nam", "Quảng Ngãi", "Quảng Ninh", "Quảng Trị", "Sóc Trăng",
  "Sơn La", "Tây Ninh", "Thái Bình", "Thái Nguyên", "Thanh Hóa",
  "Thừa Thiên Huế", "Tiền Giang", "TP. Hồ Chí Minh", "Trà Vinh", "Tuyên Quang",
  "Vĩnh Long", "Vĩnh Phúc", "Yên Bái",
];

// ===== KHU VỰC ƯU TIÊN =====
export const PRIORITY_AREAS = [
  { value: "1", label: "KV1 (+0.75 điểm)" },
  { value: "2", label: "KV2 (+0.50 điểm)" },
  { value: "2NT", label: "KV2-NT (+0.25 điểm)" },
  { value: "3", label: "KV3 (không cộng)" },
];

// ===== ĐỐI TƯỢNG ƯU TIÊN =====
export const PRIORITY_OBJECTS = [
  { value: "01", label: "ĐT 01" },
  { value: "02", label: "ĐT 02" },
  { value: "03", label: "ĐT 03" },
  { value: "04", label: "ĐT 04" },
  { value: "05", label: "ĐT 05" },
  { value: "06", label: "ĐT 06" },
  { value: "07", label: "ĐT 07" },
];

// ===== LỚP HỌC =====
export const GRADE_OPTIONS = [
  { value: "10", label: "Lớp 10" },
  { value: "11", label: "Lớp 11" },
  { value: "12", label: "Lớp 12" },
  { value: "graduated", label: "Đã tốt nghiệp" },
];

// ===== TOÀN BỘ TỔ HỢP MÔN =====
export const ACADEMIC_GROUPS = [
  // Khối A
  "A00", "A01", "A02", "A03", "A04", "A05", "A06", "A07", "A08", "A09", "A10", "A11", "A12", "A14", "A15", "A16", "A17", "A18",
  // Khối B
  "B00", "B01", "B02", "B03", "B04", "B05", "B08",
  // Khối C
  "C00", "C01", "C02", "C03", "C04", "C05", "C06", "C07", "C08", "C09", "C10", "C13", "C14", "C15", "C16", "C19", "C20",
  // Khối D
  "D01", "D02", "D03", "D04", "D05", "D06", "D07", "D08", "D09", "D10", "D11", "D12", "D13", "D14", "D15",
  "D16", "D17", "D18", "D19", "D20", "D21", "D22", "D23", "D24", "D25", "D26", "D27", "D28", "D29",
  "D66", "D72", "D78", "D84", "D90", "D96",
  // Khối V, H, R, M, N, T, S, K
  "V00", "V01", "V02", "V03", "V06", "V08", "V10", "V11",
  "H00", "H01", "H02", "H06", "H07", "H08",
  "R00", "R01",
  "M00", "M01", "M02",
  "N00", "N01", "N02",
  "T00", "T01", "T02",
  "S00",
  "K01",
];

// ===== TỔ HỢP MÔN CHI TIẾT =====
export const ACADEMIC_GROUP_DETAILS: Record<string, string[]> = {
  A00: ["Toán", "Vật lý", "Hóa học"],
  A01: ["Toán", "Vật lý", "Tiếng Anh"],
  A02: ["Toán", "Vật lý", "Sinh học"],
  B00: ["Toán", "Hóa học", "Sinh học"],
  C00: ["Ngữ văn", "Lịch sử", "Địa lý"],
  D01: ["Toán", "Ngữ văn", "Tiếng Anh"],
  D07: ["Toán", "Hóa học", "Tiếng Anh"],
  D08: ["Toán", "Sinh học", "Tiếng Anh"],
  D14: ["Ngữ văn", "Lịch sử", "Tiếng Anh"],
  D15: ["Ngữ văn", "Địa lí", "Tiếng Anh"],
};

// ===== 16 NHÓM NGÀNH =====
export const MAJOR_GROUPS = [
  "Công nghệ thông tin - Kỹ thuật số",
  "Kinh tế - Tài chính - Ngân hàng",
  "Kế toán - Kiểm toán",
  "Quản trị - Marketing - Thương mại",
  "Luật - Chính sách - Quản lý công",
  "Y Dược - Sức khỏe",
  "Sư phạm - Giáo dục",
  "Nghệ thuật - Thiết kế - Truyền thông",
  "Kỹ thuật - Xây dựng - Kiến trúc",
  "Khoa học xã hội - Nhân văn",
  "Ngôn ngữ - Quan hệ quốc tế",
  "Du lịch - Khách sạn - Dịch vụ",
  "Nông - Lâm - Thủy sản",
  "Logistics - Chuỗi cung ứng - Ngoại thương",
  "Khoa học dữ liệu - Thống kê",
  "Khoa học tự nhiên - Môi trường",
];

// ===== MỤC TIÊU NGHỀ NGHIỆP =====
export const CAREER_OBJECTIVES = [
  { value: "startup", label: "Khởi nghiệp" },
  { value: "corporate", label: "Làm công ty tư nhân" },
  { value: "government", label: "Làm nhà nước" },
  { value: "study_abroad", label: "Du học" },
  { value: "freelance", label: "Tự do / Freelance" },
];

// ===== LOẠI TRƯỜNG =====
export const UNIVERSITY_TYPES = [
  { value: "Công lập", label: "Công lập" },
  { value: "Tư thục", label: "Tư thục" },
];

// ===== KHU VỰC TRƯỜNG =====
export const PREFERRED_REGIONS = [
  { value: "Nam", label: "Miền Nam" },
  { value: "Trung", label: "Miền Trung" },
  { value: "Bắc", label: "Miền Bắc" },
];

// ===== DANH SÁCH MÔN HỌC =====
export const SCORE_SUBJECTS = [
  { key: "toan", label: "Toán" },
  { key: "nguVan", label: "Ngữ văn" },
  { key: "tiengAnh", label: "Tiếng Anh" },
  { key: "vatLy", label: "Vật lý" },
  { key: "hoaHoc", label: "Hóa học" },
  { key: "sinhHoc", label: "Sinh học" },
  { key: "lichSu", label: "Lịch sử" },
  { key: "diaLy", label: "Địa lý" },
  { key: "gdktpl", label: "GDKT&PL" },
  { key: "tin", label: "Tin học" },
];

// Môn học cho điểm học bạ (có thêm overall)
export const GPA_SUBJECTS = [
  ...SCORE_SUBJECTS.filter(s => s.key !== "gdktpl" && s.key !== "tin"),
  { key: "overall", label: "TB chung" },
];

// ===== GIỚI TÍNH =====
export const GENDER_OPTIONS = [
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "other", label: "Khác" },
];

// ===== TypeScript Interfaces =====
export interface UserScores {
  toan: number | null;
  nguVan: number | null;
  tiengAnh: number | null;
  vatLy: number | null;
  hoaHoc: number | null;
  sinhHoc: number | null;
  lichSu: number | null;
  diaLy: number | null;
  gdktpl: number | null;
  tin: number | null;
}

export interface UserGpa {
  toan: number | null;
  nguVan: number | null;
  tiengAnh: number | null;
  vatLy: number | null;
  hoaHoc: number | null;
  sinhHoc: number | null;
  lichSu: number | null;
  diaLy: number | null;
  overall: number | null;
}

export interface UniversityPrefs {
  universityTypes: string[];
  preferredRegion: string | null;
  maxTuitionPerYear: number | null;
  distancePriority: boolean;
}

export interface UserProfile {
  uid: string;
  createdAt: any;
  updatedAt: any;
  lastActiveAt: any;
  profile: {
    aiContextSummary: string | null;
    displayName: string | null;
    avatarUrl: string | null;
    gender: string | null;
    birthYear: number | null;
    province: string | null;
    priorityArea: string | null;
    priorityObject: string | null;
  };
  academic: {
    currentGrade: string | null;
    graduationYear: number | null;
    schoolName: string | null;
    academicGroups: string[];
    scores: UserScores;
    gpa10: UserGpa;
    gpa11: UserGpa;
    gpa12: UserGpa;
    competencyScoreHcm: number | null;
    competencyScoreHn: number | null;
    aptitudeScoreHust: number | null;
    ieltsScore: number | null;
    otherCertificates: string[];
  };
  preferences: {
    interestedMajorGroups: string[];
    careerGoals: string[];
    strengths: string[];
    careerObjective: string | null;
    universityPrefs: UniversityPrefs;
  };
  activity: {
    viewedUniversities: any[];
    viewedMajors: any[];
    savedItems: any[];
    chatSessions: any[];
  };
  recommendations: {
    majors: any[];
    universities: any[];
  };
  settings: {
    language: string;
    notifications: boolean;
    darkMode: boolean;
    onboardingDone: boolean;
  };
}
