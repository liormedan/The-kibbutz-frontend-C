# פערי בקאנד — The Kibbutz

מסמך מרכז: כל מה שהפרונטנד (Next.js) צריך מהבקאנד (`KibbutzBackend`, ASP.NET Core)
ועדיין חסר או שבור. נועד להעברה למנהל הבקאנד.

> **רקע:** הפרונט נבנה במקור למוצר של **פרויקטים והתאמות**; הבקאנד בפועל הוא **רשת
> חברתית** (posts, portfolios, friendships, messages, notifications). הפרונט חוּוט
> מחדש ל-REST של הבקאנד. פיצ'רים ללא endpoint מסומנים "בקרוב" בפרונט ומרוכזים כאן.

**מקרא:** ✅ עובד · 🟡 חלקי · ❌ אין endpoint · 🐛 באג

---

## ✅ מה כבר עובד (מחובר ומאומת E2E)

| דומיין | Endpoints |
|---|---|
| אימות | `POST /api/auth/register\|login\|refresh-token\|logout` · `GET /api/auth/me` |
| פיד/פוסטים | `GET /api/posts/feed` · `POST /api/posts` · like/unlike · `DELETE` |
| תגובות | `GET/POST /api/comments/posts/{id}` · like/unlike · delete |
| תיקי עבודות | `GET/POST /api/portfolios` · get · like/unlike · delete |
| הודעות | `/api/messages/conversations*` · `POST /api/messages` |
| התראות | `/api/notifications*` |
| חברים | `/api/friendships*` |

---

## 1️⃣ דומיינים יתומים — ❌ אין שום endpoint

### פרויקטים — `גלה פרויקטים`, `הפרויקטים שלי`, `projects/[id]`
- `GET /api/projects` (רשימה + `filter`/`tag`/`search`)
- `GET /api/projects/{id}`
- `POST /api/projects` · `PUT /api/projects/{id}` · `DELETE /api/projects/{id}`
- `GET /api/projects/mine` · `GET /api/projects/joined` · `GET /api/projects/matching`
- `POST /api/projects/{id}/media` · `DELETE /api/projects/{id}/media/{mediaId}`
- `POST /api/projects/{id}/comments`
- `POST /api/projects/{id}/leave` · `POST /api/projects/{id}/close`

### מועמדויות — `מועמדויות`, `המועמדויות שלי`
- `POST /api/projects/{id}/applications` (הגשה)
- `GET /api/projects/{id}/applications` (רשימה ליזם)
- `PUT /api/applications/{id}` (accept/reject)
- `GET /api/applications/mine`

### התאמות — `matches`
- `GET /api/matching/projects`
- `GET /api/matching/users?projectId=`

### צוותים — `projects/[id]/team`
- `GET /api/projects/{id}/team`
- `PUT /api/teams/{id}/status`

### הזמנות (Invites)
- `POST /api/invites` · `PUT /api/invites/{id}/accept` · `PUT /api/invites/{id}/reject`

### NDA — `nda`, `nda/inbox`
- `GET /api/ndas` · `GET /api/ndas/{id}` · `POST /api/ndas`
- `PUT /api/ndas/{id}/sign` · `PUT /api/ndas/{id}/reject`

### דיווחים ותגי הצלחה
- `POST /api/reports`
- `GET /api/users/me/badges` · `POST /api/projects/{id}/success`

---

## 2️⃣ דומיינים חלקיים — 🟡 חלק קיים, חלק חסר

### משתמשים / פרופיל — קיים רק `GET /api/auth/me`
- ❌ `GET /api/users/{id}` — פרופיל ציבורי (נדרש ל-`profile/[id]`)
- ❌ `PUT /api/users/me` — עדכון פרופיל (bio, שם, קישורים, כישורים)
- ❌ `POST /api/users/me/avatar` — העלאת תמונת פרופיל
- ❌ `GET /api/users/search?q=` — חיפוש משתמשים
- ❌ `POST /api/users/me/onboarding` — השלמת Onboarding

### מעקב (Follow) — קיים friendships, לא קיים follow
- ❌ `POST /api/users/{id}/follow` · `DELETE /api/users/{id}/follow`
- ❌ `GET /api/users/me/followers` · `GET /api/users/me/following`

---

## 3️⃣ אימות — פיצ'רים חסרים
- ❌ OAuth: `/api/auth/oauth/{provider}` (google / github / linkedin)
- ❌ `POST /api/auth/forgot-password` · `POST /api/auth/reset-password`
- ❌ `POST /api/auth/verify-email` · `POST /api/auth/resend-verification`

---

## 4️⃣ באגים בבקאנד — 🐛 (התגלו ב-E2E; תוקנו בעותק המקומי, יש להחיל בריפו הרשמי)

1. **`POST /api/posts` → 400** (`NullReferenceException`). הפוסט נשמר אך המיפוי
   ל-DTO ניגש ל-`post.Author` שלא נטען.
   *תיקון:* אחרי `SaveChangesAsync` — `await _context.Entry(post).Reference(p => p.Author).LoadAsync();`
   `await _context.Entry(post).Collection(p => p.Tags).LoadAsync();`

2. **`POST /api/portfolios` → 400** — אותו שורש (`portfolio.Owner` null).
   *תיקון:* טעינת `Owner` + `Tags` לפני המיפוי.

3. **`GET /api/messages/conversations` → 400** — `"SQL APPLY not supported on SQLite"`.
   נובע מ-`.ThenInclude(c => c.Messages.OrderByDescending(...).Take(1))`.
   *תיקון:* include רגיל של `Messages` + בחירת ההודעה האחרונה בזיכרון
   (`Messages.OrderByDescending(m => m.SentAt).FirstOrDefault()`).

4. **`POST /api/friendships/requests`** — מחזיר `200` עם `data: null` (בניגוד לשאר
   ה-create endpoints). *תיקון:* להחזיר `Data = <FriendshipDto>`.

---

## 5️⃣ תשתית ואיכות
1. **CORS** — כרגע מתיר רק `localhost:3000/3001` (`appsettings.json`). להוסיף את
   כתובת הפרונט בפועל (dev + production).
2. **`GET /api/auth/me`** — מחזיר את ישות `User` הגולמית כולל `passwordHash`
   (חשיפת מידע רגיש!). מומלץ להחזיר `UserProfileDto`.
3. **`GET /api/posts/feed`** — מסומן `[AllowAnonymous]` אך קורא ל-`GetCurrentUserId()`
   ללא בדיקה → קורס למשתמש לא מחובר.
4. **Enums כמספרים** — הבקאנד לא רשם `JsonStringEnumConverter`, לכן כל ה-enums
   עוברים כמספרים. הפרונט מסתמך על זה — אם משנים ל-strings, לעדכן את הפרונט.

---

## קונבנציות ל-endpoints חדשים (כדי שיתאימו למה שהפרונט כבר מצפה לו)
- **מעטפת:** `ApiResponse<T> { success, message?, data?, errors?, timestamp }`.
- **עימוד:** `PaginatedResponse<T> { items, totalCount, pageNumber, pageSize, ... }`,
  פרמטרים `?pageNumber=&pageSize=`.
- **אימות:** JWT Bearer (`Authorization: Bearer <token>`).
- **JSON ב-camelCase; enums כמספרים.**
- הרפרנס המלא של החוזה הקיים: `../docs/API_CONTRACT.md`.

---

## תעדוף מוצע
| עדיפות | מה | למה |
|---|---|---|
| **P0** | 4 הבאגים + `me` שמחזיר passwordHash + CORS | שוברים/סיכון אבטחה; מהיר לתקן |
| **P1** | משתמשים/פרופיל (`GET /users/{id}`, `PUT /users/me`, avatar, search) | נדרש להמון דפים (פרופיל, הודעות, חיפוש) |
| **P2** | דומיין הפרויקטים (projects + applications + matching + teams) | הליבה היתומה הגדולה ביותר |
| **P3** | NDA, invites, reports, badges, OAuth, שחזור/אימות אימייל | פיצ'רים משניים |

**סה"כ:** ~44 endpoints חסרים · 4 באגים · 4 נושאי תשתית.
