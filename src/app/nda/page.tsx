"use client";
/* eslint-disable react/no-unescaped-entities */

/**
 * הקיבוץ – NDA Creation Page
 * נתיב: /nda
 * TODO backend:
 *   POST /nda/create → { formData } → returns { pdfUrl, contractId }
 *   POST /nda/send   → { contractId, recipientUserId }
 *   GET  /nda/:id    → contract details
 * TODO payment: גבייה לפני יצירה — Stripe PaymentIntent
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FileText, Send, ChevronRight, Check, Loader2, Shield, AlertCircle, Lock, CreditCard } from "lucide-react";
import NdaTemplate from "@/components/NdaTemplate";
import ComingSoonBanner from "@/components/ComingSoonBanner";
import { useI18n } from "@/lib/i18n/LanguageProvider";

type Step = "form" | "payment" | "preview" | "sent";

const CONFIDENTIALITY_PERIODS = ["6 חודשים", "12 חודשים", "24 חודשים", "36 חודשים", "ללא הגבלה"];

export default function NdaPage() {
  const router = useRouter();
  const { t, dir } = useI18n();
  const [step, setStep] = useState<Step>("form");
  const [loading, setLoading] = useState(false);

  // payment mock state
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvc, setCardCvc] = useState("");
  const [cardName, setCardName] = useState("");
  const [payError, setPayError] = useState("");

  const formatCardNumber = (v: string) =>
    v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = (v: string) =>
    v.replace(/\D/g, "").slice(0, 4).replace(/^(\d{2})(\d)/, "$1/$2");

  const [form, setForm] = useState({
    entrepreneurName: "",
    participantName:  "",
    projectName:      "",
    date:             new Date().toISOString().split("T")[0],
    confidentialityPeriod: "12 חודשים",
    intellectualProperty: t("ndaDefaultIP"),
    responsibilities: t("ndaDefaultResp"),
    contactEmail: "",
  });

  const update = (f: string, v: string) => setForm(p => ({ ...p, [f]: v }));

  const isFormValid = form.entrepreneurName && form.participantName &&
    form.projectName && form.contactEmail;

  async function handleGenerate() {
    setStep("payment");
  }

  async function handlePay() {
    setPayError("");
    const raw = cardNumber.replace(/\s/g, "");
    if (raw.length < 16 || !cardExpiry.includes("/") || cardCvc.length < 3 || !cardName.trim()) {
      setPayError(t("ndaPayError"));
      return;
    }
    setLoading(true);
    try {
      // TODO: Stripe PaymentIntent → POST /payments/nda-charge
      await new Promise(r => setTimeout(r, 1400));
      setStep("preview");
    } finally { setLoading(false); }
  }

  async function handleSend() {
    setLoading(true);
    try {
      // TODO (pending backend — see BACKEND_GAPS.md): POST ${NEXT_PUBLIC_API_URL}/api/ndas
      //   method: "POST", body: JSON.stringify({ contractId, recipientUserId }),
      // })
      await new Promise(r => setTimeout(r, 800));
      setStep("sent");
    } finally { setLoading(false); }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-background text-foreground text-sm focus:outline-none focus:border-primary transition-colors";
  const labelClass = "block text-xs font-semibold text-muted-foreground mb-1.5 text-right";

  const periodLabels: Record<string, string> = {
    "6 חודשים": t("ndaPeriod6Months"),
    "12 חודשים": t("ndaPeriod12Months"),
    "24 חודשים": t("ndaPeriod24Months"),
    "36 חודשים": t("ndaPeriod36Months"),
    "ללא הגבלה": t("ndaPeriodUnlimited"),
  };

  return (
    <div className="min-h-screen bg-background p-6" dir={dir}>
      <div className="max-w-2xl mx-auto">

        <ComingSoonBanner feature={t("ndaFeature")} className="mb-4" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
            <ChevronRight className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Shield className="w-6 h-6 text-primary" />
            <h1 className="text-2xl font-bold text-foreground">{t("ndaCreateTitle")}</h1>
          </div>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8 text-xs font-semibold">
          {(["form", "payment", "preview", "sent"] as Step[]).map((s, i) => {
            const labels: Record<Step, string> = { form: t("ndaStepForm"), payment: t("ndaStepPayment"), preview: t("ndaStepPreview"), sent: t("ndaStepSent") };
            const stepIdx = ["form", "payment", "preview", "sent"].indexOf(step);
            const done = i < stepIdx;
            const active = s === step;
            return (
              <div key={s} className="flex items-center gap-2">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold transition-all ${
                  active ? "bg-primary text-white" :
                  done ? "bg-primary/20 text-primary" :
                  "bg-slate-800 text-slate-500"
                }`}>
                  {done ? <Check className="w-3 h-3" /> : <span>{i + 1}</span>}
                  {labels[s]}
                </div>
                {i < 3 && <div className={`h-px w-6 ${done ? "bg-primary/40" : "bg-white/10"}`} />}
              </div>
            );
          })}
        </div>

        {/* Legal disclaimer */}
        <div className="flex items-start gap-3 p-4 rounded-xl mb-6"
          style={{ background: "rgba(210,100,45,0.07)", border: "1px solid rgba(210,100,45,0.2)" }}>
          <AlertCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            {t("ndaDisclaimer")}
          </p>
        </div>

        {/* ── FORM ── */}
        {step === "form" && (
          <div className="glass-panel rounded-2xl p-8 border border-[var(--border)] space-y-5">
            <h2 className="text-lg font-bold text-foreground mb-4">{t("ndaContractDetails")}</h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("ndaEntrepreneurName")}</label>
                <input type="text" value={form.entrepreneurName}
                  onChange={e => update("entrepreneurName", e.target.value)}
                  placeholder={t("ndaFullName")} className={inputClass} />
              </div>
              <div>
                <label className={labelClass}>{t("ndaParticipantName")}</label>
                <input type="text" value={form.participantName}
                  onChange={e => update("participantName", e.target.value)}
                  placeholder={t("ndaFullName")} className={inputClass} />
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("ndaProjectName")}</label>
              <input type="text" value={form.projectName}
                onChange={e => update("projectName", e.target.value)}
                placeholder={t("ndaProjectNamePlaceholder")} className={inputClass} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>{t("ndaDate")}</label>
                <input type="date" value={form.date}
                  onChange={e => update("date", e.target.value)}
                  className={inputClass} dir="ltr" />
              </div>
              <div>
                <label className={labelClass}>{t("ndaConfidentialityPeriod")}</label>
                <select value={form.confidentialityPeriod}
                  onChange={e => update("confidentialityPeriod", e.target.value)}
                  className={inputClass + " cursor-pointer"}>
                  {CONFIDENTIALITY_PERIODS.map(p => <option key={p} value={p}>{periodLabels[p] ?? p}</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className={labelClass}>{t("ndaIntellectualProperty")}</label>
              <textarea value={form.intellectualProperty}
                onChange={e => update("intellectualProperty", e.target.value)}
                rows={2} className={inputClass + " resize-none"} />
            </div>

            <div>
              <label className={labelClass}>{t("ndaResponsibilities")}</label>
              <textarea value={form.responsibilities}
                onChange={e => update("responsibilities", e.target.value)}
                rows={2} className={inputClass + " resize-none"} />
            </div>

            <div>
              <label className={labelClass}>{t("ndaContactEmail")}</label>
              <input type="email" value={form.contactEmail}
                onChange={e => update("contactEmail", e.target.value)}
                placeholder="email@example.com" className={inputClass} dir="ltr" />
            </div>

            <button onClick={handleGenerate} disabled={!isFormValid || loading}
              className="w-full py-3 rounded-xl text-white font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-40 cursor-pointer"
              style={{ background: "linear-gradient(135deg, #d2642d, #e8753d)", boxShadow: "0 6px 20px -6px rgba(210,100,45,0.4)" }}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
              {loading ? t("ndaGenerating") : t("ndaGeneratePdf")}
            </button>
          </div>
        )}

        {/* ── PAYMENT ── */}
        {step === "payment" && (
          <div className="space-y-4">
            {/* Order summary */}
            <div className="glass-panel rounded-2xl border border-white/10 p-5">
              <h2 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />
                סיכום הזמנה
              </h2>
              <div className="flex justify-between items-center py-3 border-b border-white/5">
                <span className="text-sm text-foreground font-medium">הסכם סודיות (NDA) — {form.projectName}</span>
                <span className="text-sm font-bold text-foreground">₪49</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-white/5 text-xs text-slate-400">
                <span>מע"מ (17%)</span>
                <span>₪8.33</span>
              </div>
              <div className="flex justify-between items-center pt-3">
                <span className="text-sm font-bold text-foreground">סה"כ לתשלום</span>
                <span className="text-lg font-extrabold text-primary">₪57.33</span>
              </div>
            </div>

            {/* Card form */}
            <div className="glass-panel rounded-2xl border border-white/10 p-6 space-y-4">
              <div className="flex items-center justify-between mb-1">
                <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  פרטי כרטיס אשראי
                </h2>
                {/* Card brand logos mock */}
                <div className="flex items-center gap-2 opacity-70">
                  {["VISA", "MC", "AMEX"].map(b => (
                    <span key={b} className="text-[9px] font-extrabold border border-white/20 px-1.5 py-0.5 rounded text-slate-400">{b}</span>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">מספר כרטיס</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000 0000"
                    value={cardNumber}
                    onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                    dir="ltr"
                    className="w-full px-4 py-3 pr-10 rounded-xl border border-white/10 bg-slate-900 text-foreground text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-600 tracking-widest"
                  />
                  <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">שם בעל הכרטיס</label>
                <input
                  type="text"
                  placeholder="שם מלא כפי שמופיע על הכרטיס"
                  value={cardName}
                  onChange={e => setCardName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-foreground text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">תוקף (MM/YY)</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                    dir="ltr"
                    maxLength={5}
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-foreground text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">CVV</label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="•••"
                    value={cardCvc}
                    onChange={e => setCardCvc(e.target.value.replace(/\D/g, "").slice(0, 4))}
                    dir="ltr"
                    className="w-full px-4 py-3 rounded-xl border border-white/10 bg-slate-900 text-foreground text-sm focus:outline-none focus:border-primary transition-colors placeholder-slate-600"
                  />
                </div>
              </div>

              {payError && (
                <div className="flex items-center gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  {payError}
                </div>
              )}

              <button
                onClick={handlePay}
                disabled={loading}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 disabled:opacity-50 cursor-pointer"
                style={{ background: "linear-gradient(135deg, #d2642d, #e8753d)", boxShadow: "0 6px 20px -6px rgba(210,100,45,0.5)" }}
              >
                {loading
                  ? <><Loader2 className="w-4 h-4 animate-spin" />מעבד תשלום...</>
                  : <><Lock className="w-4 h-4" />שלם ₪57.33 באבטחה</>
                }
              </button>

              {/* Security badges */}
              <div className="flex items-center justify-center gap-4 pt-1">
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Lock className="w-3 h-3" />
                  SSL מוצפן
                </div>
                <div className="flex items-center gap-1 text-[10px] text-slate-500">
                  <Shield className="w-3 h-3" />
                  PCI DSS
                </div>
                <div className="text-[10px] text-slate-500">מופעל על ידי Stripe</div>
              </div>
            </div>

            <button
              onClick={() => setStep("form")}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer w-full text-center"
            >
              ← חזרה לעריכת הפרטים
            </button>
          </div>
        )}

        {/* ── PREVIEW ── */}
        {step === "preview" && (
          <div className="glass-panel rounded-2xl border border-[var(--border)] overflow-hidden">

            <NdaTemplate data={form} />

            {/* Actions */}
            <div className="p-6 border-t border-[var(--border)] flex items-center gap-3">
              <button onClick={() => setStep("form")}
                className="px-5 py-2.5 rounded-xl border border-[var(--border)] text-sm font-medium text-muted-foreground hover:text-foreground cursor-pointer transition-all">
                עריכה
              </button>
              <button onClick={() => window.print()}
                className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-all flex items-center gap-2">
                <FileText className="w-4 h-4" />
                הדפס / שמור PDF
              </button>
              <button onClick={handleSend} disabled={loading}
                className="flex-1 py-2.5 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 transition-all"
                style={{ background: "linear-gradient(135deg, #d2642d, #e8753d)" }}>
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {loading ? "שולח..." : "שלח למשתתף לחתימה"}
              </button>
            </div>
          </div>
        )}

        {/* ── SENT ── */}
        {step === "sent" && (
          <div className="glass-panel rounded-2xl p-12 border border-[var(--border)] text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-xl font-bold text-foreground mb-2">החוזה נשלח!</h2>
            <p className="text-sm text-muted-foreground mb-2">
              {form.participantName} יקבל התראה לאשר/לדחות את ההסכם.
            </p>
            <p className="text-xs text-muted-foreground mb-8">
              החוזה נשמר בפרופיל שלך תחת "החוזים שלי".
            </p>
            <button onClick={() => router.push("/projects")}
              className="px-8 py-3 rounded-xl text-white font-bold text-sm cursor-pointer transition-all"
              style={{ background: "linear-gradient(135deg, #d2642d, #e8753d)" }}>
              חזרה לפלטפורמה
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
