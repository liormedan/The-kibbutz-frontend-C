# דוח E2E – מול בקאנד אמיתי

בסיס: http://localhost:3000 · API: http://localhost:19653
בקאנד פעיל: כן ✅

## שלב 1 – API / זרימות

| בדיקה | תוצאה | פרטים |
|---|---|---|
| POST /api/auth/register | ✅ | user qa_510786200 |
| POST /api/auth/login | ✅ | status 200 |
| GET /api/auth/me | ✅ | status 200 |
| POST /api/posts | ✅ | status 200 |
| POST /api/posts/{id}/like | ✅ | status 200 |
| POST /api/comments/posts/{id} | ✅ | status 200 |
| GET /api/posts/feed | ✅ | items 5 |
| POST /api/portfolios | ✅ | status 200 |
| GET /api/portfolios | ✅ | items 4 |
| GET /api/notifications | ✅ | status 200 |
| register peer user | ✅ |  |
| POST /api/messages/conversations | ✅ | status 200 |
| POST /api/messages | ✅ | status 200 |
| GET /api/messages/conversations | ✅ | items 1 |
| GET /api/messages/conversations/{id} | ✅ | items 1 |

## שלב 2 – ניווט עם session אמיתי

| נתיב | סטטוס | תוצאה | תוכן |
|---|---|---|---|
| `/` | 200 | OK |  |
| `/login` | 200 | OK | הקיבוץ הקיבוץ פלטפורמת שיתוף פעולה קהילתית הצטרפו לחממת היוז |
| `/dashboard` | 200 | OK |  |
| `/profile` | 200 | OK |  |
| `/matches` | 200 | OK | התאמות — הפיצ'ר הזה עדיין לא מחובר לשרת. התצוגה להמחשה בלבד. |
| `/messages` | 200 | OK | שיחות Q QA Peer שלום E2E אין שיחה פתוחה בחרו שיחה מהרשימה, א |
| `/feed` | 200 | OK | לוח בקרה פיד תיקי עבודות 0/5000 פרסום QT QA Tester לפני 3 שע |
| `/portfolios` | 200 | OK | לוח בקרה פיד תיקי עבודות תיקי עבודות צור תיק עבודות ת תיק 51 |
| `/portfolios/create` | 200 | OK | לוח בקרה פיד תיקי עבודות חזרה לתיקי העבודות צור תיק עבודות כ |
| `/nda` | 200 | OK |  |
| `/projects` | 200 | OK | הקיבוץ כניסה / הרשמה פרויקטים — הפיצ'ר הזה עדיין לא מחובר לש |
