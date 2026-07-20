"use client";

/**
 * הקיבוץ – Onboarding Wizard
 * מוצג אחרי כל login עד שהפרופיל מלא
 * TODO backend: PATCH /users/me עם נתוני הפרופיל
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { User, Briefcase, Plus, X, ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { completeOnboarding } from "@/services/user.service";

type Role = "entrepreneur" | "participant" | null;
type ExpLevel = "1-2" | "3-5" | "5+";

interface Skill {
  name: string;
  level: ExpLevel;
}

const STEP_LABELS = ["סוג משתמש", "פרטים אישיים", "כישורים", "סיכום"];

const SKILL_SUGGESTIONS = [
  "React", "Next.js", "Node.js", "Python", "TypeScript",
  "PostgreSQL", "AWS", "Docker", "Figma", "Product Management",
  "Vue.js", "GraphQL", ".NET", "Flutter", "iOS", "Android"
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);

  // Step 0 — role
  const [role, setRole] = useState<Role>(null);

  // Step 1 — personal
  const [name, setName] = useState("");
  const [bio, setBio] = useState("");
  const [links, setLinks] = useState("");

  // Step 2 — skills
  const [skills, setSkills] = useState<Skill[]>([]);
  const [skillInput, setSkillInput] = useState("");
  const [skillLevel, setSkillLevel] = useState<ExpLevel>("1-2");

  const addSkill = (name?: string) => {
    const n = (name || skillInput).trim();
    if (!n || skills.find(s => s.name.toLowerCase() === n.toLowerCase())) return;
    setSkills(prev => [...prev, { name: n, level: skillLevel }]);
    setSkillInput("");
  };

  const removeSkill = (i: number) => setSkills(prev => prev.filter((_, idx) => idx !== i));

  const canNext = [
    role !== null,
    name.trim().length >= 2,
    skills.length >= 1,
    true
  ][step];

  async function handleFinish() {
    setLoading(true);
    try {
      await completeOnboarding({
        userType: role === "entrepreneur" ? "ENTREPRENEUR" : "PARTICIPANT",
        name,
        bio: bio || undefined,
        links: links || undefined,
        skills: skills.map(skill => ({
          name: skill.name,
          level: skill.level === "1-2"
            ? "ONE_TO_TWO"
            : skill.level === "3-5"
              ? "THREE_TO_FIVE"
              : "FIVE_PLUS",
        })),
      } as unknown as Parameters<typeof completeOnboarding>[0]);
      router.push("/dashboard");
    } finally {
      setLoading(false);
    }
  }

  const expLabels: Record<ExpLevel, string> = {
    "1-2": "1–2 שנים",
    "3-5": "3–5 שנים",
    "5+": "מעל 5 שנים"
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4" dir="rtl">

      {/* Logo */}
      <div className="flex items-center gap-3 mb-8">
        <Image src="/logo_clean.png" alt="הקיבוץ" width={44} height={44} className="rounded-xl object-cover" />
        <span className="text-xl font-bold text-foreground">הקיבוץ</span>
      </div>

      {/* Progress */}
      <div className="w-full max-w-lg mb-6">
        <div className="flex items-center gap-2 mb-2">
          {STEP_LABELS.map((label, i) => (
            <div key={i} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                i < step ? "bg-primary text-white" :
                i === step ? "bg-primary text-white ring-4 ring-primary/20" :
                "bg-[var(--muted)] text-muted-foreground"
              }`}>
                {i < step ? <Check className="w-3.5 h-3.5" /> : i + 1}
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all ${i < step ? "bg-primary" : "bg-[var(--muted)]"}`} />
              )}
            </div>
          ))}
        </div>
        <div className="flex justify-between px-1">
          {STEP_LABELS.map((label, i) => (
            <span key={i} className={`text-[10px] font-medium ${i === step ? "text-primary" : "text-muted-foreground"}`}>
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Card */}
      <div className="w-full max-w-lg glass-panel rounded-2xl p-8 border border-[var(--border)]">

        {/* ── STEP 0: Role ── */}
        {step === 0 && (
          <div>
            <h2 className="text-xl font-bold text-foreground text-center mb-2">ברוכים הבאים לקיבוץ 👋</h2>
            <p className="text-sm text-muted-foreground text-center mb-8">מה מתאר אותך יותר?</p>
            <div className="grid grid-cols-2 gap-4">
              {[
                { id: "entrepreneur", icon: <Briefcase className="w-8 h-8" />, title: "יזם", desc: "יש לי רעיון ואני מחפש צוות לממשו" },
                { id: "participant",  icon: <User className="w-8 h-8" />,      title: "מפתח/מעצב", desc: "אני מחפש פרויקט אמיתי להצטרף אליו" }
              ].map(opt => (
                <button key={opt.id} type="button"
                  onClick={() => setRole(opt.id as Role)}
                  className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 transition-all cursor-pointer text-center"
                  style={role === opt.id
                    ? { borderColor: "#d2642d", background: "rgba(210,100,45,0.08)", boxShadow: "0 4px 20px -6px rgba(210,100,45,0.3)" }
                    : { borderColor: "var(--border)", background: "rgba(255,255,255,0.4)" }
                  }
                >
                  <div className={role === opt.id ? "text-primary" : "text-muted-foreground"}>
                    {opt.icon}
                  </div>
                  <span className={`text-base font-bold ${role === opt.id ? "text-primary" : "text-foreground"}`}>
                    {opt.title}
                  </span>
                  <span className="text-xs text-muted-foreground leading-relaxed">{opt.desc}</span>
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-muted-foreground mt-4">
              ניתן לשנות בהגדרות בכל עת
            </p>
          </div>
        )}

        {/* ── STEP 1: Personal ── */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-xl font-bold text-foreground text-center mb-6">ספר לנו עליך</h2>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">שם מלא *</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)}
                placeholder="ישראל ישראלי" autoFocus
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                ביו קצר <span className="font-normal">(אופציונלי)</span>
              </label>
              <textarea value={bio} onChange={e => setBio(e.target.value)}
                placeholder="מה אתה עושה? מה מניע אותך?"
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors resize-none" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-muted-foreground mb-1.5">
                לינקים <span className="font-normal">(LinkedIn, GitHub — אופציונלי)</span>
              </label>
              <input type="text" value={links} onChange={e => setLinks(e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors" dir="ltr" />
            </div>
          </div>
        )}

        {/* ── STEP 2: Skills ── */}
        {step === 2 && (
          <div>
            <h2 className="text-xl font-bold text-foreground text-center mb-2">הכישורים שלך</h2>
            <p className="text-xs text-muted-foreground text-center mb-6">הוסף לפחות כישור אחד</p>

            {/* Add skill */}
            <div className="flex gap-2 mb-3">
              <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && (e.preventDefault(), addSkill())}
                placeholder="שם הכישור..."
                className="flex-1 px-3 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors" />
              <select value={skillLevel} onChange={e => setSkillLevel(e.target.value as ExpLevel)}
                className="px-3 py-2.5 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors cursor-pointer">
                {(Object.entries(expLabels) as [ExpLevel, string][]).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
              <button type="button" onClick={() => addSkill()}
                className="px-3 py-2.5 rounded-xl bg-primary text-white text-sm font-bold cursor-pointer hover:bg-primary-dark transition-all">
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Suggestions */}
            <div className="flex flex-wrap gap-1.5 mb-4">
              {SKILL_SUGGESTIONS.filter(s => !skills.find(sk => sk.name === s)).slice(0, 10).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)}
                  className="px-2.5 py-1 rounded-full text-xs border border-[var(--border)] text-muted-foreground hover:border-primary hover:text-primary transition-all cursor-pointer">
                  + {s}
                </button>
              ))}
            </div>

            {/* Skills list */}
            {skills.length > 0 && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {skills.map((sk, i) => (
                  <div key={i} className="flex items-center justify-between px-3 py-2 rounded-xl"
                    style={{ background: "rgba(210,100,45,0.07)", border: "1px solid rgba(210,100,45,0.2)" }}>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-foreground">{sk.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                        {expLabels[sk.level]}
                      </span>
                    </div>
                    <button type="button" onClick={() => removeSkill(i)}
                      className="text-muted-foreground hover:text-red-400 cursor-pointer transition-colors">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ── STEP 3: Summary ── */}
        {step === 3 && (
          <div>
            <h2 className="text-xl font-bold text-foreground text-center mb-6">הכל נראה טוב! 🎉</h2>
            <div className="space-y-3 p-4 rounded-2xl mb-6"
              style={{ background: "rgba(210,100,45,0.06)", border: "1px solid rgba(210,100,45,0.15)" }}>
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                <span className="text-sm text-foreground font-semibold">{name}</span>
                <span className="text-xs text-muted-foreground">שם</span>
              </div>
              <div className="flex justify-between items-center border-b border-[var(--border)] pb-3">
                <span className="text-sm font-semibold text-primary">
                  {role === "entrepreneur" ? "יזם" : "מפתח/מעצב"}
                </span>
                <span className="text-xs text-muted-foreground">תפקיד</span>
              </div>
              <div className="pt-1">
                <span className="text-xs text-muted-foreground block mb-2 text-left">כישורים</span>
                <div className="flex flex-wrap gap-1.5">
                  {skills.map((sk, i) => (
                    <span key={i} className="text-xs px-2.5 py-1 rounded-full bg-primary/10 text-primary font-medium">
                      {sk.name} · {expLabels[sk.level]}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <p className="text-xs text-center text-muted-foreground">
              תוכל לערוך את כל הפרטים בדף הפרופיל בכל עת
            </p>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between mt-8">
          <button type="button"
            onClick={() => setStep(s => s - 1)}
            disabled={step === 0}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-primary/5 transition-all cursor-pointer disabled:opacity-0">
            <ChevronRight className="w-4 h-4" />
            חזרה
          </button>

          <span className="text-xs text-muted-foreground">{step + 1} / {STEP_LABELS.length}</span>

          {step < STEP_LABELS.length - 1 ? (
            <button type="button"
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed">
              המשך
              <ChevronLeft className="w-4 h-4" />
            </button>
          ) : (
            <button type="button" onClick={handleFinish} disabled={loading}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary hover:bg-primary-dark text-white text-sm font-bold transition-all cursor-pointer disabled:opacity-60">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {loading ? "שומר..." : "כניסה לפלטפורמה"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
