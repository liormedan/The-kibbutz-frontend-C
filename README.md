# The Kibbutz Frontend

This is the web client for The Kibbutz - the community network where people connect, share their work, and collaborate. Built with Next.js and React, it talks to the ASP.NET backend over plain REST (no GraphQL, no SDK - just `fetch`).

## What's in here?

**Auth & Session**
- Register / login against the backend, JWT with automatic refresh
- Session kept in a Zustand store (access + refresh token + user)
- On a 401 it refreshes once and retries, and logs out cleanly if that fails

**Social Stuff**
- Feed - posts, comments, likes (the backend's real core)
- Portfolios - showcase work, browse, like
- Direct messages - conversation-based chat with a live participant list
- Notifications - a bell that reads the real notification feed
- Friends / connections - friend requests, accept, reject

**"Coming soon" pages**
- Projects, matching, applications, NDA, teams - the UI is all there, but the
  backend has no endpoints for them yet, so they render behind a "coming soon"
  banner and never pretend to work. Full list in [`BACKEND_GAPS.md`](./BACKEND_GAPS.md).

## Stack

- **Next.js 16** (App Router) - the framework
- **React 19** - UI
- **TypeScript** - everything is typed, including the backend contract
- **Tailwind CSS v4** - styling, brand tokens in `globals.css`
- **Zustand** - client state (auth, conversations, notifications, ...)
- **fetch** - a small typed REST client, no data-fetching library

## Project Structure

```
src/
├── app/                # App Router. Every authenticated segment has a tiny
│   │                   #   layout.tsx that wraps its pages in <AppShell>.
│   ├── projects/       #   the home: "discover projects" (explore) + [id]/create
│   ├── feed/ portfolios/ messages/ profile/ my-projects/
│   ├── teams/ friends/ settings/ my-applications/ applications/ matches/ nda/
│   └── login/ register/ ...   # public / auth flows — NO shell (standalone)
├── components/
│   ├── AppShell.tsx    # THE template — fixed sidebar + content, hosts every page
│   ├── DashboardSidebar.tsx  # the sidebar itself (route-driven)
│   └── views/          # page bodies rendered inside the shell
│       │               #   (ExploreView, MyProjectsView, TeamsView, ...)
├── services/           # One module per domain - the only place that calls the API
├── lib/api/            # The backend contract lives here:
│   ├── types.ts        #   DTOs + enums, 1:1 with the backend
│   ├── client.ts       #   fetch wrapper: JWT, refresh, ApiResponse unwrap
│   ├── mappers.ts      #   backend DTO → the UI's view types
│   └── pending.ts      #   helpers for features the backend doesn't have yet
├── store/              # Zustand stores
└── types/              # UI-facing view types
```

## App Shell & Navigation

The whole app lives inside **one template**: [`AppShell`](./src/components/AppShell.tsx).
It draws the fixed sidebar (right in RTL / left in LTR) and hosts whatever page
you give it. No page ever draws its own sidebar or stands alone.

- **Every route is its own URL.** Each sidebar item navigates to a real page —
  `/projects` (explore/home), `/feed`, `/portfolios`, `/my-projects`,
  `/my-applications`, `/teams`, `/messages`, `/friends`, `/profile`, `/settings`.
  There's no in-page tab state anywhere.
- **How a page gets the shell:** its segment has a one-line `layout.tsx` that
  returns `<AppShell>{children}</AppShell>`. The page file only renders its body.
- **The active item** is derived from the current route (`activeFromPath` in
  `AppShell.tsx`), so highlighting is automatic.
- **Public / auth pages** (`/`, `/login`, `/register`, `/verify-email`,
  `/reset-password`, `/oauth/callback`, `/onboarding`, `/admin`) are intentionally
  **not** wrapped — they have no sidebar.

Adding a new in-app page: create the route, drop in a `layout.tsx` that wraps
`AppShell`, and (if it's a sidebar destination) add it to the `tabs` list in
`DashboardSidebar.tsx` and to `TAB_ROUTES` / `activeFromPath` in `AppShell.tsx`.

### Routes

There is **no `/dashboard`** — the home is `/projects` ("discover projects").

The sidebar is grouped: **קהילה** (public / social) and **איזור ניהול** (the
user's own things), with profile + settings pinned at the bottom so they stay
reachable on short windows.

| Route | Shows | Sidebar item | Group |
|---|---|---|---|
| `/projects` | **Discover projects (home)** | גלה פרויקטים | קהילה |
| `/feed` | Feed | פיד | קהילה |
| `/messages` | Direct messages | הודעות | קהילה |
| `/friends` | Friends / connections | חברים | קהילה |
| `/portfolios` | Browse everyone's portfolios | תיקי עבודות | קהילה |
| `/my-projects` | My projects (owned + joined) | הפרויקטים שלי | ניהול |
| `/applications` | Join requests for my projects | בקשות לפרויקטים שלי | ניהול |
| `/my-applications` | Applications I sent | המועמדויות שלי | ניהול |
| `/my-portfolio` | My own portfolio items | תיק העבודות שלי | ניהול |
| `/teams` | Teams *(coming soon)* | צוותים | ניהול |
| `/profile` | My profile | פרופיל אישי | pinned |
| `/settings` | Settings (theme + language) | הגדרות | pinned |
| `/matches` | Matching *(coming soon)* | — | — |
| `/nda`, `/nda/inbox` | NDA *(coming soon)* | — | — |

> `/messages` shows a demo conversation + thread while the user has no real
> conversations, so the layout is visible during development. It is inert and
> clearly labelled; real conversations replace it automatically.

**Dynamic pages** (also inside the shell): `/projects/[id]`, `/projects/[id]/manage`,
`/projects/[id]/team`, `/projects/create`, `/feed/[id]`, `/portfolios/[id]`,
`/portfolios/create`, `/profile/[id]`.

**Standalone** (no shell — public / auth flows): `/`, `/login`, `/register`,
`/verify-email`, `/reset-password`, `/oauth/callback`, `/onboarding`, `/admin`.

## Getting Started

### Need
- Node.js 20+ and npm
- The backend running (see its README) - defaults to `http://localhost:19653`

### Setup

**1. Install dependencies**
```bash
npm install
```

**2. Set up your environment**
```bash
cp .env.example .env.development.local
```
The defaults already point at the local backend - just edit if yours differs.

**3. Start the dev server**
```bash
npm run dev
```

The app runs on `http://localhost:3000`. Make sure that origin is listed in the
backend's `Cors:AllowedOrigins`, or the browser will block the calls.

> Tip: run the backend **http-only** (`--urls http://localhost:19653`) so its
> HTTPS redirect doesn't bounce your `fetch` calls to a self-signed cert.

## Talking to the Backend

Everything goes through `src/lib/api/client.ts`, which attaches the `Bearer`
token, unwraps the backend's `ApiResponse<T>` envelope, and refreshes on 401.
Each domain has a service that maps DTOs to the UI. The client calls:

### Auth
- `POST /api/auth/register` - sign up (the form's single name is split into first/last + a username is derived)
- `POST /api/auth/login` - sign in
- `POST /api/auth/refresh-token` - rotate tokens
- `GET /api/auth/me` - who am I?

### Feed & Portfolios
- `GET /api/posts/feed` - the feed
- `POST /api/posts` - create a post, `.../like` to like
- `GET /api/comments/posts/{id}` / `POST` - comments
- `GET /api/portfolios` / `POST` - browse and create portfolios

### Messages & Notifications
- `GET /api/messages/conversations` - your chats
- `POST /api/messages/conversations` - start one, `POST /api/messages` - send
- `GET /api/notifications` - the bell (polls; there's no realtime hub)

### Friends
- `GET /api/friendships` + `/requests` - friends and pending requests

> Heads up: the backend serializes enums as **integers** (no string converter),
> and the client relies on that. If the backend ever switches to string enums,
> update `src/lib/api/types.ts`.

## Environment

| Variable | What it does | Default |
|---|---|---|
| `NEXT_PUBLIC_API_URL` | Backend REST base URL | `http://localhost:19653` |
| `NEXT_PUBLIC_ADMIN_URL` | External admin app | `http://localhost:3001` |
| `NEXT_PUBLIC_DEV_BYPASS` | Fake dev login button (leave `false` when a real backend is up) | `false` |

## מצב פיתוח (demo data)

Several domains have no backend endpoints yet, so their pages render an empty
state and the design can't be judged. Those pages carry a **מצב פיתוח** button
that swaps in sample data:

`/feed` · `/friends` · `/my-projects` · `/my-projects/teams` · `/my-portfolio`
· `/portfolios` · `/profile` · `/matches`

- The button appears **only when the page has nothing real to show**, and only
  in development builds (`NODE_ENV=development` or `NEXT_PUBLIC_DEV_BYPASS=true`).
  A production build ships neither the button nor the sample data on screen.
- Real data always wins — demo data stands in only while the API returns empty.
- The choice is per page and persisted (`kibbutz-demo:<page>` in localStorage),
  so a reload keeps whatever you were looking at.

Fixtures live in `src/lib/dev/fixtures.ts`, typed against the real DTOs so they
break the build if a shape changes. The toggle itself is
`src/components/DevDataToggle.tsx` + `src/lib/dev/demoMode.ts`.

## Testing & QA

There's no Swagger here (that's the backend) - the "interface" is the running
app in your browser. For automated checks there are Playwright sweeps:

```bash
npm run qa      # visits every route, catches render/console errors (backend optional)
node qa/qa-e2e.mjs   # real end-to-end: registers a user, posts, likes, chats (needs the backend up)
```
Reports land in `qa/QA_REPORT.md` and `qa/E2E_REPORT.md`.

UI sweeps (run against `next start` on :3001 unless noted):

```bash
node qa/deep-check.mjs      # clicks the nav and top bar, English/LTR, mobile, collapsed rail
node qa/ui-walkthrough.mjs  # every route in light + dark: console, overflow, i18n, theme mixing
node qa/viewport-fit.mjs    # no route scrolls with nothing to scroll to
node qa/topbar.mjs          # the top-bar cluster is present and sticky everywhere
node qa/sidebar-fit.mjs     # the rail fits without scrolling down to 560px tall
```

`qa/demo-mode.mjs` and `qa/card-menu.mjs` need the **dev** server — the first
because the toggle is development-only, the second because it drives the feed
with demo data:

```bash
npx next dev -p 3002
QA_BASE=http://localhost:3002 node qa/demo-mode.mjs
QA_BASE=http://localhost:3002 node qa/card-menu.mjs
```

## Common Issues

**Everything says "failed to load"**
- The backend probably isn't running, or it's on a different port than `NEXT_PUBLIC_API_URL`.

**Calls are blocked in the browser (CORS)**
- Add `http://localhost:3000` to `Cors:AllowedOrigins` in the backend's `appsettings.json`.

**Logged out immediately / 401 loops**
- You're using `NEXT_PUBLIC_DEV_BYPASS=true` against a real backend - the fake
  token gets rejected. Set it to `false` and log in for real.

**`fetch` fails with a cert error**
- The backend redirected http→https. Run the backend http-only (see the tip above).

## Contributing

Keep the pattern: pages and components never call the API directly - they go
through a service, and all DTO→UI translation lives in `src/lib/api/mappers.ts`.
Never invent a backend endpoint that doesn't exist - if it's missing, wire it as
"pending" and add it to `BACKEND_GAPS.md`.

## Questions?

- [`BACKEND_GAPS.md`](./BACKEND_GAPS.md) - every endpoint the frontend needs that
  the backend doesn't have yet, plus infra notes (CORS, ports, enums).
