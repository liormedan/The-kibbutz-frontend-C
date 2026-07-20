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
import { useI18n } from "@/lib/i18n/LanguageProvider";

interface RoleInput {
  title: string;
  requiredSkills: string[];
  slots: number;
}

const ICON_OPTIONS: { value: ProjectIconType; labelKey: string }[] = [
  { value: "leaf", labelKey: "projIconLeaf" },
  { value: "cpu", labelKey: "projIconCpu" },
  { value: "database", labelKey: "projIconDatabase" },
  { value: "globe", labelKey: "projIconGlobe" },
];

export default function CreateProjectPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
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
      setError(t("projRoleNameRequired"));
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
      setError(t("projTitleDescRequired"));
      return;
    }
    if (maxMembers < 2 || maxMembers > 20) {
      setError(t("projMembersRange"));
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
      setError(t("projNdaPaymentRequired"));
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
      router.push("/projects");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : t("projCreateFailed"));
    } finally {
      setSubmitting(false);
    }
  }

  const fieldClass = "w-full rounded-xl border border-[var(--border)] bg-background px-4 py-3 text-sm text-foreground outline-none transition-colors focus:border-primary";

  return (
    <main className="min-h-screen bg-background p-4 md:p-8" dir={dir}>
      <div className="mx-auto max-w-2xl">
        <ComingSoonBanner feature={t("projCreateFeature")} className="mb-4" />
        <button type="button" onClick={() => router.back()} className="mb-6 flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
          {t("projBack")}
        </button>

        <form onSubmit={handleSubmit} className="glass-panel space-y-6 rounded-2xl border border-[var(--border)] p-6 md:p-8">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">{t("projCreateTitle")}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {step === 0
                  ? t("projCreateStep0Desc")
                  : step === 1
                    ? t("projCreateStep1Desc")
                    : step === 2
                      ? t("projCreateStep2Desc")
                      : t("projCreateStep3Desc")}
              </p>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              {t("projStepOf", { step: step + 1 })}
            </span>
          </div>

          {error && <p className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-600">{error}</p>}

          {step === 0 ? (
            <>
              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">{t("projFieldTitle")}</span>
                <input required value={title} onChange={event => setTitle(event.target.value)} className={fieldClass} />
              </label>

              <label className="block space-y-2">
                <span className="text-sm font-semibold text-foreground">{t("projFieldDescription")}</span>
                <textarea required rows={5} value={description} onChange={event => setDescription(event.target.value)} className={`${fieldClass} resize-none`} />
              </label>

              <div className="space-y-2">
                <span className="text-sm font-semibold text-foreground">{t("projFieldTags")}</span>
                <div className="flex gap-2">
                  <input value={tagInput} onChange={event => setTagInput(event.target.value)} onKeyDown={event => handleEnter(event, addTag)} className={fieldClass} placeholder={t("projTagPlaceholder")} />
                  <button type="button" onClick={addTag} className="rounded-xl bg-primary px-4 text-white"><Plus className="h-4 w-4" /></button>
                </div>
                <ChipList values={tags} onRemove={tag => setTags(current => current.filter(item => item !== tag))} />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">{t("projMaxMembers")}</span>
                  <input required type="number" min={2} max={20} value={maxMembers} onChange={event => setMaxMembers(Number(event.target.value))} className={fieldClass} />
                </label>
                <label className="block space-y-2">
                  <span className="text-sm font-semibold text-foreground">{t("projIconType")}</span>
                  <select value={iconType} onChange={event => setIconType(event.target.value as ProjectIconType)} className={fieldClass}>
                    {ICON_OPTIONS.map(option => <option key={option.value} value={option.value}>{t(option.labelKey)}</option>)}
                  </select>
                </label>
              </div>

              <button type="button" onClick={goToRoles} className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white">
                {t("projContinueToRoles")}
                <ChevronLeft className="h-4 w-4" />
              </button>
            </>
          ) : step === 1 ? (
            <>
              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-4">
                <div className="grid gap-3 sm:grid-cols-[1fr_110px]">
                  <input value={roleTitle} onChange={event => setRoleTitle(event.target.value)} className={fieldClass} placeholder={t("projRoleTitlePlaceholder")} />
                  <input type="number" min={1} max={5} value={roleSlots} onChange={event => setRoleSlots(Number(event.target.value))} className={fieldClass} aria-label={t("projSlotsAria")} />
                </div>
                <div className="mt-3 flex gap-2">
                  <input value={roleSkillInput} onChange={event => setRoleSkillInput(event.target.value)} onKeyDown={event => handleEnter(event, addRoleSkill)} className={fieldClass} placeholder={t("projSkillPlaceholder")} />
                  <button type="button" onClick={addRoleSkill} className="rounded-xl border border-primary px-4 text-primary"><Plus className="h-4 w-4" /></button>
                </div>
                <ChipList values={roleSkills} onRemove={skill => setRoleSkills(current => current.filter(item => item !== skill))} />
                <button type="button" onClick={addRole} className="mt-4 flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-white">
                  <Plus className="h-4 w-4" />
                  {t("projAddRole")}
                </button>
              </div>

              <div className="space-y-3">
                {roles.map((role, index) => (
                  <div key={`${role.title}-${index}`} className="glass-card flex items-start justify-between gap-4 rounded-xl p-4">
                    <div>
                      <p className="font-semibold text-foreground">{role.title}</p>
                      <p className="text-xs text-muted-foreground">{t("projSlots", { count: role.slots })}</p>
                      <div className="mt-2 flex flex-wrap gap-1">
                        {role.requiredSkills.map(skill => <span key={skill} className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">{skill}</span>)}
                      </div>
                    </div>
                    <button type="button" onClick={() => setRoles(current => current.filter((_, itemIndex) => itemIndex !== index))} className="text-muted-foreground hover:text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
                {roles.length === 0 && <p className="text-center text-sm text-muted-foreground">{t("projNoRolesAdded")}</p>}
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-muted-foreground">{t("projBack")}</button>
                <button type="button" onClick={() => setStep(2)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white">
                  {t("projContinueToDigital")}
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : step === 2 ? (
            <>
              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-5">
                <div className="mb-5">
                  <h2 className="text-lg font-bold text-foreground">{t("projDigitalPresence")}</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    {t("projDigitalNote")}
                  </p>
                </div>
                <div className="space-y-5">
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">{t("projWebsite")}</span>
                    <input type="url" value={websiteUrl} onChange={event => setWebsiteUrl(event.target.value)} className={fieldClass} placeholder="https://yourproject.com" dir="ltr" />
                  </label>
                  <label className="block space-y-2">
                    <span className="text-sm font-semibold text-foreground">{t("projDemoVisual")}</span>
                    <input type="url" value={visualUrl} onChange={event => setVisualUrl(event.target.value)} className={fieldClass} placeholder={t("projDemoVisualPlaceholder")} dir="ltr" />
                  </label>
                  {/* item 54 – media gallery upload */}
                  <div className="space-y-2">
                    <span className="text-sm font-semibold text-foreground">{t("projGalleryOptional")}</span>
                    <p className="text-xs text-muted-foreground">{t("projGalleryNote")}</p>

                    {/* Upload zone */}
                    <button
                      type="button"
                      onClick={() => mediaInputRef.current?.click()}
                      disabled={mediaFiles.length >= 6}
                      className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-[var(--border)] bg-primary/5 py-5 text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Upload className="h-4 w-4" />
                      {mediaFiles.length >= 6 ? t("projGalleryLimit") : t("projClickAddImage")}
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
                            <span className="text-[10px]">{t("projAdd")}</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-muted-foreground">{t("projBack")}</button>
                <button type="button" onClick={() => setStep(3)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white">
                  {t("projContinueToNda")}
                  <ChevronLeft className="h-4 w-4" />
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-5 space-y-4">
                <h2 className="text-lg font-bold text-foreground">{t("projNdaRequirement")}</h2>
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
                    <span className="block text-sm font-semibold text-foreground">{t("projAddNda")}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{t("projNdaDesc")}</span>
                  </span>
                </label>

                {requireNda && (
                  <div className="rounded-xl border border-dashed border-[var(--border)] bg-primary/5 p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-foreground">{t("projNdaActivationPayment")}</span>
                      <span className="text-sm font-bold text-primary">₪49</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {t("projNdaMockNote")}
                    </p>
                    {ndaPaid ? (
                      <div className="flex items-center gap-2 rounded-lg bg-secondary/10 px-3 py-2 text-sm font-medium text-secondary">
                        <Check className="h-4 w-4" />
                        {t("projPaymentDone")}
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={() => void handlePayNda()}
                        disabled={ndaPaying}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-semibold text-white disabled:opacity-60"
                      >
                        {ndaPaying ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                        {ndaPaying ? t("projProcessingPayment") : t("projPayActivateNda")}
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="rounded-2xl border border-[var(--border)] bg-background/60 p-5 space-y-3">
                <h2 className="text-lg font-bold text-foreground">{t("projPublishProject")}</h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setIsDraft(false)}
                    className={`rounded-xl border p-4 text-right transition-colors ${!isDraft ? "border-primary bg-primary/5" : "border-[var(--border)]"}`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{t("projPublishNow")}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{t("projPublishNowDesc")}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsDraft(true)}
                    className={`rounded-xl border p-4 text-right transition-colors ${isDraft ? "border-primary bg-primary/5" : "border-[var(--border)]"}`}
                  >
                    <span className="block text-sm font-semibold text-foreground">{t("projSaveDraft")}</span>
                    <span className="block text-xs text-muted-foreground mt-1">{t("projSaveDraftDesc")}</span>
                  </button>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("projDraftTodoNote")}
                </p>
              </div>

              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="rounded-xl border border-[var(--border)] px-5 py-3 text-sm font-semibold text-muted-foreground">{t("projBack")}</button>
                <button type="submit" disabled={submitting || (requireNda && !ndaPaid)} className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-white disabled:opacity-60">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
                  {submitting ? t("projCreating") : isDraft ? t("projSaveDraft") : t("projCreatePublish")}
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
