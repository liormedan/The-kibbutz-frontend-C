# דוח כיסוי API — כל ה-endpoints של הבקאנד

API: http://localhost:19653

**כיסוי: 40/40 עברו** · 0 נכשלו · 0 דולגו (אין נתונים).

## Auth

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `POST` | `/api/auth/register` | 200 | ✅ |
| `POST` | `/api/auth/login` | 200 | ✅ |
| `GET` | `/api/auth/me` | 200 | ✅ |
| `POST` | `/api/auth/refresh-token` | 200 | ✅ |
| `POST` | `/api/auth/logout` | 200 | ✅ |

## Posts

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `POST` | `/api/posts` | 200 | ✅ |
| `POST` | `/api/posts (2nd, to delete)` | 200 | ✅ |
| `GET` | `/api/posts/feed` | 200 | ✅ |
| `GET` | `/api/posts/{id}` | 200 | ✅ |
| `POST` | `/api/posts/{id}/like` | 200 | ✅ |
| `DELETE` | `/api/posts/{id}/like` | 200 | ✅ |
| `DELETE` | `/api/posts/{id}` | 200 | ✅ |

## Comments

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `POST` | `/api/comments/posts/{postId}` | 200 | ✅ |
| `POST` | `/api/comments/posts/{postId} (2nd)` | 200 | ✅ |
| `GET` | `/api/comments/posts/{postId}` | 200 | ✅ |
| `POST` | `/api/comments/{id}/like` | 200 | ✅ |
| `DELETE` | `/api/comments/{id}/like` | 200 | ✅ |
| `DELETE` | `/api/comments/{id}` | 200 | ✅ |

## Notifications

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `GET` | `/api/notifications` | 200 | ✅ |
| `GET` | `/api/notifications/unread-count` | 200 | ✅ |
| `PUT` | `/api/notifications/{id}/read` | 200 | ✅ |
| `PUT` | `/api/notifications/mark-all-read` | 200 | ✅ |

## Messages

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `POST` | `/api/messages/conversations` | 200 | ✅ |
| `POST` | `/api/messages` | 200 | ✅ |
| `GET` | `/api/messages/conversations` | 200 | ✅ |
| `GET` | `/api/messages/conversations/{id}` | 200 | ✅ |
| `PUT` | `/api/messages/conversations/{id}/read` | 200 | ✅ |

## Portfolios

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `POST` | `/api/portfolios` | 200 | ✅ |
| `POST` | `/api/portfolios (2nd, to delete)` | 200 | ✅ |
| `GET` | `/api/portfolios` | 200 | ✅ |
| `GET` | `/api/portfolios/{id}` | 200 | ✅ |
| `POST` | `/api/portfolios/{id}/like` | 200 | ✅ |
| `DELETE` | `/api/portfolios/{id}/like` | 200 | ✅ |
| `DELETE` | `/api/portfolios/{id}` | 200 | ✅ |

## Friendships

| Method | Endpoint | Status | תוצאה |
|---|---|---|---|
| `POST` | `/api/friendships/requests` | 200 | ✅ |
| `GET` | `/api/friendships/requests` | 200 | ✅ |
| `PUT` | `/api/friendships/requests/{id}/accept` | 200 | ✅ |
| `GET` | `/api/friendships` | 200 | ✅ |
| `POST` | `/api/friendships/requests (for reject)` | 200 | ✅ |
| `PUT` | `/api/friendships/requests/{id}/reject` | 200 | ✅ |

