// app/profile/page.tsx — Trang hồ sơ chi tiết (sau onboarding)
"use client";
import { useState, useEffect } from "react";
import { auth } from "@/utils/firebase";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import Image from "next/image";
import {
  getUserProfile,
  saveProfileInfo,
  saveThptScores,
  saveGpaScores,
  saveCompetencyScores,
  savePreferences,
  checkOnboardingDone,
} from "@/lib/firestore-helpers";
import {
  SCORE_SUBJECTS,
  GPA_SUBJECTS,
  PROVINCES,
  PRIORITY_AREAS,
  PRIORITY_OBJECTS,
  GENDER_OPTIONS,
  MAJOR_GROUPS,
  CAREER_OBJECTIVES,
  UNIVERSITY_TYPES,
  PREFERRED_REGIONS,
  ACADEMIC_GROUPS,
} from "@/lib/constants";

type TabKey = "info" | "thpt" | "hocba" | "nangluc" | "preferences";

export default function ProfilePage() {
  const router = useRouter();
  const [uid, setUid] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [gpaYear, setGpaYear] = useState<"gpa10" | "gpa11" | "gpa12">("gpa10");

  // Profile info
  const [displayName, setDisplayName] = useState("");
  const [gender, setGender] = useState<string | null>(null);
  const [birthYear, setBirthYear] = useState("");
  const [province, setProvince] = useState("");
  const [priorityArea, setPriorityArea] = useState("");
  const [priorityObject, setPriorityObject] = useState<string | null>(null);

  // THPT scores
  const [thptScores, setThptScores] = useState<Record<string, string>>({});

  // GPA scores
  const [gpa10, setGpa10] = useState<Record<string, string>>({});
  const [gpa11, setGpa11] = useState<Record<string, string>>({});
  const [gpa12, setGpa12] = useState<Record<string, string>>({});

  // Competency
  const [competencyHcm, setCompetencyHcm] = useState("");
  const [competencyHn, setCompetencyHn] = useState("");
  const [aptitudeHust, setAptitudeHust] = useState("");
  const [ielts, setIelts] = useState("");
  const [certificates, setCertificates] = useState<string[]>([]);
  const [newCert, setNewCert] = useState("");

  // Preferences
  const [interestedMajorGroups, setInterestedMajorGroups] = useState<string[]>([]);
  const [careerObjective, setCareerObjective] = useState<string | null>(null);
  const [universityTypes, setUniversityTypes] = useState<string[]>([]);
  const [preferredRegion, setPreferredRegion] = useState<string | null>(null);
  const [maxTuition, setMaxTuition] = useState("");
  const [distancePriority, setDistancePriority] = useState(false);
  const [academicGroups, setAcademicGroups] = useState<string[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) { router.push("/"); return; }
      setUid(user.uid);

      // Chưa onboarding → chuyển onboarding
      const done = await checkOnboardingDone(user.uid);
      if (!done) { router.push("/onboarding"); return; }

      // Load profile
      const data = await getUserProfile(user.uid);
      if (data) {
        const p = data.profile ?? {};
        const ac = data.academic ?? {};
        const pr = data.preferences ?? {};
        const up = pr.universityPrefs ?? {};

        setDisplayName(p.displayName ?? "");
        setGender(p.gender ?? null);
        setBirthYear(p.birthYear ? String(p.birthYear) : "");
        setProvince(p.province ?? "");
        setPriorityArea(p.priorityArea ?? "");
        setPriorityObject(p.priorityObject ?? null);

        // Load scores
        const scores = ac.scores ?? {};
        const sObj: Record<string, string> = {};
        SCORE_SUBJECTS.forEach((s) => { if (scores[s.key] != null) sObj[s.key] = String(scores[s.key]); });
        setThptScores(sObj);

        // Load GPA
        const loadGpa = (gpa: any) => {
          const obj: Record<string, string> = {};
          GPA_SUBJECTS.forEach((s) => { if (gpa?.[s.key] != null) obj[s.key] = String(gpa[s.key]); });
          return obj;
        };
        setGpa10(loadGpa(ac.gpa10));
        setGpa11(loadGpa(ac.gpa11));
        setGpa12(loadGpa(ac.gpa12));

        // Load competency
        setCompetencyHcm(ac.competencyScoreHcm != null ? String(ac.competencyScoreHcm) : "");
        setCompetencyHn(ac.competencyScoreHn != null ? String(ac.competencyScoreHn) : "");
        setAptitudeHust(ac.aptitudeScoreHust != null ? String(ac.aptitudeScoreHust) : "");
        setIelts(ac.ieltsScore != null ? String(ac.ieltsScore) : "");
        setCertificates(ac.otherCertificates ?? []);

        // Load preferences
        setInterestedMajorGroups(pr.interestedMajorGroups ?? []);
        setCareerObjective(pr.careerObjective ?? null);
        setUniversityTypes(up.universityTypes ?? []);
        setPreferredRegion(up.preferredRegion ?? null);
        setMaxTuition(up.maxTuitionPerYear != null ? String(up.maxTuitionPerYear) : "");
        setDistancePriority(up.distancePriority ?? false);
        setAcademicGroups(ac.academicGroups ?? []);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [router]);

  const parseNum = (v: string) => v.trim() === "" ? null : Number(v);

  const handleSave = async () => {
    if (!uid) return;
    setSaving(true);
    setSaved(false);
    try {
      if (activeTab === "info") {
        await saveProfileInfo(uid, {
          displayName: displayName || null,
          gender,
          birthYear: parseNum(birthYear),
          province: province || null,
          priorityArea: priorityArea || null,
          priorityObject,
        });
      } else if (activeTab === "thpt") {
        const scores: Record<string, number | null> = {};
        SCORE_SUBJECTS.forEach((s) => { scores[s.key] = parseNum(thptScores[s.key] ?? ""); });
        await saveThptScores(uid, scores);
      } else if (activeTab === "hocba") {
        const gpaMap = { gpa10, gpa11, gpa12 };
        const current = gpaMap[gpaYear];
        const scores: Record<string, number | null> = {};
        GPA_SUBJECTS.forEach((s) => { scores[s.key] = parseNum(current[s.key] ?? ""); });
        await saveGpaScores(uid, gpaYear, scores);
      } else if (activeTab === "nangluc") {
        await saveCompetencyScores(uid, {
          competencyScoreHcm: parseNum(competencyHcm),
          competencyScoreHn: parseNum(competencyHn),
          aptitudeScoreHust: parseNum(aptitudeHust),
          ieltsScore: parseNum(ielts),
          otherCertificates: certificates,
        });
      } else if (activeTab === "preferences") {
        await savePreferences(uid, {
          interestedMajorGroups,
          careerObjective,
          universityPrefs: {
            universityTypes,
            preferredRegion,
            maxTuitionPerYear: parseNum(maxTuition),
            distancePriority,
          },
        });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Lỗi lưu:", err);
      alert("Có lỗi xảy ra khi lưu!");
    } finally {
      setSaving(false);
    }
  };

  const toggleItem = (arr: string[], item: string, setter: (v: string[]) => void, max?: number) => {
    if (arr.includes(item)) setter(arr.filter(i => i !== item));
    else if (!max || arr.length < max) setter([...arr, item]);
  };

  const tabs: { key: TabKey; label: string; icon: string }[] = [
    { key: "info", label: "Cá nhân", icon: "👤" },
    { key: "thpt", label: "Điểm THPT", icon: "📝" },
    { key: "hocba", label: "Học bạ", icon: "📚" },
    { key: "nangluc", label: "Năng lực", icon: "🏆" },
    { key: "preferences", label: "Sở thích", icon: "💡" },
  ];

  if (loading) return <div className="h-screen bg-[#0a0c10] flex items-center justify-center text-white">Đang tải...</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0c10] via-[#0d1117] to-[#0a0c10] text-white overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-4 md:p-6 border-b border-white/5">
        <div onClick={() => router.push("/")} className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition">
          <Image src="/logo.png" alt="logo" width={36} height={36} className="rounded-lg bg-white p-0.5" />
          <span className="font-bold hidden sm:inline">Campus Compass</span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => router.push("/chat")} className="px-5 py-2 bg-blue-500 hover:bg-blue-600 rounded-xl text-sm font-medium transition-all shadow-lg shadow-blue-500/20">
            💬 Vào Chat
          </button>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4 md:p-8">
        <h1 className="text-2xl md:text-3xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
          Hồ Sơ Của Bạn
        </h1>

        {/* Tab Navigation */}
        <div className="flex gap-1 mb-8 overflow-x-auto pb-2 custom-scrollbar">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeTab === tab.key
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"
              }`}
            >{tab.icon} {tab.label}</button>
          ))}
        </div>

        {/* ===== TAB: THÔNG TIN CÁ NHÂN ===== */}
        {activeTab === "info" && (
          <div className="space-y-6 animate-page-transition">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Tên hiển thị</label>
                <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)}
                  placeholder="Nhập tên..." className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Giới tính</label>
                <div className="flex gap-2">
                  {GENDER_OPTIONS.map(opt => (
                    <button key={opt.value} onClick={() => setGender(gender === opt.value ? null : opt.value)}
                      className={`flex-1 p-2.5 rounded-xl border text-sm transition-all ${gender === opt.value ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Năm sinh</label>
                <input type="number" value={birthYear} onChange={e => setBirthYear(e.target.value)}
                  placeholder="VD: 2008" min={2000} max={2012}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Tỉnh/Thành phố</label>
                <select value={province} onChange={e => setProvince(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all appearance-none">
                  <option value="" className="bg-[#1e1f20]">Chọn...</option>
                  {PROVINCES.map(p => <option key={p} value={p} className="bg-[#1e1f20]">{p}</option>)}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Khu vực ưu tiên</label>
                <div className="grid grid-cols-2 gap-2">
                  {PRIORITY_AREAS.map(opt => (
                    <button key={opt.value} onClick={() => setPriorityArea(opt.value)}
                      className={`p-2.5 rounded-xl border text-xs transition-all ${priorityArea === opt.value ? "border-blue-500 bg-blue-500/20 text-blue-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Đối tượng ưu tiên</label>
                <select value={priorityObject ?? ""} onChange={e => setPriorityObject(e.target.value || null)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all appearance-none">
                  <option value="" className="bg-[#1e1f20]">Không có</option>
                  {PRIORITY_OBJECTS.map(opt => <option key={opt.value} value={opt.value} className="bg-[#1e1f20]">{opt.label}</option>)}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* ===== TAB: ĐIỂM THPT ===== */}
        {activeTab === "thpt" && (
          <div className="space-y-6 animate-page-transition">
            <p className="text-gray-400 text-sm">Nhập điểm thi THPT Quốc gia 2025 (0 – 10). Để trống nếu chưa có.</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {SCORE_SUBJECTS.map(sub => (
                <div key={sub.key} className="space-y-1.5">
                  <label className="text-sm text-gray-400">{sub.label}</label>
                  <input type="number" step="0.1" min="0" max="10"
                    value={thptScores[sub.key] ?? ""} onChange={e => setThptScores(prev => ({ ...prev, [sub.key]: e.target.value }))}
                    placeholder="—"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-blue-500/50 transition-all" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== TAB: ĐIỂM HỌC BẠ ===== */}
        {activeTab === "hocba" && (
          <div className="space-y-6 animate-page-transition">
            <p className="text-gray-400 text-sm">Điểm trung bình học bạ theo từng năm (0 – 10). Để trống nếu chưa có.</p>
            <div className="flex gap-2 mb-4">
              {(["gpa10", "gpa11", "gpa12"] as const).map(y => (
                <button key={y} onClick={() => setGpaYear(y)}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${gpaYear === y ? "bg-purple-500/20 text-purple-300 border border-purple-500/30" : "bg-white/5 text-gray-400 border border-transparent hover:bg-white/10"}`}>
                  {y === "gpa10" ? "Lớp 10" : y === "gpa11" ? "Lớp 11" : "Lớp 12"}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {GPA_SUBJECTS.map(sub => {
                const gpaMap = { gpa10, gpa11, gpa12 };
                const setMap = { gpa10: setGpa10, gpa11: setGpa11, gpa12: setGpa12 };
                return (
                  <div key={sub.key} className="space-y-1.5">
                    <label className={`text-sm ${sub.key === "overall" ? "text-yellow-400 font-medium" : "text-gray-400"}`}>{sub.label}</label>
                    <input type="number" step="0.1" min="0" max="10"
                      value={gpaMap[gpaYear][sub.key] ?? ""} onChange={e => setMap[gpaYear](prev => ({ ...prev, [sub.key]: e.target.value }))}
                      placeholder="—"
                      className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-center outline-none transition-all ${sub.key === "overall" ? "border-yellow-500/30 focus:border-yellow-500/50" : "border-white/10 focus:border-blue-500/50"}`} />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ===== TAB: NĂNG LỰC & CHỨNG CHỈ ===== */}
        {activeTab === "nangluc" && (
          <div className="space-y-6 animate-page-transition">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">ĐGNL ĐHQG HCM <span className="text-gray-600">(0 – 1200)</span></label>
                <input type="number" min="0" max="1200" value={competencyHcm} onChange={e => setCompetencyHcm(e.target.value)}
                  placeholder="—" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">HSA ĐHQG HN <span className="text-gray-600">(0 – 150)</span></label>
                <input type="number" min="0" max="150" value={competencyHn} onChange={e => setCompetencyHn(e.target.value)}
                  placeholder="—" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">ĐGTD ĐHBK HN <span className="text-gray-600">(0 – 100)</span></label>
                <input type="number" min="0" max="100" value={aptitudeHust} onChange={e => setAptitudeHust(e.target.value)}
                  placeholder="—" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="space-y-2">
                <label className="text-sm text-gray-400">IELTS <span className="text-gray-600">(0.0 – 9.0)</span></label>
                <input type="number" step="0.5" min="0" max="9" value={ielts} onChange={e => setIelts(e.target.value)}
                  placeholder="—" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-center outline-none focus:border-blue-500/50 transition-all" />
              </div>
            </div>

            {/* Chứng chỉ */}
            <div className="space-y-3">
              <label className="text-sm text-gray-400">Chứng chỉ / Giải thưởng</label>
              <div className="flex gap-2">
                <input type="text" value={newCert} onChange={e => setNewCert(e.target.value)}
                  onKeyDown={e => { if (e.key === "Enter" && newCert.trim()) { setCertificates([...certificates, newCert.trim()]); setNewCert(""); } }}
                  placeholder="VD: Giải Nhì HSG Tỉnh Toán" className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-white text-sm outline-none focus:border-blue-500/50 transition-all" />
                <button onClick={() => { if (newCert.trim()) { setCertificates([...certificates, newCert.trim()]); setNewCert(""); } }}
                  className="px-4 py-2.5 bg-blue-500/20 text-blue-300 rounded-xl text-sm font-medium hover:bg-blue-500/30 transition-all">+ Thêm</button>
              </div>
              {certificates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {certificates.map((c, i) => (
                    <span key={i} onClick={() => setCertificates(certificates.filter((_, idx) => idx !== i))}
                      className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-sm text-gray-300 cursor-pointer hover:bg-red-500/20 hover:border-red-500/30 hover:text-red-300 transition-all">
                      {c} ×
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ===== TAB: SỞ THÍCH ===== */}
        {activeTab === "preferences" && (
          <div className="space-y-8 animate-page-transition">
            {/* Nhóm ngành */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Nhóm ngành quan tâm <span className="text-gray-500">(tối đa 3)</span></label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {MAJOR_GROUPS.map(g => (
                  <button key={g} onClick={() => toggleItem(interestedMajorGroups, g, setInterestedMajorGroups, 3)}
                    className={`p-3 rounded-xl border text-sm text-left transition-all ${interestedMajorGroups.includes(g) ? "border-purple-500 bg-purple-500/20 text-purple-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"} ${!interestedMajorGroups.includes(g) && interestedMajorGroups.length >= 3 ? "opacity-40 cursor-not-allowed" : ""}`}>
                    {interestedMajorGroups.includes(g) && "✓ "}{g}
                  </button>
                ))}
              </div>
            </div>

            {/* Mục tiêu */}
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-300">Mục tiêu nghề nghiệp</label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {CAREER_OBJECTIVES.map(opt => (
                  <button key={opt.value} onClick={() => setCareerObjective(careerObjective === opt.value ? null : opt.value)}
                    className={`p-3 rounded-xl border text-sm transition-all ${careerObjective === opt.value ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Loại trường & khu vực */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Loại trường</label>
                <div className="flex gap-2">
                  {UNIVERSITY_TYPES.map(opt => (
                    <button key={opt.value} onClick={() => toggleItem(universityTypes, opt.value, setUniversityTypes)}
                      className={`flex-1 p-2.5 rounded-xl border text-sm transition-all ${universityTypes.includes(opt.value) ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <label className="text-sm font-medium text-gray-300">Khu vực trường</label>
                <div className="flex gap-2">
                  {PREFERRED_REGIONS.map(opt => (
                    <button key={opt.value} onClick={() => setPreferredRegion(preferredRegion === opt.value ? null : opt.value)}
                      className={`flex-1 p-2.5 rounded-xl border text-sm transition-all ${preferredRegion === opt.value ? "border-emerald-500 bg-emerald-500/20 text-emerald-300" : "border-white/10 bg-white/5 text-gray-400 hover:bg-white/10"}`}>
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Học phí + khoảng cách */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm text-gray-400">Học phí tối đa (triệu/năm)</label>
                <input type="number" min="0" value={maxTuition} onChange={e => setMaxTuition(e.target.value)}
                  placeholder="VD: 50" className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white outline-none focus:border-blue-500/50 transition-all" />
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/10">
                <div>
                  <p className="text-sm font-medium text-gray-300">Ưu tiên trường gần nhà</p>
                </div>
                <button onClick={() => setDistancePriority(!distancePriority)}
                  className={`w-12 h-6 rounded-full transition-all relative ${distancePriority ? "bg-emerald-500" : "bg-white/20"}`}>
                  <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${distancePriority ? "left-[26px]" : "left-0.5"}`} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Save button */}
        <div className="flex justify-end items-center gap-3 mt-10 pt-6 border-t border-white/5 pb-8">
          {saved && <span className="text-emerald-400 text-sm font-medium animate-page-transition">✓ Đã lưu thành công!</span>}
          <button onClick={handleSave} disabled={saving}
            className="px-8 py-3 bg-blue-500 hover:bg-blue-600 disabled:opacity-50 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/20">
            {saving ? "Đang lưu..." : "💾 Lưu thay đổi"}
          </button>
        </div>
      </div>
    </div>
  );
}