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

The `PUT /api/users/me` payload must also carry the fields the profile page now
edits but the backend has no columns for:

❌ `ProfileLinks` — a list of personal sites / public profiles, each `{ url,
   label? }` (the User entity has no links at all)
❌ `PreferredPayment` — a label-only enum (`bit | paypal | card | ""`) for the
   upcoming paid-NDA flow. **Never a card/account number** — actual charging
   goes through the payment provider, not this field.

**Frontend status:** both are edited on `/profile` and kept in the persisted
store only. `fetchCurrentUser()` merges the `/me` response over locally-edited
pending fields so a reload does not wipe them
(`keepLocalEdits` in `src/services/user.service.ts`); once `PUT /api/users/me`
returns these fields, that merge can be dropped.

### Follow — Friendships Exists, Follow Does Not

❌ `POST /api/users/{id}/follow`
❌ `DELETE /api/users/{id}/follow`
❌ `GET /api/users/me/followers`
❌ `GET /api/users/me/following`

### Portfolios — Browsing Works, "Mine" Does Not

`GET /api/portfolios` (browse) and `POST /api/portfolios` (create) both work.
What is missing is a way to ask for **the current user's own** portfolio items.

❌ `GET /api/portfolios/me` — the signed-in user's portfolio items
❌ `GET /api/users/{id}/portfolios` — a given user's items (for `profile/[id]`)

**Current frontend workaround:** `/my-portfolio` fetches the first 50 of the
public list and filters client-side by `owner.userId`
(`src/components/views/MyPortfolioView.tsx`). This is wrong past the first
page — once a user's items fall outside those 50, their own portfolio silently
looks empty. Please add `GET /api/portfolios/me` (paginated, same
`PaginatedResponse<PortfolioDto>` envelope as the browse endpoint) and the
workaround gets deleted.

### Portfolios — No Links Field

A portfolio item is somebody's work, so it needs to point at that work: a live
site, a repo, a Behance/Figma page, an article. There is nowhere to put any of
them today, and it should hold **several** links, not one.

Checked against `Models/Entities.cs` and `Models/DTOs.cs` — the `Portfolio`
entity has `Title`, `Description`, `Category`, `ImageUrl`, `ThumbnailUrl`,
`CreatedAt`, `UpdatedAt`, and tags via the separate `PortfolioTag` table. There
is no links column, and `CreatePortfolioDto` has no links field either.

❌ `Links` on the portfolio — a list, each with a URL and an optional label

Suggested shape, matching how `Tags` is already handled (own table, returned
inline on `PortfolioDto`):

```csharp
public class PortfolioLink {
    [Key] public Guid LinkId { get; set; }
    public Guid PortfolioId { get; set; }
    [Required] public string Url { get; set; } = string.Empty;
    [StringLength(80)] public string? Label { get; set; }   // "אתר חי", "GitHub"
    public int SortOrder { get; set; }
}
```
and on both `CreatePortfolioDto` and `PortfolioDto`:
```csharp
public List<PortfolioLinkDto>? Links { get; set; }
```

**Frontend status:** not built. `/portfolios/create` deliberately does not offer
a links field, because anything typed into it would be dropped on save. The form
gets the field the same day the DTO does.

**Related:** `ImageUrl` is single-valued too, so a portfolio cannot show a
gallery. Not requested yet — noting it so both can be added in one pass if you
touch this entity.

## 3️⃣ Authentication — Missing Features

❌ OAuth: `/api/auth/oauth/{provider}` (Google / GitHub / LinkedIn)
❌ `POST /api/auth/forgot-password`
❌ `POST /api/auth/reset-password`
❌ `POST /api/auth/verify-email`
❌ `POST /api/auth/resend-verification`
