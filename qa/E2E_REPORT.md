# דוח E2E – מול בקאנד אמיתי

בסיס: http://localhost:3000 · API: http://localhost:19653
בקאנד פעיל: כן ✅

## שלב 1 – API / זרימות

| בדיקה | תוצאה | פרטים |
|---|---|---|
| POST /api/auth/register | ✅ | user qa_641785300 |
| POST /api/auth/login | ✅ | status 200 |
| GET /api/auth/me | ✅ | status 200 |
| POST /api/posts | ✅ | status 200 |
| POST /api/posts/{id}/like | ✅ | status 200 |
| POST /api/comments/posts/{id} | ✅ | status 200 |
| GET /api/posts/feed | ✅ | items 10 |
| POST /api/portfolios | ✅ | status 200 |
| GET /api/portfolios | ✅ | items 7 |
| GET /api/notifications | ✅ | status 200 |
| register peer user | ✅ |  |
| POST /api/messages/conversations | ✅ | status 200 |
| POST /api/messages | ✅ | status 200 |
| GET /api/messages/conversations | ✅ | items 1 |
| GET /api/messages/conversations/{id} | ✅ | items 1 |

## שלב 2 – ניווט עם session אמיתי

| נתיב | סטטוס | תוצאה | תוכן |
|---|---|---|---|
| `/` | 200 | OK | גלה פרויקטים פיד תיקי עבודות הפרויקטים שלי המועמדויות שלי צו |
| `/login` | 200 | OK | הקיבוץ הקיבוץ פלטפורמת שיתוף פעולה קהילתית הצטרפו לחממת היוז |
| `/dashboard` | 200 | OK | גלה פרויקטים פיד תיקי עבודות הפרויקטים שלי המועמדויות שלי צו |
| `/profile` | 200 | OK | חזרה Q QA Tester עריכה 0 פרויקטים שיצרתי 0 הצטרפתי אל 0 Succ |
| `/matches` | 200 | OK | התאמות — הפיצ'ר הזה עדיין לא מחובר לשרת. התצוגה להמחשה בלבד. |
| `/messages` | 200 | OK | שיחות Q QA Peer שלום E2E אין שיחה פתוחה בחרו שיחה מהרשימה, א |
| `/feed` | 200 | OK | גלה פרויקטים פיד תיקי עבודות הפרויקטים שלי המועמדויות שלי צו |
| `/portfolios` | 200 | OK | גלה פרויקטים פיד תיקי עבודות הפרויקטים שלי המועמדויות שלי צו |
| `/portfolios/create` | 200 | OK | לוח בקרה פיד תיקי עבודות חזרה לתיקי העבודות צור תיק עבודות כ |
| `/nda` | 200 | OK | חוזי סודיות (NDA) — הפיצ'ר הזה עדיין לא מחובר לשרת. התצוגה ל |
| `/projects` | 200 | OK | הקיבוץ כניסה / הרשמה פרויקטים — הפיצ'ר הזה עדיין לא מחובר לש |
