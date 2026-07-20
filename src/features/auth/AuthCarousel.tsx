"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { ChevronRight, ChevronLeft } from "lucide-react";

/* ─── Slide definitions ─────────────────────────────────────────── */
interface Slide {
  id: number;
  title: string;
  subtitle: string;
  body: string;
  visual: React.ReactNode;
}

/* SVG illustrations — inline so no extra assets needed */
const IllustrationProjects = () => (
  <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
    {/* Board */}
    <rect x="20" y="30" width="220" height="140" rx="14" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    {/* Column headers */}
    <rect x="34" y="44" width="56" height="18" rx="6" fill="rgba(255,255,255,0.22)"/>
    <rect x="102" y="44" width="56" height="18" rx="6" fill="rgba(255,255,255,0.22)"/>
    <rect x="170" y="44" width="56" height="18" rx="6" fill="rgba(255,255,255,0.22)"/>
    {/* Cards col 1 */}
    <rect x="34" y="70" width="56" height="32" rx="7" fill="rgba(255,255,255,0.18)"/>
    <rect x="34" y="108" width="56" height="32" rx="7" fill="rgba(255,255,255,0.18)"/>
    {/* Cards col 2 */}
    <rect x="102" y="70" width="56" height="32" rx="7" fill="rgba(255,255,255,0.28)"/>
    {/* Cards col 3 */}
    <rect x="170" y="70" width="56" height="32" rx="7" fill="rgba(255,255,255,0.18)"/>
    <rect x="170" y="108" width="56" height="32" rx="7" fill="rgba(255,255,255,0.18)"/>
    {/* Plus badge */}
    <circle cx="210" cy="152" r="14" fill="rgba(255,255,255,0.9)"/>
    <line x1="210" y1="146" x2="210" y2="158" stroke="#d2642d" strokeWidth="2.5" strokeLinecap="round"/>
    <line x1="204" y1="152" x2="216" y2="152" stroke="#d2642d" strokeWidth="2.5" strokeLinecap="round"/>
    {/* Line details on cards */}
    <rect x="40" y="77" width="34" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="40" y="84" width="24" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
    <rect x="40" y="115" width="30" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="108" y="77" width="34" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="108" y="84" width="28" height="3" rx="1.5" fill="rgba(255,255,255,0.3)"/>
    <rect x="176" y="77" width="34" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
    <rect x="176" y="115" width="24" height="4" rx="2" fill="rgba(255,255,255,0.5)"/>
  </svg>
);

const IllustrationMatching = () => (
  <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
    {/* Left avatar */}
    <circle cx="62" cy="80" r="36" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
    <circle cx="62" cy="68" r="14" fill="rgba(255,255,255,0.4)"/>
    <path d="M30 110 Q62 96 94 110" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
    {/* Right avatar */}
    <circle cx="198" cy="80" r="36" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
    <circle cx="198" cy="68" r="14" fill="rgba(255,255,255,0.4)"/>
    <path d="M166 110 Q198 96 230 110" stroke="rgba(255,255,255,0.4)" strokeWidth="2" fill="rgba(255,255,255,0.1)"/>
    {/* Connection dots */}
    <circle cx="130" cy="80" r="18" fill="rgba(255,255,255,0.22)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
    <path d="M105 80 L112 80" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="3 2"/>
    <path d="M148 80 L155 80" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" strokeDasharray="3 2"/>
    {/* Heart */}
    <path d="M126 79 C126 76.5 128 75 130 77 C132 75 134 76.5 134 79 C134 81.5 130 85 130 85 C130 85 126 81.5 126 79Z" fill="rgba(255,255,255,0.9)"/>
    {/* Skill tags */}
    <rect x="20" y="128" width="56" height="16" rx="8" fill="rgba(255,255,255,0.2)"/>
    <rect x="82" y="128" width="46" height="16" rx="8" fill="rgba(255,255,255,0.2)"/>
    <rect x="134" y="128" width="60" height="16" rx="8" fill="rgba(255,255,255,0.2)"/>
    <rect x="40" y="150" width="46" height="16" rx="8" fill="rgba(255,255,255,0.15)"/>
    <rect x="94" y="150" width="72" height="16" rx="8" fill="rgba(255,255,255,0.15)"/>
    <rect x="174" y="150" width="50" height="16" rx="8" fill="rgba(255,255,255,0.15)"/>
  </svg>
);

const IllustrationNDA = () => (
  <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
    {/* Document */}
    <rect x="60" y="20" width="140" height="168" rx="12" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5"/>
    <rect x="60" y="20" width="140" height="36" rx="12" fill="rgba(255,255,255,0.22)"/>
    <rect x="60" y="44" width="140" height="12" fill="rgba(255,255,255,0.22)"/>
    {/* Title line */}
    <rect x="86" y="30" width="88" height="8" rx="4" fill="rgba(255,255,255,0.6)"/>
    {/* Text lines */}
    <rect x="78" y="72" width="104" height="5" rx="2.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="78" y="84" width="90" height="5" rx="2.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="78" y="96" width="96" height="5" rx="2.5" fill="rgba(255,255,255,0.35)"/>
    <rect x="78" y="108" width="78" height="5" rx="2.5" fill="rgba(255,255,255,0.35)"/>
    {/* Divider */}
    <line x1="78" y1="128" x2="182" y2="128" stroke="rgba(255,255,255,0.25)" strokeWidth="1" strokeDasharray="4 3"/>
    {/* Signature */}
    <path d="M86 148 Q96 138 106 148 Q116 158 126 148 Q136 138 148 148" stroke="rgba(255,255,255,0.8)" strokeWidth="2" strokeLinecap="round" fill="none"/>
    {/* Checkmark badge */}
    <circle cx="182" cy="148" r="16" fill="rgba(255,255,255,0.9)"/>
    <path d="M174 148 L180 154 L192 142" stroke="#d2642d" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
  </svg>
);

const IllustrationBadge = () => (
  <svg viewBox="0 0 260 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[260px]">
    {/* Center badge */}
    <circle cx="130" cy="90" r="52" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.4)" strokeWidth="2"/>
    <circle cx="130" cy="90" r="40" fill="rgba(255,255,255,0.2)" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5"/>
    {/* Star */}
    <path d="M130 58 L136.2 78.2 L157.6 78.2 L141.2 90.6 L147.4 110.8 L130 98.4 L112.6 110.8 L118.8 90.6 L102.4 78.2 L123.8 78.2 Z" fill="rgba(255,255,255,0.85)"/>
    {/* Orbiting small badges */}
    <circle cx="62" cy="58" r="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <path d="M62 48 L64.8 55.6 L73 55.6 L66.6 60.4 L69.4 68 L62 63.2 L54.6 68 L57.4 60.4 L51 55.6 L59.2 55.6 Z" fill="rgba(255,255,255,0.7)"/>
    <circle cx="198" cy="58" r="20" fill="rgba(255,255,255,0.15)" stroke="rgba(255,255,255,0.3)" strokeWidth="1.5"/>
    <path d="M198 48 L200.8 55.6 L209 55.6 L202.6 60.4 L205.4 68 L198 63.2 L190.6 68 L193.4 60.4 L187 55.6 L195.2 55.6 Z" fill="rgba(255,255,255,0.7)"/>
    {/* Connector lines */}
    <line x1="82" y1="65" x2="105" y2="76" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 2"/>
    <line x1="178" y1="65" x2="155" y2="76" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 2"/>
    {/* Bottom label */}
    <rect x="80" y="153" width="100" height="20" rx="10" fill="rgba(255,255,255,0.2)"/>
    <rect x="94" y="159" width="72" height="8" rx="4" fill="rgba(255,255,255,0.6)"/>
  </svg>
);

const SLIDES: Slide[] = [
  {
    id: 0,
    title: "הקיבוץ",
    subtitle: "פלטפורמת שיתוף פעולה קהילתית",
    body: "הצטרפו לחממת היוזמות השיתופית. מקום אחד לשתף פעולה, לפתח פרויקטים יחד, ולצמוח עם הקהילה.",
    visual: (
      <div className="relative w-40 h-40 rounded-full overflow-hidden shadow-2xl shadow-black/20 flex items-center justify-center animate-[float-slow_6s_infinite_ease-in-out] border border-white/20">
        <Image
          src="/logo_clean.png"
          alt="הקיבוץ"
          fill
          className="object-cover"
          priority
        />
      </div>
    ),
  },
  {
    id: 1,
    title: "פרויקטים משותפים",
    subtitle: "צרו, נהלו והצטרפו",
    body: "פתחו פרויקט, הגדירו תפקידים ומצאו שותפים שישלימו את הצוות. כל פרויקט — לוח משימות, צ׳אט קבוצתי ומעקב התקדמות.",
    visual: <IllustrationProjects />,
  },
  {
    id: 2,
    title: "Matching חכם",
    subtitle: "אנשים נכונים לפרויקט הנכון",
    body: "האלגוריתם מתאים בין יזמים למשתתפים לפי כישורים, רמת ניסיון ותחומי עניין. פחות חיפוש, יותר עשייה.",
    visual: <IllustrationMatching />,
  },
  {
    id: 3,
    title: "NDA דיגיטלי",
    subtitle: "סודיות בלחיצת כפתור",
    body: "חתמו על חוזי סודיות דיגיטליים ישירות בפלטפורמה. שמרו על הרעיונות שלכם מאובטחים לפני שחושפים אותם לשותפים.",
    visual: <IllustrationNDA />,
  },
  {
    id: 4,
    title: "תגי הצלחה",
    subtitle: "הוכחת ניסיון אמיתי",
    body: "כל פרויקט שהושלם מצרף תג הצלחה לפרופיל. הפרופיל שלכם מספר את הסיפור האמיתי של מה שבניתם.",
    visual: <IllustrationBadge />,
  },
];

const AUTO_ADVANCE_MS = 4000;

export default function AuthCarousel() {
  const [current, setCurrent] = useState(0);
  const [paused, setPaused] = useState(false);
  const [animDir, setAnimDir] = useState<"in" | "out">("in");

  const goTo = useCallback((idx: number) => {
    setAnimDir("out");
    setTimeout(() => {
      setCurrent(idx);
      setAnimDir("in");
    }, 180);
  }, []);

  const prev = useCallback(() => goTo((current - 1 + SLIDES.length) % SLIDES.length), [current, goTo]);
  const next = useCallback(() => goTo((current + 1) % SLIDES.length), [current, goTo]);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(next, AUTO_ADVANCE_MS);
    return () => clearInterval(t);
  }, [paused, next]);

  const slide = SLIDES[current];

  return (
    <div
      className="hidden lg:flex flex-col items-center justify-center bg-gradient-to-br from-[#d2642d] to-[#e6733b] p-10 relative overflow-hidden border-l border-white/10 text-white select-none"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── keyframes ── */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes shimmer-sweep {
          0%   { transform: translateX(-150%) skewX(-20deg); }
          50%  { transform: translateX(150%)  skewX(-20deg); }
          100% { transform: translateX(150%)  skewX(-20deg); }
        }
        @keyframes float-slow {
          0%,100% { transform: translateY(0px) rotate(0deg); }
          50%      { transform: translateY(-10px) rotate(1deg); }
        }
        @keyframes slide-in {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-out {
          from { opacity: 1; transform: translateY(0); }
          to   { opacity: 0; transform: translateY(-10px); }
        }
        .carousel-in  { animation: slide-in  0.22s ease forwards; }
        .carousel-out { animation: slide-out 0.18s ease forwards; }
      `}} />

      {/* Shimmer glass overlay */}
      <div className="absolute inset-0 bg-white/[0.08] backdrop-blur-md shadow-[inset_0_0_80px_rgba(255,255,255,0.15)] pointer-events-none" />

      {/* Sparkles */}
      <div className="absolute top-12 right-16 w-1.5 h-1.5 rounded-full bg-white/60 animate-ping" />
      <div className="absolute top-1/4 left-12 w-2 h-2 rounded-full bg-white/40 animate-pulse" />
      <div className="absolute bottom-20 right-1/4 w-2 h-2 rounded-full bg-white/50 animate-pulse [animation-delay:1s]" />
      <div className="absolute bottom-1/3 left-20 w-1.5 h-1.5 rounded-full bg-white/30 animate-pulse [animation-delay:2s]" />
      <div className="absolute top-1/3 right-8 w-2 h-2 rounded-full bg-white/55 animate-ping [animation-delay:1.5s]" />

      {/* Shimmer sweep */}
      <div
        className="absolute inset-0 w-[50%] h-full opacity-25 pointer-events-none"
        style={{
          background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.4) 50%, transparent)",
          animation: "shimmer-sweep 8s infinite ease-in-out",
        }}
      />

      {/* ── Logo ── */}
      <div className="flex items-center gap-2 mb-6 z-10">
        <Image src="/logo_clean.png" alt="הקיבוץ" width={36} height={36} className="w-9 h-9 rounded-full object-cover border border-white/30 shadow-md" />
        <span className="font-bold text-white text-lg tracking-tight drop-shadow-sm">הקיבוץ</span>
      </div>

      {/* ── Slide content ── */}
      <div className={`z-10 flex flex-col items-center text-center w-full max-w-xs ${animDir === "in" ? "carousel-in" : "carousel-out"}`}>
        {/* Visual */}
        <div className="w-full flex justify-center mb-5 min-h-[160px] items-center">
          {slide.visual}
        </div>

        {/* Text */}
        <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-sm">{slide.title}</h2>
        <p className="text-xs font-semibold text-white/70 mb-3 uppercase tracking-wide">{slide.subtitle}</p>
        <p className="text-sm text-white/90 leading-relaxed">{slide.body}</p>
      </div>

      {/* ── Navigation arrows ── */}
      <div className="z-10 flex items-center gap-6 mt-7">
        <button
          onClick={prev}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 flex items-center justify-center transition-all cursor-pointer"
          aria-label="הקודם"
        >
          <ChevronRight className="w-4 h-4 text-white" />
        </button>

        {/* Dot indicators */}
        <div className="flex gap-2">
          {SLIDES.map((s) => (
            <button
              key={s.id}
              onClick={() => goTo(s.id)}
              className={`rounded-full transition-all cursor-pointer ${
                s.id === current
                  ? "w-6 h-2.5 bg-white"
                  : "w-2.5 h-2.5 bg-white/35 hover:bg-white/60"
              }`}
              aria-label={`שקופית ${s.id + 1}`}
            />
          ))}
        </div>

        <button
          onClick={next}
          className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/30 border border-white/25 flex items-center justify-center transition-all cursor-pointer"
          aria-label="הבא"
        >
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      </div>

      {/* Slide counter */}
      <p className="z-10 mt-2 text-[10px] text-white/40 tabular-nums">
        {current + 1} / {SLIDES.length}
      </p>
    </div>
  );
}
