# חוזה הבקאנד — מה שהפרונט מסתמך עליו

מקור: **github.com/the-kibbutz/KibbutzBackend** @ `832540b`
(`[FIX] ensure database is created on first startup, fix friendship DTO not being populated`).

הבקאנד הוא **ASP.NET Core** ולא חלק מהריפו הזה. המסמך הזה הוא התמצית שהפרונט
מקודד מולה. אם הבקאנד משתנה — עדכן כאן קודם, ואז את `src/lib/api/types.ts`.

לבדיקה אוטומטית שהפרונט לא קורא ל-endpoint שלא קיים:
```bash
node qa/endpoint-audit.mjs
```

---

## 1. מבנה הבקאנד

```
KibbutzBackend/
  Controllers/Controllers.cs   ← כל שבעת הקונטרולרים בקובץ אחד
  Models/DTOs.cs               ← כל ה-DTOs + ApiResponse/PaginatedResponse
  Models/Entities.cs           ← ישויות EF + כל ה-enums
  Services/                    ← AuthService, PostService, MessageService,
                                 NotificationService, AdditionalServices
  Security/                    ← RateLimiting, InputValidator, SecurityMiddleware
  Data/KibbutzDbContext.cs
  Program.cs
```

**מסד נתונים:** SQLite, `Data Source=kibbutz.db`, נוצר ב-`EnsureCreated()` בעליית
השרת. אין מיגרציות — שינוי סכימה מחייב מחיקת הקובץ.

**פורטים:** `https://localhost:19652` · `http://localhost:19653`
הפרונט מוגדר ל-**http://localhost:19653**. אם רצים ב-https תתקבל שגיאת תעודה.

**CORS מותר:** `http://localhost:3000`, `http://localhost:3001`,
`https://localhost:3000`. כלומר `npm run dev` (3000) ושרת ה-QA (3001) מותרים
כברירת מחדל. כל פורט אחר — הוסף ל-`Cors:AllowedOrigins` ב-`appsettings.json`.

---

## 2. מעטפות התגובה

כל תגובה עטופה ב-`ApiResponse<T>`:

```csharp
{ Success: bool, Message: string?, Data: T?, Errors: List<string>?, Timestamp: DateTime }
```

רשימות מחזירות `ApiResponse<PaginatedResponse<T>>`:

```csharp
{ Items: List<T>, TotalCount, PageNumber, PageSize, TotalPages, HasNextPage, HasPreviousPage }
```

`src/lib/api/client.ts` פותח את המעטפת ובודק **`json.success`** — לא `!json.data`.
זה חשוב: endpoint שמחזיר `Data: false` לגיטימית (למשל ביטול לייק) לא נחשב כשלון.

**פרמטרי עמוד:** `pageNumber` / `pageSize` ב-query string.

---

## 3. אימות

- **JWT Bearer.** `Authorization: Bearer <token>`.
- **תוקף טוקן: 60 דקות.** Refresh token: 7 ימים.
- `Issuer: TheKibbutzAPI` · `Audience: TheKibbutzClient`.
- `[Authorize]` על רוב ה-endpoints; `register` / `login` / `refresh-token` פתוחים.
- הפרונט מנסה refresh **פעם אחת** על 401 ואז מסיים את הסשן ומפנה ל-`/`.

⚠️ **`JwtSettings:SecretKey` מופיע בטקסט גלוי ב-`appsettings.json` בריפו הציבורי.**
זה מפתח החתימה — מי שיש לו אותו יכול לזייף טוקן לכל משתמש. זו בעיה בצד
הבקאנד ולא בפרונט, אבל שווה להעביר לסוכן שאחראי עליו: להעביר ל-User Secrets
או למשתנה סביבה, ולהחליף את המפתח הקיים.

---

## 4. Rate limiting

מידלוור משלהם, sliding window לפי כתובת IP:

| מגבלה | ערך |
|---|---|
| בקשות לדקה | 100 |
| בקשות לשעה | 5000 |
| ניסיונות התחברות לדקה | 5 |
| חסימה אחרי 3 חריגות | 15 דקות |

**רלוונטי לבדיקות:** חליפת QA שמריצה עשרות ניווטים בדקה עלולה להיחסם מול
בקאנד אמיתי. הבדיקות הנוכחיות מריצות stub ולא נוגעות בשרת, אז אין בעיה — אבל
בדיקה חיה עם לולאות צריכה להיזהר, ובמיוחד לא לנסות התחברות יותר מ-5 פעמים
בדקה.

---

## 5. Enums — **מספרים, לא מחרוזות**

`Program.cs` קורא ל-`AddControllers()` בלי `JsonStringEnumConverter`, ולכן כל
enum עובר כמספר. `src/lib/api/types.ts` חייב לשקף בדיוק את הסדר.

| Enum | ערכים |
|---|---|
| `UserRole` | 0 Guest · 1 Member · 2 Resident · 3 KibbutzMember · 4 Volunteer · 5 Administrator |
| `PostType` | 0 Text · 1 Image · 2 Video · 3 Link · 4 Poll |
| `ReactionType` | 0 Like · 1 Love · 2 Support · 3 Celebrate |
| `MessageType` | 0 Text · 1 Image · 2 Video · 3 Audio · 4 File · 5 Emoji |
| `ConversationType` | 0 Direct · 1 Group |
| `PrivacyLevel` | 0 Public · 1 FriendsOnly · 2 Private |
| `ThemeMode` | 0 Light · 1 Dark · 2 Auto |
| `NotificationType` | 0 PostLike · 1 PostComment · 2 CommentReply · 3 FriendRequest · 4 FriendRequestAccepted · 5 NewFollower · 6 PortfolioLike · 7 NewMessage · 8 Mention · 9 SystemAnnouncement · 10 EventReminder |

**`UserRole` הוא לא אותו דבר כמו התפקיד בפרונט.** לבקאנד אין "יזם"/"משתתף" —
יש לו תפקידי קהילה. `mapRole()` ב-`src/lib/api/mappers.ts` ממפה
`Administrator → "admin"` והשאר ל-`"participant"`. המיפוי מאבד מידע בכוונה.

---

## 6. כל ה-endpoints (36)

שבעה קונטרולרים. **אין `UsersController`.**

### `api/auth` (5)
`POST register` · `POST login` · `POST refresh-token` · `POST logout` 🔒 · `GET me` 🔒

### `api/posts` (6)
`POST /` · `GET feed` · `GET {postId}` · `POST {postId}/like` · `DELETE {postId}/like` · `DELETE {postId}`

### `api/comments` (5)
`POST posts/{postId}` · `GET posts/{postId}` · `POST {commentId}/like` · `DELETE {commentId}/like` · `DELETE {commentId}`

### `api/notifications` (4)
`GET /` · `GET unread-count` · `PUT {notificationId}/read` · `PUT mark-all-read`

### `api/messages` (5)
`GET conversations` · `POST conversations` · `GET conversations/{conversationId}` · `POST /` · `PUT conversations/{conversationId}/read`

### `api/portfolios` (6)
`POST /` · `GET /` · `GET {portfolioId}` · `POST {portfolioId}/like` · `DELETE {portfolioId}/like` · `DELETE {portfolioId}`

### `api/friendships` (5)
`POST requests` · `PUT requests/{friendshipId}/accept` · `PUT requests/{friendshipId}/reject` · `GET requests` · `GET /`

---

## 7. שדות DTO שכדאי להכיר

**`UserProfileDto`** — `userId`, `firstName`, `lastName`, `fullName` (מחושב
`"{First} {Last}"`), `username`, `email`, `profilePictureUrl?`, `coverImageUrl?`,
`bio?`, `role` (מספר), `followersCount`, `followingCount`, `friendsCount`, `createdAt`.

`author` ב-`PostDto` ו-`owner` ב-`PortfolioDto` הם **לא-אופציונליים** (`null!`).
`title` ב-`PortfolioDto` הוא `string` לא-null. הפרונט בכל זאת מגן על הגישה
אליהם — שדה חסר אחד לא אמור להפיל מסלול שלם.

**`MessageDto`** — שים לב: `senderName` שטוח (לא אובייקט משתמש), `isMine`
מחושב בשרת, `sentAt` (לא `createdAt`).

**`ConversationDto`** — `participants` הוא `List<UserProfileDto>?` (אופציונלי).

**`PostDto`** — יש `sharesCount` שהפרונט לא מציג, ו-`updatedAt?`.

---

## 8. מה שאין בבקאנד — והפרונט מחכה לו

הפרונט מסמן את אלה כ-`pending` ומחזיר נתונים מקומיים. הרשימה המלאה
ב-[`BACKEND_GAPS.md`](./BACKEND_GAPS.md).

**קיים DTO אבל אין endpoint:**
- `UpdateUserProfileDto` מוגדר ב-`Models/DTOs.cs` ו**אף קונטרולר לא משתמש בו**.
  זהו ה-DTO שנועד ל-`PUT /api/users/me`. כשה-endpoint ייבנה, שים לב ששדותיו
  הם `firstName`, `lastName`, `username`, `bio`, `profilePictureUrl`,
  `coverImageUrl` — **אין בו** `links`, `profileLinks`, `preferredPayment`
  או `skills` שהפרונט שומר.

**אין בכלל:**
- פרופיל משתמש אחר (`GET /api/users/{id}`) — `/profile/{id}` מציג placeholder
- חיפוש משתמשים — החיפוש ב-`FriendsTab` מחזיר ריק
- עוקבים / נעקבים
- תגי הצלחה, העלאת תמונת פרופיל, Onboarding
- פרויקטים, צוותים, הזמנות, התאמות, NDA, דיווחים — שירותים שלמים
- `Links` לתיק עבודות (מספר קישורים)

---

## 9. אין SignalR

`connectChatHub()` ב-`conversation.service.ts` **אינו** hub — הוא `setInterval`
על `fetchMessages`. אין hub בבקאנד. הודעה חדשה מופיעה בהשהיה של מחזור אחד.

---

## 10. סדר עבודה לסנכרון

1. `git -C <backend> pull` ואז השווה מול סעיף 6 כאן.
2. עדכן את `BACKEND_CONTRACT.md` (המסמך הזה) — הוא המקור.
3. עדכן את `VERIFIED` ב-`qa/endpoint-audit.mjs`.
4. עדכן טיפוסים ב-`src/lib/api/types.ts` ומיפויים ב-`src/lib/api/mappers.ts`.
5. `node qa/endpoint-audit.mjs` — חייב לצאת 0.
6. `npm run qa:gate -- --build`.

**כלל:** לעולם אל תוסיף ל-`VERIFIED` endpoint שלא ראית כ-`[Http*]` בקוד
הבקאנד. גרסה קודמת של הרשימה כללה ארבעה נתיבי `/api/users/*` שמעולם לא היו
קיימים, והבדיקה דיווחה עליהם כ"הבקאנד מגיש, הפרונט לא מחובר" — ההפך הגמור מהמצב.
