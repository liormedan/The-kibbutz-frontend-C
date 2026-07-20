# הקיבוץ — Frontend

> **Stack:** Next.js 16 · React 19 · TypeScript · Tailwind CSS v4 · Zustand · REST (fetch)

פרונטנד של The Kibbutz, מחובר לבקאנד **ASP.NET Core REST** (`KibbutzBackend`).

## הרצה מקומית

```bash
npm install
cp .env.example .env.development.local   # ערוך לפי הצורך
npm run dev                              # http://localhost:3000
```

ודא שהבקאנד רץ (ברירת מחדל `http://localhost:19653`) ושכתובת הפרונט מופיעה
ב-`Cors:AllowedOrigins` בצד הבקאנד.

## משתני סביבה

| משתנה | תיאור | ברירת מחדל |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | כתובת בסיס של ה-REST API | `http://localhost:19653` |
| `NEXT_PUBLIC_ADMIN_URL` | אפליקציית האדמין החיצונית | `http://localhost:3001` |
| `NEXT_PUBLIC_DEV_BYPASS` | כפתור כניסת מפתחים | `false` |

## ארכיטקטורה

```
src/
├─ lib/api/            # שכבת ה-REST (החוזה מול הבקאנד)
│  ├─ types.ts         #   DTOs + enums (משקף 1:1 את KibbutzBackend)
│  ├─ client.ts        #   fetch wrapper: JWT, refresh, ApiResponse envelope
│  ├─ mappers.ts       #   DTO → טיפוסי ה-UI
│  └─ pending.ts       #   עוזרים לפיצ'רים שאין להם בקאנד עדיין
├─ services/           # שירותים לפי דומיין (auth, post, portfolio, ...)
├─ store/              # Zustand stores
├─ components/         # רכיבי UI
└─ app/                # דפי App Router
```

**עיקרון:** כל התרגום בין הבקאנד ל-UI מרוכז ב-`src/lib/api/mappers.ts` —
הדפים והרכיבים לא יודעים על צורת ה-DTO.

## מצב הפיצ'רים

חלק מהדפים מחוברים לבקאנד ופועלים במלואם; אחרים שומרים על העיצוב אך מסומנים
**"בקרוב"** כי אין להם endpoint בבקאנד עדיין.

- ✅ **עובד:** התחברות/הרשמה, פיד (`/feed`), תיקי עבודות (`/portfolios`), הודעות,
  התראות, חברים.
- ❌ **"בקרוב":** פרויקטים, מועמדויות, התאמות, צוותים, NDA, OAuth, שחזור סיסמה,
  עדכון פרופיל.

הרשימה המלאה של ה-endpoints החסרים בצד הבקאנד: [`BACKEND_GAPS.md`](./BACKEND_GAPS.md).
