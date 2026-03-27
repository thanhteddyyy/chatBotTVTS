// app/onboarding/page.tsx — Onboarding bắt buộc 3 bước
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { auth } from "@/utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  saveOnboardingStep1,
  saveOnboardingStep2,
  saveOnboardingStep3,
  completeOnboarding,
  checkOnboardingDone,
} from "@/lib/firestore-helpers";
import {
  PROVINCES,
  PRIORITY_AREAS,
  GRADE_OPTIONS,
  ACADEMIC_GROUPS,
  MAJOR_GROUPS,
  CAREER_OBJECTIVES,
  UNIVERSITY_TYPES,
  PREFERRED_REGIONS,
} from "@/lib/constants";
import Image from "next/image";

export default function OnboardingPage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Step 1 state
  const [currentGrade, setCurrentGrade] = useState("");
  const [province, setProvince] = useState("");
  const [priorityArea, setPriorityArea] = useState("");
  const [schoolName, setSchoolName] = useState("");

  // Step 2 state
  const [academicGroups, setAcademicGroups] = useState<string[]>([]);
  const [interestedMajorGroups, setInterestedMajorGroups] = useState<string[]>([]);
  const [groupSearch, setGroupSearch] = useState("");

  // Step 3 state
  const [careerObjective, setCareerObjective] = useState<string | null>(null);
  const [universityTypes, setUniversityTypes] = useState<string[]>([]);
  const [preferredRegion, setPreferredRegion] = useState<string | null>(null);
  const [maxTuition, setMaxTuition] = useState("");
  const [distancePriority, setDistancePriority] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        router.push("/");
        return;
      }
      setUid(user.uid);
      // Nếu đã hoàn thành onboarding → chuyển chat
      const done = await checkOnboardingDone(user.uid);
      if (done) router.push("/chat");
    });
    return () => unsubscribe();
  }, [router]);

  const toggleArrayItem = (arr: string[], item: string, setter: (v: string[]) => void, max?: number) => {
    if (arr.includes(item)) {
      setter(arr.filter((i) => i !== item));
    } else {
      if (max && arr.length >= max) return;
      setter([...arr, item]);
    }
  };

  const handleNext = async () => {
    if (!uid) return;
    setSaving(true);
    setError("");

    try {
      if (step === 1) {
        if (!currentGrade || !province || !priorityArea) {
          setError("Vui lòng điền đầy đủ thông tin bắt buộc");
          setSaving(false);
          return;
        }
        await saveOnboardingStep1(uid, { currentGrade, province, priorityArea, schoolName });
        setStep(2);
      } else if (step === 2) {
        if (academicGroups.length === 0) {
          setError("Vui lòng chọn ít nhất 1 tổ hợp môn");
          setSaving(false);
          return;
        }
        await saveOnboardingStep2(uid, { academicGroups, interestedMajorGroups });
        setStep(3);
      } else if (step === 3) {
        await saveOnboardingStep3(uid, {
          careerObjective,
          universityTypes,
          preferredRegion,
          maxTuitionPerYear: maxTuition ? Number(maxTuition) : null,
          distancePriority,
        });
        await completeOnboarding(uid);
        router.push("/chat");
      }
    } catch (err) {
      console.error("Lỗi onboarding:", err);
      setError("Có lỗi xảy ra, vui lòng thử lại");
    } finally {
      setSaving(false);
    }
  };

  const filteredGroups = groupSearch
    ? ACADEMIC_GROUPS.filter((g) => g.toLowerCase().includes(groupSearch.toLowerCase()))
    : ACADEMIC_GROUPS;

  if (!uid) return <div className="h-screen bg-[#0a0c10] flex items-center justify-center text-white">Đang tải...</div>;

  return (
    <div className="h-screen bg-gradient-to-br from-[#0a0c10] via-[#0d1117] to-[#0a0c10] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <Image src="/logo.png" alt="logo" width={40} height={40} className="rounded-lg bg-white p-0.5" />
          <span className="font-bold text-lg">Campus Compass</span>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                s < step ? "bg-emerald-500 text-white" :
                s === step ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30" :
                "bg-white/10 text-gray-500"
              }`}>{s < step ? "✓" : s}</div>
              {s < 3 && <div className={`w-8 h-0.5 ${s < step ? "bg-emerald-500" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6 md:p-10 animate-page-transition">
        {/* ===== STEP 1 ===== */}
        {step === 1 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                Chào mừng bạn! 👋
              </h1>
              <p className="text-gray-400 mt-2">Hãy cho mình biết đôi điều về bạn nhé</p>
            </div>

            {/* Lớp hiện tại */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Bạn đang là học sinh lớp mấy? <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {GRADE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCurrentGrade(opt.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      currentGrade === opt.value
                        ? "border-blue-500 bg-blue-500/20 text-blue-300 shadow-lg shadow-blue-500/10"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10 hover:border-white/20"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Tên trường */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Tên trường THPT</label>
              <input
                type="text"
                value={schoolName}
                onChange={(e) => setSchoolName(e.target.value)}
                placeholder="VD: THPT Nguyễn Thị Minh Khai"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 focus:bg-white/[0.07] transition-all"
              />
            </div>

            {/* Tỉnh/Thành */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Tỉnh/Thành phố <span className="text-red-400">*</span>
              </label>
              <select
                value={province}
                onChange={(e) => setProvince(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#1e1f20]">Chọn tỉnh/thành phố...</option>
                {PROVINCES.map((p) => (
                  <option key={p} value={p} className="bg-[#1e1f20]">{p}</option>
                ))}
              </select>
            </div>

            {/* Khu vực ưu tiên */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">
                Khu vực ưu tiên <span className="text-red-400">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {PRIORITY_AREAS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPriorityArea(opt.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all duration-200 ${
                      priorityArea === opt.value
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 2 ===== */}
        {step === 2 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-400 to-purple-400 bg-clip-text text-transparent">
                Tổ hợp & Nhóm ngành 📚
              </h1>
              <p className="text-gray-400 mt-2">Để mình gợi ý ngành phù hợp cho bạn</p>
            </div>

            {/* Tổ hợp môn */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Tổ hợp môn xét tuyển <span className="text-red-400">*</span>
                <span className="text-gray-500 font-normal ml-2">Đã chọn: {academicGroups.length}</span>
              </label>
              <input
                type="text"
                value={groupSearch}
                onChange={(e) => setGroupSearch(e.target.value)}
                placeholder="Tìm tổ hợp (VD: A00, D01...)"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white placeholder-gray-500 outline-none focus:border-blue-500/50 transition-all text-sm"
              />
              {academicGroups.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {academicGroups.map((g) => (
                    <span
                      key={g}
                      onClick={() => toggleArrayItem(academicGroups, g, setAcademicGroups)}
                      className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-300 text-sm cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all"
                    >{g} ×</span>
                  ))}
                </div>
              )}
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-[200px] overflow-y-auto custom-scrollbar p-1">
                {filteredGroups.map((g) => (
                  <button
                    key={g}
                    onClick={() => toggleArrayItem(academicGroups, g, setAcademicGroups)}
                    className={`py-2 rounded-lg border text-xs font-medium transition-all ${
                      academicGroups.includes(g)
                        ? "border-blue-500 bg-blue-500/20 text-blue-300"
                        : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"
                    }`}
                  >{g}</button>
                ))}
              </div>
            </div>

            {/* Nhóm ngành */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">
                Nhóm ngành quan tâm
                <span className="text-gray-500 font-normal ml-2">(Tối đa 3)</span>
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {MAJOR_GROUPS.map((group) => (
                  <button
                    key={group}
                    onClick={() => toggleArrayItem(interestedMajorGroups, group, setInterestedMajorGroups, 3)}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${
                      interestedMajorGroups.includes(group)
                        ? "border-purple-500 bg-purple-500/20 text-purple-300"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                    } ${!interestedMajorGroups.includes(group) && interestedMajorGroups.length >= 3 ? "opacity-40 cursor-not-allowed" : ""}`}
                  >
                    {interestedMajorGroups.includes(group) && <span className="mr-2">✓</span>}
                    {group}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ===== STEP 3 ===== */}
        {step === 3 && (
          <div className="space-y-8">
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                Mục tiêu & Ưu tiên 🎯
              </h1>
              <p className="text-gray-400 mt-2">Giúp mình hiểu rõ hơn mong muốn của bạn</p>
            </div>

            {/* Mục tiêu nghề nghiệp */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Mục tiêu nghề nghiệp</label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {CAREER_OBJECTIVES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setCareerObjective(careerObjective === opt.value ? null : opt.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      careerObjective === opt.value
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Loại trường */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Loại trường ưu thích</label>
              <div className="flex gap-3">
                {UNIVERSITY_TYPES.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => toggleArrayItem(universityTypes, opt.value, setUniversityTypes)}
                    className={`flex-1 p-3 rounded-xl border text-sm font-medium transition-all ${
                      universityTypes.includes(opt.value)
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
            </div>

            {/* Khu vực trường */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Khu vực trường mong muốn</label>
              <div className="grid grid-cols-3 gap-3">
                {PREFERRED_REGIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setPreferredRegion(preferredRegion === opt.value ? null : opt.value)}
                    className={`p-3 rounded-xl border text-sm font-medium transition-all ${
                      preferredRegion === opt.value
                        ? "border-emerald-500 bg-emerald-500/20 text-emerald-300"
                        : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                    }`}
                  >{opt.label}</button>
                ))}
              </div>
              <p className="text-xs text-gray-500">Không chọn = tất cả khu vực</p>
            </div>

            {/* Học phí */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-300">Học phí tối đa (triệu VND/năm)</label>
              <input
                type="number"
                value={maxTuition}
                onChange={(e) => setMaxTuition(e.target.value)}
                placeholder="VD: 50"
                min={0}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-emerald-500/50 transition-all"
              />
            </div>

            {/* Ưu tiên gần nhà */}
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
              <div>
                <p className="text-sm font-medium text-gray-300">Ưu tiên trường gần nhà</p>
                <p className="text-xs text-gray-500 mt-1">Trường gần tỉnh/thành phố của bạn sẽ được xếp ưu tiên</p>
              </div>
              <button
                onClick={() => setDistancePriority(!distancePriority)}
                className={`w-12 h-6 rounded-full transition-all relative ${
                  distancePriority ? "bg-emerald-500" : "bg-white/20"
                }`}
              >
                <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${
                  distancePriority ? "left-[26px]" : "left-0.5"
                }`} />
              </button>
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        {/* Navigation buttons */}
        <div className="flex justify-between items-center mt-10 pt-6 border-t border-white/5">
          {step > 1 ? (
            <button
              onClick={() => { setStep(step - 1); setError(""); }}
              className="px-6 py-3 rounded-xl border border-white/10 text-gray-300 hover:bg-white/5 transition-all text-sm font-medium"
            >← Quay lại</button>
          ) : <div />}

          <button
            onClick={handleNext}
            disabled={saving}
            className={`px-8 py-3 rounded-xl font-bold text-sm transition-all shadow-lg ${
              step === 3
                ? "bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/20 text-white"
                : "bg-blue-500 hover:bg-blue-600 shadow-blue-500/20 text-white"
            } disabled:opacity-50`}
          >
            {saving ? "Đang lưu..." : step === 3 ? "Hoàn tất 🚀" : "Tiếp theo →"}
          </button>
        </div>
      </div>
    </div>
  );
}
