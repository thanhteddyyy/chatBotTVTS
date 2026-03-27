// lib/firestore-helpers.ts — Hàm đọc/ghi Firestore theo user_schema_v2
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/utils/firebase";
import type { UserScores, UserGpa } from "@/lib/constants";

// ===== KHỞI TẠO DOCUMENT MỚI KHI ĐĂNG NHẬP LẦN ĐẦU =====
export async function initUserDocument(user: { uid: string; displayName?: string | null; photoURL?: string | null }) {
  const ref = doc(db, "users", user.uid);
  const snap = await getDoc(ref);

  if (snap.exists()) return false; // Đã có, bỏ qua

  await setDoc(ref, {
    uid: user.uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
    lastActiveAt: serverTimestamp(),

    profile: {
      aiContextSummary: null,
      displayName: user.displayName ?? null,
      avatarUrl: user.photoURL ?? null,
      gender: null,
      birthYear: null,
      province: null,
      priorityArea: null,
      priorityObject: null,
    },

    academic: {
      currentGrade: null,
      graduationYear: null,
      schoolName: null,
      academicGroups: [],
      scores: { toan: null, nguVan: null, tiengAnh: null, vatLy: null, hoaHoc: null, sinhHoc: null, lichSu: null, diaLy: null, gdktpl: null, tin: null },
      gpa10: { toan: null, nguVan: null, tiengAnh: null, vatLy: null, hoaHoc: null, sinhHoc: null, lichSu: null, diaLy: null, overall: null },
      gpa11: { toan: null, nguVan: null, tiengAnh: null, vatLy: null, hoaHoc: null, sinhHoc: null, lichSu: null, diaLy: null, overall: null },
      gpa12: { toan: null, nguVan: null, tiengAnh: null, vatLy: null, hoaHoc: null, sinhHoc: null, lichSu: null, diaLy: null, overall: null },
      competencyScoreHcm: null,
      competencyScoreHn: null,
      aptitudeScoreHust: null,
      ieltsScore: null,
      otherCertificates: [],
    },

    preferences: {
      interestedMajorGroups: [],
      careerGoals: [],
      strengths: [],
      careerObjective: null,
      universityPrefs: {
        universityTypes: [],
        preferredRegion: null,
        maxTuitionPerYear: null,
        distancePriority: false,
      },
    },

    activity: {
      viewedUniversities: [],
      viewedMajors: [],
      savedItems: [],
      chatSessions: [],
    },

    recommendations: {
      majors: [],
      universities: [],
    },

    settings: {
      language: "vi",
      notifications: true,
      darkMode: false,
      onboardingDone: false,
    },
  });

  return true; // Mới tạo
}

// ===== KIỂM TRA ONBOARDING =====
export async function checkOnboardingDone(uid: string): Promise<boolean> {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return false;
  return snap.data()?.settings?.onboardingDone === true;
}

// ===== ONBOARDING STEP 1 =====
export async function saveOnboardingStep1(
  uid: string,
  data: { currentGrade: string; province: string; priorityArea: string; schoolName?: string }
) {
  await updateDoc(doc(db, "users", uid), {
    "academic.currentGrade": data.currentGrade,
    "academic.schoolName": data.schoolName ?? null,
    "profile.province": data.province,
    "profile.priorityArea": data.priorityArea,
    updatedAt: serverTimestamp(),
  });
}

// ===== ONBOARDING STEP 2 =====
export async function saveOnboardingStep2(
  uid: string,
  data: { academicGroups: string[]; interestedMajorGroups: string[] }
) {
  await updateDoc(doc(db, "users", uid), {
    "academic.academicGroups": data.academicGroups,
    "preferences.interestedMajorGroups": data.interestedMajorGroups,
    updatedAt: serverTimestamp(),
  });
}

// ===== ONBOARDING STEP 3 =====
export async function saveOnboardingStep3(
  uid: string,
  data: {
    careerObjective: string | null;
    universityTypes: string[];
    preferredRegion: string | null;
    maxTuitionPerYear: number | null;
    distancePriority: boolean;
  }
) {
  await updateDoc(doc(db, "users", uid), {
    "preferences.careerObjective": data.careerObjective,
    "preferences.universityPrefs.universityTypes": data.universityTypes,
    "preferences.universityPrefs.preferredRegion": data.preferredRegion,
    "preferences.universityPrefs.maxTuitionPerYear": data.maxTuitionPerYear,
    "preferences.universityPrefs.distancePriority": data.distancePriority,
    updatedAt: serverTimestamp(),
  });
}

// ===== HOÀN THÀNH ONBOARDING =====
export async function completeOnboarding(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    "settings.onboardingDone": true,
    updatedAt: serverTimestamp(),
  });
}

// ===== LƯU ĐIỂM THI THPT =====
export async function saveThptScores(uid: string, scores: Partial<UserScores>) {
  const updates: Record<string, any> = {};
  Object.entries(scores).forEach(([mon, diem]) => {
    updates[`academic.scores.${mon}`] = diem ?? null;
  });
  updates["updatedAt"] = serverTimestamp();
  await updateDoc(doc(db, "users", uid), updates);
}

// ===== LƯU ĐIỂM HỌC BẠ =====
export async function saveGpaScores(uid: string, year: "gpa10" | "gpa11" | "gpa12", scores: Partial<UserGpa>) {
  const updates: Record<string, any> = {};
  Object.entries(scores).forEach(([mon, diem]) => {
    updates[`academic.${year}.${mon}`] = diem ?? null;
  });
  updates["updatedAt"] = serverTimestamp();
  await updateDoc(doc(db, "users", uid), updates);
}

// ===== LƯU ĐIỂM NĂNG LỰC & CHỨNG CHỈ =====
export async function saveCompetencyScores(
  uid: string,
  data: {
    competencyScoreHcm?: number | null;
    competencyScoreHn?: number | null;
    aptitudeScoreHust?: number | null;
    ieltsScore?: number | null;
    otherCertificates?: string[];
  }
) {
  const updates: Record<string, any> = { updatedAt: serverTimestamp() };

  if (data.competencyScoreHcm !== undefined) updates["academic.competencyScoreHcm"] = data.competencyScoreHcm;
  if (data.competencyScoreHn !== undefined) updates["academic.competencyScoreHn"] = data.competencyScoreHn;
  if (data.aptitudeScoreHust !== undefined) updates["academic.aptitudeScoreHust"] = data.aptitudeScoreHust;
  if (data.ieltsScore !== undefined) updates["academic.ieltsScore"] = data.ieltsScore;
  if (data.otherCertificates !== undefined) updates["academic.otherCertificates"] = data.otherCertificates;

  await updateDoc(doc(db, "users", uid), updates);
}

// ===== LƯU THÔNG TIN CÁ NHÂN =====
export async function saveProfileInfo(
  uid: string,
  data: {
    displayName?: string | null;
    gender?: string | null;
    birthYear?: number | null;
    province?: string | null;
    priorityArea?: string | null;
    priorityObject?: string | null;
  }
) {
  const updates: Record<string, any> = { updatedAt: serverTimestamp() };

  if (data.displayName !== undefined) updates["profile.displayName"] = data.displayName;
  if (data.gender !== undefined) updates["profile.gender"] = data.gender;
  if (data.birthYear !== undefined) updates["profile.birthYear"] = data.birthYear;
  if (data.province !== undefined) updates["profile.province"] = data.province;
  if (data.priorityArea !== undefined) updates["profile.priorityArea"] = data.priorityArea;
  if (data.priorityObject !== undefined) updates["profile.priorityObject"] = data.priorityObject;

  await updateDoc(doc(db, "users", uid), updates);
}

// ===== LƯU SỞ THÍCH =====
export async function savePreferences(
  uid: string,
  data: {
    interestedMajorGroups?: string[];
    careerGoals?: string[];
    strengths?: string[];
    careerObjective?: string | null;
    universityPrefs?: {
      universityTypes: string[];
      preferredRegion: string | null;
      maxTuitionPerYear: number | null;
      distancePriority: boolean;
    };
  }
) {
  const updates: Record<string, any> = { updatedAt: serverTimestamp() };

  if (data.interestedMajorGroups !== undefined) updates["preferences.interestedMajorGroups"] = data.interestedMajorGroups;
  if (data.careerGoals !== undefined) updates["preferences.careerGoals"] = data.careerGoals;
  if (data.strengths !== undefined) updates["preferences.strengths"] = data.strengths;
  if (data.careerObjective !== undefined) updates["preferences.careerObjective"] = data.careerObjective;
  if (data.universityPrefs) {
    updates["preferences.universityPrefs.universityTypes"] = data.universityPrefs.universityTypes;
    updates["preferences.universityPrefs.preferredRegion"] = data.universityPrefs.preferredRegion;
    updates["preferences.universityPrefs.maxTuitionPerYear"] = data.universityPrefs.maxTuitionPerYear;
    updates["preferences.universityPrefs.distancePriority"] = data.universityPrefs.distancePriority;
  }

  await updateDoc(doc(db, "users", uid), updates);
}

// ===== ĐỌC TOÀN BỘ PROFILE =====
export async function getUserProfile(uid: string) {
  const snap = await getDoc(doc(db, "users", uid));
  if (!snap.exists()) return null;
  return snap.data();
}

// ===== CẬP NHẬT LAST ACTIVE =====
export async function updateLastActive(uid: string) {
  await updateDoc(doc(db, "users", uid), {
    lastActiveAt: serverTimestamp(),
  });
}
