"use client";

import { useState } from "react";
import { ChevronRight, FileText, Shield, X } from "lucide-react";
import { useRouter } from "next/navigation";
import EmptyState from "@/components/EmptyState";
import NdaTemplate from "@/components/NdaTemplate";
import ComingSoonBanner from "@/components/ComingSoonBanner";

const templateDefaults = {
  participantName: "המשתתף",
  intellectualProperty: "כל הקניין הרוחני שנוצר במסגרת הפרויקט שייך ליזם.",
  responsibilities: "המשתתף מתחייב לא לחשוף מידע סודי לצדדים שלישיים.",
  contactEmail: "contact@example.com",
};

const MOCK_NDAS = [
  { id: "1", projectName: "EcoTech Platform", senderName: "גיא לוי", confidentialityPeriod: "12 חודשים", status: "pending" as const, createdAt: "2026-06-01", ...templateDefaults, contactEmail: "guy@example.com" },
  { id: "2", projectName: "AI Dashboard", senderName: "מיכל כהן", confidentialityPeriod: "24 חודשים", status: "pending" as const, createdAt: "2026-05-28", ...templateDefaults, contactEmail: "michal@example.com" },
  { id: "3", projectName: "FinTech App", senderName: "אלון שטיין", confidentialityPeriod: "6 חודשים", status: "signed" as const, createdAt: "2026-05-10", ...templateDefaults, contactEmail: "alon@example.com" },
  { id: "4", projectName: "Social Network", senderName: "נועה בן-דוד", confidentialityPeriod: "12 חודשים", status: "rejected" as const, createdAt: "2026-04-22", ...templateDefaults, contactEmail: "noa@example.com" },
];

type NdaStatus = "pending" | "signed" | "rejected";
type NdaItem = (typeof MOCK_NDAS)[number];

export default function NdaInboxPage() {
  const router = useRouter();
  const [ndaList, setNdaList] = useState<NdaItem[]>(MOCK_NDAS);
  const [activeTab, setActiveTab] = useState<"pending" | "history">("pending");
  const [viewingNdaId, setViewingNdaId] = useState<string | null>(null);
  const viewingNda = ndaList.find(nda => nda.id === viewingNdaId);

  const updateStatus = (id: string, status: NdaStatus) => {
    setNdaList(previous => previous.map(nda => nda.id === id ? { ...nda, status } as NdaItem : nda));
  };

  const filtered = activeTab === "pending"
    ? ndaList.filter(nda => nda.status === "pending")
    : ndaList.filter(nda => nda.status !== "pending");

  if (viewingNda) {
    return (
      <main className="min-h-screen bg-background p-4 md:p-6" dir="rtl">
        <div className="mx-auto max-w-4xl">
          <div className="mb-4 flex items-center justify-between" data-no-print>
            <button type="button" onClick={() => setViewingNdaId(null)} className="flex items-center gap-2 rounded-xl border border-border px-4 py-2 text-sm text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4" />
              סגור
            </button>
            <button type="button" onClick={() => window.print()} className="rounded-xl bg-primary px-4 py-2 text-sm font-medium text-white">
              הדפס / שמור PDF
            </button>
          </div>
          <div className="glass-card overflow-hidden rounded-2xl border border-border">
            <NdaTemplate data={{
              entrepreneurName: viewingNda.senderName,
              participantName: viewingNda.participantName,
              projectName: viewingNda.projectName,
              date: viewingNda.createdAt,
              confidentialityPeriod: viewingNda.confidentialityPeriod,
              intellectualProperty: viewingNda.intellectualProperty,
              responsibilities: viewingNda.responsibilities,
              contactEmail: viewingNda.contactEmail,
            }} />
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background p-6" dir="rtl">
      <div className="mx-auto max-w-3xl">
        <ComingSoonBanner feature="חוזי סודיות (NDA)" className="mb-4" />
        <button type="button" onClick={() => router.back()} className="mb-4 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ChevronRight className="h-4 w-4" />
          חזרה
        </button>

        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">תיבת NDA</h1>
            <p className="text-sm text-muted-foreground">חוזי סודיות שהתקבלו</p>
          </div>
        </div>

        <div className="mb-5 flex gap-2">
          {(["pending", "history"] as const).map(tab => (
            <button type="button" key={tab} onClick={() => setActiveTab(tab)} className={`rounded-xl px-4 py-2 text-sm font-medium ${activeTab === tab ? "bg-primary text-white" : "border border-border bg-background text-muted-foreground"}`}>
              {tab === "pending" ? "ממתינים לאישור" : "היסטוריה"}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<Shield className="h-8 w-8 text-primary" />}
            title={activeTab === "pending" ? "אין חוזי NDA ממתינים לאישור" : "היסטוריית ה-NDA שלך ריקה"}
            description="כאן יופיעו חוזי הסודיות שעליך לאשר או לחתום עליהם."
          />
        ) : filtered.map(nda => (
          <div key={nda.id} className="glass-card mb-3 rounded-2xl p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-semibold text-foreground">{nda.projectName}</p>
                <p className="mt-0.5 text-sm text-muted-foreground">נשלח על ידי: {nda.senderName}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">תקופת סודיות: {nda.confidentialityPeriod}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">{nda.createdAt}</p>
              </div>
              <StatusBadge status={nda.status} />
            </div>

            <div className="mt-3 flex gap-2">
              <button type="button" onClick={() => setViewingNdaId(nda.id)} className="flex items-center gap-1 rounded-lg border border-border px-3 py-1.5 text-xs text-foreground hover:border-primary">
                <FileText className="h-3 w-3" />
                צפה ב-PDF
              </button>
              {nda.status === "pending" && (
                <>
                  <button type="button" onClick={() => updateStatus(nda.id, "signed")} className="rounded-lg bg-secondary px-3 py-1.5 text-xs text-white">אשר</button>
                  <button type="button" onClick={() => updateStatus(nda.id, "rejected")} className="rounded-lg bg-red-50 px-3 py-1.5 text-xs text-red-500">דחה</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

function StatusBadge({ status }: { status: NdaStatus }) {
  const styles = {
    pending: "border-amber-200 bg-amber-50 text-amber-600",
    signed: "border-green-200 bg-green-50 text-green-600",
    rejected: "border-red-200 bg-red-50 text-red-500",
  };
  const labels = { pending: "ממתין", signed: "חתום", rejected: "נדחה" };
  return <span className={`rounded-lg border px-2 py-0.5 text-xs ${styles[status]}`}>{labels[status]}</span>;
}
