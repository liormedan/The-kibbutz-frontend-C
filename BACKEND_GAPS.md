# Backend Domain Gaps — The Kibbutz

## 1️⃣ Orphaned Domains — ❌ No Endpoint at All

### Projects — Discover Projects, My Projects, `projects/[id]`

`GET /api/projects` (list + filter/tag/search)
`GET /api/projects/{id}`
`POST /api/projects` · `PUT /api/projects/{id}` · `DELETE /api/projects/{id}`
`GET /api/projects/mine` · `GET /api/projects/joined` · `GET /api/projects/matching`
`POST /api/projects/{id}/media` · `DELETE /api/projects/{id}/media/{mediaId}`
`POST /api/projects/{id}/comments`
`POST /api/projects/{id}/leave` · `POST /api/projects/{id}/close`

### Applications — Applications, My Applications

`POST /api/projects/{id}/applications` (submission)
`GET /api/projects/{id}/applications` (list for the project owner)
`PUT /api/applications/{id}` (accept/reject)
`GET /api/applications/mine`

### Matching — `matches`

`GET /api/matching/projects`
`GET /api/matching/users?projectId=`

### Teams — `projects/[id]/team`

`GET /api/projects/{id}/team`
`PUT /api/teams/{id}/status`

### Invites

`POST /api/invites`
`PUT /api/invites/{id}/accept`
`PUT /api/invites/{id}/reject`

### NDA — `nda`, `nda/inbox`

`GET /api/ndas`
`GET /api/ndas/{id}`
`POST /api/ndas`
`PUT /api/ndas/{id}/sign`
`PUT /api/ndas/{id}/reject`

### Reports and Success Badges

`POST /api/reports`
`GET /api/users/me/badges`
`POST /api/projects/{id}/success`

## 2️⃣ Partial Domains — 🟡 Some Functionality Exists, Some Is Missing

### Users / Profile — Only `GET /api/auth/me` Exists

❌ `GET /api/users/{id}` — public profile (required for `profile/[id]`)
❌ `PUT /api/users/me` — profile update (bio, name, links, skills)
❌ `POST /api/users/me/avatar` — profile picture upload
❌ `GET /api/users/search?q=` — user search
❌ `POST /api/users/me/onboarding` — onboarding completion

### Follow — Friendships Exists, Follow Does Not

❌ `POST /api/users/{id}/follow`
❌ `DELETE /api/users/{id}/follow`
❌ `GET /api/users/me/followers`
❌ `GET /api/users/me/following`

## 3️⃣ Authentication — Missing Features

❌ OAuth: `/api/auth/oauth/{provider}` (Google / GitHub / LinkedIn)
❌ `POST /api/auth/forgot-password`
❌ `POST /api/auth/reset-password`
❌ `POST /api/auth/verify-email`
❌ `POST /api/auth/resend-verification`
