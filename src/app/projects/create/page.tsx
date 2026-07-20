"use client";

import { FormEvent, KeyboardEvent, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Camera, Check, ChevronLeft, ChevronRight, Loader2, Plus, Trash2, Upload, X } from "lucide-react";

interface MediaPreview {
  id: string;
  file: File;
  previewUrl: string;
  name: string;
}
import { createProject } from "@/services/project.service";
import type { ProjectIconType } from "@/types/project.types";
import ComingSoonBanner from "@/components/ComingSoonBanner";

interface RoleInput {
  title: string;
  requiredSkills: string[];
  slots: number;
}

const ICON_OPTIONS: { value: ProjectIconType; label: string }[] = [
  { value: "leaf", label: "LEAF" },
  { value: "cpu", label: "CPU" },
  { value: "database", label: "DATABASE" },
  { value: "globe", label: "GLOBE" },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [maxMembers, setMaxMembers] = useState(5);
  const [iconType, setIconType] = useState<ProjectIconType>("leaf");
  const [roles, setRoles] = useState<RoleInput[]>([]);
  const [roleTitle, setRoleTitle] = useState("");
  const [roleSkills, setRoleSkills] = useState<string[]>([]);
  const [roleSkillInput, setRoleSkillInput] = useState("");
  const [roleSlots, setRoleSlots] = useState(1);
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [visualUrl, setVisualUrl] = useState("");
  const [requireNda, setRequireNda] = useState(false);
  const [ndaPaid, setNdaPaid] = useState(false);
  const [ndaPaying, setNdaPaying] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  // item 54 – media gallery in creation form
  const [mediaFiles, setMediaFiles] = useState<MediaPreview[]>([]);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  function addUnique(value: string, values: string[], setter: (next: string[]) => void) {
    const item = value.trim();
    if (!item || values.some(current => current.toLowerCase() === item.toLowerCase())) return;
    setter([...values, item]);
  }

  function handleEnter(event: KeyboardEvent<HTMLInputElement>, action: () => void) {
    if (event.key !== "Enter") return;
    event.preventDefault();
    action();
  }

  function addTag() {
    addUnique(tagInput, tags, setTags);
    setTagInput("");
  }

  function addRoleSkill() {
    addUnique(roleSkillInput, roleSkills, setRoleSkills);
    setRoleSkillInput("");
  }

  function addRole() {
    if (!roleTitle.trim()) {
      setError("יש להזין שם לתפקיד");
      return;
    }
    setRoles(current => [...current, {
      title: roleTitle.trim(),
      requiredSkills: roleSkills,
      slots: roleSlots,
    }]);
    setRoleTitle("");
    setRoleSkills([]);
    setRoleSlots(1);
    setError("");
  }

  function goToRoles() {
    if (!title.trim() || !description.trim()) {
      setError("יש למלא שם ותיאור לפרויקט");
      return;
    }
    if (maxMembers < 2 || maxMembers > 20) {
      setError("מספר חברי הצוות חייב להיות בין 2 ל-20");
      return;
    }
    setError("");
    setStep(1);
  }

  async function handlePayNda() {
    setNdaPaying(true);
    // TODO backend: integrate real payment provider (e.g. Stripe) for NDA activation fee.
    await new Promise(resolve => setTimeout(resolve, 1200));
    setNdaPaid(true);
    setNdaPaying(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (requireNda && !ndaPaid) {
      setError("יש להשלים את התשלום על הפעלת NDA לפני יצירת הפרויקט");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      await createProject({
        title: title.trim(),
        description: description.trim(),
        tags,
        maxMembers: Number(maxMembers),
        iconType,
        websiteUrl: websiteUrl.trim() || undefined,
        visualUrl: visualUrl.trim() || undefined,
      });
      // Roles remain local until the backend supports creating roles with a project.
      void roles;
      // TODO backend: persist requireNda / isDraft once the schema supports a draft status and NDA flag.
      void requireNda;
      void isDraft;
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "יצירת הפרויקט נכשלה");
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary";

  return (
    <main className="min-h-screen bg-background p-4 md:p-8" dir="rtl">
      <div className="mx-auto max-w-2xl">
        <ComingSoonBanner feature="יצירת פרויקט" className="mb-4" />
        <button type="button" onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
          חזרה
        </button>

        <form onSubmit={handleSubmit} className="glass-panel space-y-6 rounded-2xl border border-[var(--border)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">יצירת פרויקט חדש</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {step === 0
                  ? "הגדירו את פרטי הפרויקט."
                  : step === 1
                    ? "הגדירו את התפקידים הנדרשים לצורך Matching."
                    : step === 2
                      ? "הוסיפו קישורים לאתר, לדמו או לויזואל של הפרויקט."
                      : "הגדירו דרישת NDA ובחרו אם לפרסם כעת או לשמור כטיוטה."}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              שלב {step + 1} מתוך 4
            </span>
          </div>

          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

          {step === 0 ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">שם הפרויקט *</span>
                <input required value={title} onChange={event => setTitle(event.target.value)} className={fieldClass} />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">תיאור *</span>
                <textarea required rows={5} value={description} onChange={event => setDescription(event.target.value)} className={`${fieldClass} resize-none`} />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-foreground">תגיות</span>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => handleEnter(event, addTag)} className={fieldClass} placeholder="הקלידו תגית ולחצו Enter" />
                  <button type="button" onClick={addTag} className="rounded-xl bg-primary px-4 text-white"><Plus className="h-4 w-4" /></button>
                </div>
                <ChipList values={tags} onRemove={tag => setTags(current => current.filter(item => item !== tag))} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">מספר חברים מקסימלי</span>
                  <input required type="number" min={2} max={20} value={maxMembers} onChange={event => setMaxMembers(Number(event.target.value))} className={fieldClass} />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">סוג אייקון</span>
                  <select value={iconType} onChange={event => setIconType(event.target.value as ProjectIconType)} className={fieldClass}>
                    {ICON_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                  </select>
                </label>
              </div>

              <button type="button" onClick={goToRoles} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white">
                המשך להגדרת תפקידים
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : step === 1 ? (
            <>
              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                  <input value={roleTitle} onChange={event => setRoleTitle(event.target.value)} className={fieldClass} placeholder="שם התפקיד, למשל מפתח Backend" />
                  <input type="number" min={1} max={5} value={roleSlots} onChange={event => setRoleSlots(Number(event.target.value))} className={fieldClass} aria-label="מספר מקומות" />
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={roleSkillInput} onChange={event => setRoleSkillInput(event.target.value)} onKeyDown={event => handleEnter(event, addRoleSkill)} className={fieldClass} placeholder="Skill נדרש ולחצו Enter" />
                  <button type="button" onClick={addRoleSkill} className="rounded-xl border border-primary px-4 text-primary"><Plus className="h-4 w-4" /></button>
                </div>
                <ChipList values={roleSkills} onRemove={skill => setRoleSkills(current => current.filter(item => item !== skill))} />
                <button type="button" onClick={addRole} className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                  <Plus className="h-4 w-4" />
                  הוספת תפקיד
                </button>
              </div>

              <div className="space-y-3">
                {roles.map((role, index) => (
                  <div key={`${role.title}-${index}`} className="glass-card flex items-start justify-between gap-4 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-foreground">{role.title}</p>
                      <p className="text-xs text-muted-foreground">{role.slots} מקומות</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {role.requiredSkills.map(skill => <span key={skill} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{skill}</span>)}
                      </div>
                    </div>
                    <button type="button" onClick={() => setRoles(current => current.filter((_, itemIndex) => itemIndex !== index))} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {roles.length === 0 && <p className="text-center text-sm text-muted-foreground">לא נוספו תפקידים עדיין. ניתן ליצור את הפרויקט ולהוסיף אותם כאשר הבקאנד יתמוך בכך.</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-muted-foreground">חזרה</button>
                <button type="button" onClick={() => setStep(2)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white">
                  המשך לנוכחות דיגיטלית
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-foreground">נוכחות דיגיטלית</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    השדות אופציונליים ויוצגו בעמוד „ראה פרויקט+”.
                  </p>
                </div>
                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">אתר הפרויקט</span>
                    <input type="url" value={websiteUrl} onChange={event => setWebsiteUrl(event.target.value)} className={fieldClass} placeholder="https://yourproject.com" dir="ltr" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">דמו או ויזואל</span>
                    <input type="url" value={visualUrl} onChange={event => setVisualUrl(event.target.value)} className={fieldClass} placeholder="https://figma.com/... או YouTube" dir="ltr" />
                  </label>
                  {/* item 54 – media gallery upload */}
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-foreground">גלריית תמונות (אופציונלי)</span>
                    <p className="text-xs text-muted-foreground">עד 6 תמונות. יוצגו בגלריה בדף הפרויקט.</p>

                    {/* Upload zone */}
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      disabled={mediaFiles.length >= 6}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-primary/5 py-5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-4 w-4" />
                      {mediaFiles.length >= 6 ? "הגעת למגבלת 6 תמונות" : "לחץ להוספת תמונה"}
                    </button>
                    <input
                      ref={mediaInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={e => {
                        const files = Array.from(e.target.files ?? []);
                        const remaining = 6 - mediaFiles.length;
                        const toAdd: MediaPreview[] = files.slice(0, remaining).map(f => ({
                          id: `${Date.now()}-${Math.random()}`,
                          file: f,
                          previewUrl: URL.createObjectURL(f),
                          name: f.name,
                        }));
                        setMediaFiles(prev => [...prev, ...toAdd]);
                        e.target.value = "";
                        // TODO backend: call uploadProjectMedia(projectId, file) after project creation
                      }}
                    />

                    {/* Preview grid */}
                    {mediaFiles.length > 0 && (
                      <div className="grid grid-cols-3 gap-2">
                        {mediaFiles.map(m => (
                          <div key={m.id} className="relative group aspect-square rounded-xl overflow-hidden border border-[var(--border)]">
                            <img src={m.previewUrl} alt={m.name} className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => {
                                URL.revokeObjectURL(m.previewUrl);
                                setMediaFiles(prev => prev.filter(x => x.id !== m.id));
                              }}
                              className="absolute top-1 left-1 rounded-full bg-black/60 p-1 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <X className="h-3 w-3" />
                            </button>
                            <div className="absolute bottom-0 inset-x-0 bg-black/40 px-1.5 py-1 text-[10px] text-white truncate">
                              {m.name}
                            </div>
                          </div>
                        ))}
                        {mediaFiles.length < 6 && (
                          <button
                            type="button"
                            onClick={() => mediaInputRef.current?.click()}
                            className="aspect-square rounded-xl border border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                          >
                            <Camera className="h-5 w-5" />
                            <span className="text-[10px]">הוסף</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-muted-foreground">חזרה</button>
                <button type="button" onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white">
                  המשך ל-NDA ופרסום
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-5 space-y-4">
                <h2 className="text-lg font-bold text-foreground">דרישת NDA</h2>
                <label className="flex items-start gap-3 rounded-xl border border-[var(--border)] p-4 cursor-pointer hover:border-primary transition-colors">
                  <input
                    type="checkbox"
                    checked={requireNda}
                    onChange={event => {
                      setRequireNda(event.target.checked);
                      if (!event.target.checked) setNdaPaid(false);
                    }}
                    className="mt-0.5 h-4 w-4 accent-[var(--primary)]"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-foreground">להוסיף NDA דרך המערכת (בתוספת תשלום)</span>
                    <span className="block text-xs text-muted-foreground mt-1">מצטרפים לפרויקט יידרשו לחתום דיגיטלית על הסכם סודיות לפני ההצטרפות.</span>
                  </span>
                </label>

                {requireNda && (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">תשלום הפעלת NDA</span>
                      <span className="text-sm font-bold text-primary">₪49</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      התשלום הוא Mock לצורך תצוגה — חיבור לספק תשלומים אמיתי (Stripe) יתבצע כאשר הבקאנד יהיה מוכן.
                    </p>
                    {ndaPaid ? (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary">
                        <Check className="h-4 w-4" />
                        התשלום בוצע בהצלחה
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handlePayNda()}
                        disabled={ndaPaying}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {ndaPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {ndaPaying ? "מעבד תשלום..." : "שלם והפעל NDA"}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-5 space-y-3">
                <h2 className="text-lg font-bold text-foreground">פרסום הפרויקט</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setIsDraft(false)}
                    className={`rounded-xl border p-4 text-right transition-colors ${!isDraft ? "border-primary bg-primary/5" : "border-[var(--border)]"}`}
                  >
                    <span className="block text-sm font-semibold text-foreground">פרסום מיידי</span>
                    <span className="block text-xs text-muted-foreground mt-1">הפרויקט יהיה חשוף לכל המשתמשים מרגע היצירה.</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDraft(true)}
                    className={`rounded-xl border p-4 text-right transition-colors ${isDraft ? "border-primary bg-primary/5" : "border-[var(--border)]"}`}
                  >
                    <span className="block text-sm font-semibold text-foreground">שמירה כטיוטה</span>
                    <span className="block text-xs text-muted-foreground mt-1">הפרויקט יישמר פרטי עד שתבחרו לפרסם אותו.</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  TODO backend: סטטוס Draft אינו נתמך עדיין בסכמת ה-GraphQL — הבחירה כאן מוכנה ל-UI בלבד.
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-muted-foreground">חזרה</button>
                <button type="submit" disabled={submitting || (requireNda && !ndaPaid)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {submitting ? "יוצר פרויקט..." : isDraft ? "שמירה כטיוטה" : "יצירת פרויקט ופרסום"}
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </main>
  );
}

function ChipList({ values, onRemove }: { values: string[]; onRemove: (value: string) => void }) {
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {values.map(value => (
        <span key={value} className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          {value}
          <button type="button" onClick={() => onRemove(value)} aria-label={`הסרת ${value}`}><X className="h-3 w-3" /></button>
        </span>
      ))}
    </div>
  );
}
