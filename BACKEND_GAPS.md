# פערי בקאנד — The Kibbutz Frontend

מסמך זה מרכז את כל הפערים בין הפרונטנד (Next.js) לבין הבקאנד הקיים
(`KibbutzBackend`, ASP.NET Core REST). הוא נועד לסגירה מול מנהל הבקאנד:
לכל דף/פיצ'ר מצוין מה כבר עובד, ומה חסר בצד השרת כדי שיעבוד.

> **רקע:** הפרונט נבנה במקור מול הנחת GraphQL ודומיין של *פרויקטים והתאמות*.
> הבקאנד בפועל הוא REST עם דומיין של *רשת חברתית* (posts, comments, portfolios,
> friendships, messages, notifications). הריפו הזה חוּוט מחדש ל-REST; פיצ'רים
> ללא endpoint מסומנים כ־"בקרוב" ומרוכזים כאן.

## מקרא
- ✅ עובד מול הבקאנד
- 🟡 עובד חלקית (חלק מהשדות/פעולות חסרים)
- ❌ אין endpoint בבקאנד — מסומן "בקרוב" בפרונט

---

## ✅ עובד — קיים בבקאנד

| פיצ'ר | פרונט | Endpoint בבקאנד |
|---|---|---|
| התחברות | `/login` | `POST /api/auth/login` |
| הרשמה | `/register` | `POST /api/auth/register` |
| רענון טוקן | (אוטומטי) | `POST /api/auth/refresh-token` |
| התנתקות | סייד-בר | `POST /api/auth/logout` |
| המשתמש הנוכחי | layout / profile | `GET /api/auth/me` |
| פיד חברתי | `/feed` | `GET /api/posts/feed`, `POST /api/posts`, like/unlike, delete |
| פוסט + תגובות | `/feed/[id]` | `GET /api/posts/{id}`, `/api/comments/posts/{id}` |
| תיקי עבודות | `/portfolios` | `GET/POST /api/portfolios`, like, delete |
| הודעות | `/messages` | `/api/messages/*` |
| התראות | פעמון | `/api/notifications/*` |
| חברים/קשרים | `/profile/[id]`, FriendsTab | `/api/friendships/*` |

---

## 🟡 עובד חלקית — פערי שדות/פעולות

### הרשמה (`POST /api/auth/register`)
הפרונט מקבל שדה `name` יחיד ו-`role` מסוג `participant|entrepreneur`, אך הבקאנד
דורש `FirstName`, `LastName`, `Username`, ו-`Role` כ-enum מספרי
(`Guest=0..Administrator=5`).
- **פתרון זמני בפרונט:** מפצל `name` ל-first/last, גוזר `username` מהאימייל,
  וממפה `participant|entrepreneur → Member(1)`.
- **בקשה מהבקאנד:** או לקבל `name`+`role` מחרוזתי, או שהפרונט יוסיף שדות
  first/last/username בטופס. צריך להחליט יחד.

### תפקידים (Roles)
תפקידי הבקאנד: `Guest, Member, Resident, KibbutzMember, Volunteer, Administrator`.
תפקידי הפרונט: `participant, entrepreneur, admin`. אין התאמה.
- **בקשה:** להגדיר מיפוי רשמי, או ליישר את שתי הרשימות.

### התראות — טקסונומיה שונה
הבקאנד: `PostLike, PostComment, CommentReply, FriendRequest, ... EventReminder`.
הפרונט מיפה אליהם. אין `application/nda/badge` בבקאנד (שייכים לדומיין הישן).

### הודעות — מבנה שיחות
הבקאנד מבוסס `conversationId` (עם `participants`), הפרונט המקורי היה מבוסס
"צ'אט לפי משתמש". חוּוט מחדש למודל השיחות. **אין SignalR/realtime** בבקאנד —
הוחלף ב-polling. אם רוצים realtime, צריך hub בבקאנד.

### פרופיל — קריאה בלבד
`GET /api/auth/me` עובד. חסר: `GET /api/users/{id}` (פרופיל ציבורי),
`PUT /api/users/me` (עדכון פרופיל), העלאת avatar, `GET /api/users/search`.
כרגע `/profile/[id]` והעדכון מסומנים "בקרוב".

---

## ❌ חסר לגמרי — אין endpoint (מסומן "בקרוב")

הדפים קיימים ושומרים על העיצוב, אך אינם מחוברים לשרת. כדי להפעילם צריך
להוסיף את ה-endpoints הבאים בבקאנד (או להסיר את הדפים):

### פרופיל ומשתמשים
- `GET /api/users/{id}` — פרופיל משתמש ציבורי
- `PUT /api/users/me` — עדכון פרופיל (bio, שם, קישורים, כישורים)
- `POST /api/users/me/avatar` — העלאת תמונת פרופיל
- `GET /api/users/search?q=` — חיפוש משתמשים
- מעקב: `POST/DELETE /api/users/{id}/follow`, `GET /api/users/me/followers|following`
  (בבקאנד יש friendships אך לא follow)

### פרויקטים (`/projects*`, `/dashboard*`, `/matches`)
דומיין שלם שאינו קיים בבקאנד:
- `GET/POST /api/projects`, `GET/PUT/DELETE /api/projects/{id}`
- `GET /api/projects/mine`, `GET /api/projects/joined`, `GET /api/projects/matching`
- מדיה: `POST/DELETE /api/projects/{id}/media`
- תגובות פרויקט: `POST /api/projects/{id}/comments`

### מועמדויות (`/dashboard/applications`, `/dashboard/my-applications`)
- `POST /api/projects/{id}/applications`
- `GET /api/projects/{id}/applications`
- `PUT /api/applications/{id}` (accept/reject)

### התאמות (`/matches`)
- `GET /api/matching/projects`, `GET /api/matching/users?projectId=`

### צוותים (`/projects/[id]/team`)
- `GET /api/projects/{id}/team`, `PUT /api/teams/{id}/status`

### הזמנות
- `POST /api/invites`, `PUT /api/invites/{id}/accept|reject`

### NDA (`/nda`, `/nda/inbox`)
- `GET/POST /api/ndas`, `GET /api/ndas/{id}`, `PUT /api/ndas/{id}/sign|reject`

### דיווחים
- `POST /api/reports`

### תגי הצלחה (Badges)
- `GET /api/users/me/badges`, `POST /api/projects/{id}/success`

### אימות והרשאות
- OAuth: `/api/auth/oauth/{provider}` (google/github/linkedin)
- שחזור סיסמה: `POST /api/auth/forgot-password`, `POST /api/auth/reset-password`
- אימות אימייל: `POST /api/auth/verify-email`, `POST /api/auth/resend-verification`

---

## פערי תשתית (צד בקאנד)

1. **CORS** — כרגע מתיר `localhost:3000/3001` בלבד (`appsettings.json`).
   הפרונט רץ על 3000 בברירת מחדל; ודאו שהכתובת בפועל מופיעה ב-`Cors:AllowedOrigins`.
2. **פורט** — הבקאנד רץ על `http://localhost:19653` / `https://localhost:19652`.
   הפרונט מוגדר ל-`NEXT_PUBLIC_API_URL=http://localhost:19653`.
3. **`GET /api/auth/me`** מחזיר את ישות `User` הגולמית (כולל `passwordHash`) ולא
   `UserProfileDto`. מומלץ להחזיר DTO ללא שדות רגישים.
4. **Enums כמספרים** — הבקאנד לא רשם `JsonStringEnumConverter`, לכן כל ה-enums
   עוברים כמספרים. הפרונט מסתמך על זה. אם משנים ל-strings — צריך לעדכן את הפרונט.
5. **`/api/posts/feed`** מסומן `[AllowAnonymous]` אך קורא ל-`GetCurrentUserId()`
   ללא בדיקה — ייכשל למשתמש לא מחובר. מומלץ לתקן בבקאנד.

---

## 🐛 באגים שהתגלו ב-E2E (2026-07-20)

בבדיקת E2E מול הבקאנד האמיתי התגלו שלושה באגים בצד השרת (הפרונט תקין):

1. **`POST /api/posts` → 400 (NullReferenceException)** — הפוסט נשמר אך התשובה
   נכשלת כי `post.Author` לא נטען לפני המיפוי ל-DTO.
2. **`POST /api/portfolios` → 400** — אותו שורש (`portfolio.Owner` null).
3. **`GET /api/messages/conversations` → 400** — filtered include עם `.Take(1)`
   דורש `SQL APPLY` שאין ב-SQLite.

תיאור מלא + patch מדויק לכל אחד: ראה `docs/BACKEND_BUGS.md`. אחרי התיקונים:
**15/15** בדיקות E2E עוברות (auth · posts · comments · portfolios · notifications ·
conversations/messages).
