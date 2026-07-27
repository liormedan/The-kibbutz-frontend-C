# Mobile Spec — The Kibbutz frontend

Status: **draft v0.1** — first pass, grounded in an audit of the current build
at 390×844 (iPhone-class). Sections marked **[decision]** need Lior's sign-off
before implementation. Nothing here is built yet.

---

## 1. Scope & breakpoints

The app already uses Tailwind's `md` (768px) as the single divide: below it the
sidebar is hidden and a bottom nav appears; at/above it the sidebar shows and
the bottom nav hides. This spec keeps that one breakpoint.

- **Mobile**: `< 768px` — bottom nav, no sidebar. Target 360–430px wide.
- **Desktop**: `≥ 768px` — the current sidebar + top-bar layout, unchanged.

Tablets (768–1024) get the desktop layout for now; a dedicated tablet pass is
out of scope.

---

## 2. What the audit found (current state, to fix)

Measured across 10 routes at 390px:

1. ~~**7px horizontal overflow on every screen.**~~ **RETRACTED — this was a
   measurement error, not a defect.** `scrollWidth − clientWidth` read 7 on
   every route, and the first draft of this spec blamed the bottom-nav labels.
   Both parts were wrong. Under Chromium's mobile emulation `innerWidth` is 7px
   wider than `clientWidth` because a classic scrollbar is reserved; a
   full-bleed `fixed inset-x-0` bar correctly sizes to that initial containing
   block, so the 7px appears on a perfectly healthy page. Verified: a plain
   390px context reports `scrollWidth == clientWidth == 390`, and in **every**
   mode — plain, `isMobile`, iPhone 13 — the page **cannot be scrolled
   sideways** (`window.scrollX` will not move). Real phones use overlay
   scrollbars and never reserve the gutter.
   The lesson is baked into `qa/mobile.mjs`: it asserts the page cannot scroll
   horizontally and that no in-flow content exceeds the layout viewport, rather
   than trusting a raw `scrollWidth` delta.

2. **Bottom nav is on the old IA.** It still shows
   *גלה פרויקטים · הפרויקטים שלי · הודעות · צוותים · פרופיל אישי*, where
   "צוותים" routes to `/teams` — which now just redirects into the
   `/my-projects` hub. It predates the nav rework and needs re-picking.

3. **Top bar is desktop-sized.** The full "+ פרויקט חדש" gradient button eats
   most of the bar width on mobile, crowding the bell and avatar.

4. **Messages is a dead end on mobile.** It's a two-pane layout where the
   conversation list is `hidden md:block`. On a phone you land straight in a
   chat with no list and no way back to it.

5. **Dropdowns near the edge.** The account menu (`w-56`) and notifications
   panel (`w-80` = 320px) anchor to the inline edge; at 390px the 320px panel
   nearly spans the screen. Needs a max-width / inset check on small screens.

Good news from the audit: the sidebar is correctly hidden, the top bar is a
clean 64px, `dir=rtl` holds, and no console errors on any route.

---

## 3. App shell on mobile

### 3.1 Top bar (44–56px)
- Keep it sticky, keep logo + notifications bell + avatar (account menu).
- **[decision] "New project" on mobile** — options in §6.
- Bell and avatar stay as icon buttons (already fine).

### 3.2 Bottom nav (56px + safe-area)
- Fixed, `md:hidden`, one row, icon **above** a short label, active item marked
  with the top accent line (already designed this way).
- **Max 5 items.** Labels must be one short word each so nothing clips at 360px.
- **[decision] which items** — see §6. Working proposal:
  *גילוי · פיד · הודעות · הפרויקטים שלי · עוד*, where **עוד** opens a sheet with
  everything that doesn't fit (חברים, תיק העבודות, הגדרות, התנתקות).
- Short labels: "גלה פרויקטים" → **גילוי**, "הפרויקטים שלי" → **הפרויקטים**
  (or an icon-only bar — §6).

### 3.3 "More" sheet (if we adopt it)
A bottom sheet triggered by the עוד tab, listing the secondary destinations as
full-width rows. This is where חברים / תיק העבודות / הגדרות live so the bar
stays at 5.

---

## 4. Per-screen behaviour

| Screen | Mobile plan |
|---|---|
| **גילוי / פיד / חברים / תיקים** | Already single-column and fine — just fix the shell overflow. Filter chips wrap to 2 rows (acceptable). |
| **הפרויקטים שלי (hub)** | The 4-tab bar must become horizontally scrollable (`overflow-x-auto`) so tabs never wrap or clip. |
| **הודעות** | **Rework to list↔chat.** Default shows the conversation list full-width; tapping one slides to the chat with a back arrow in the chat header. No two-pane on mobile. |
| **פרופיל** | Single column already. Tab bar (כישורים/פרויקטים/תגים/תשלום) → horizontally scrollable. |
| **הגדרות** | Its own left-rail + content grid must stack to one column on mobile (nav becomes a top row or a select). |
| **יצירת פרויקט / תיק** | Forms are already single-column; verify inputs are ≥16px font so iOS doesn't zoom on focus. |

---

## 5. Cross-cutting rules

- **Zero horizontal overflow** at 360 / 390 / 430px on every route — this is the
  acceptance bar for the whole spec.
- **Tap targets ≥ 44×44px** (bottom-nav items, icon buttons, chips).
- **Bottom-nav clearance**: scrollable content keeps its `pb-20` so the last row
  isn't hidden behind the fixed nav (already present in AppShell).
- **Safe area**: honour `env(safe-area-inset-bottom)` (already on the nav).
- **Sticky elements**: top bar and bottom nav both fixed; page scrolls between.
- **Overlays** (account menu, notifications, "more" sheet, any modal) cap at
  `min(92vw, …)` so they never touch the screen edges.

---

## 6. Decisions

**[D1 — decided] Bottom-nav items:** **גילוי · פיד · הודעות · הפרויקטים · עוד.**
Four primary destinations plus **עוד**, which opens a bottom sheet with חברים /
תיק העבודות / הגדרות (+ logout). Profile is not in the bar — it's reached from
the avatar/account menu in the top bar.
- Routes: גילוי → `/projects`, פיד → `/feed`, הודעות → `/messages`,
  הפרויקטים → `/my-projects`, עוד → opens the sheet (no route).
- The old "צוותים → /teams" tab is removed (it only redirected into the hub).

**[D3 — decided] "New project" on mobile:** an **icon-only round `+` button** in
the top bar, replacing the full gradient button. Always visible, smallest change.

**[D2 — still open] Labels vs icon-only** in the bottom bar. Default to (a)
icon + short label unless you say otherwise. Short labels: גילוי · פיד ·
הודעות · הפרויקטים · עוד (all already short, so no clipping at 360px).

---

## 7. Sprints

Five sprints, weighted by actual volume of work. The weight column is each
sprint's share of "mobile is done" — they sum to 100%.

| # | Sprint | Weight | Tasks | Closes |
|---|---|---:|---|---|
| **S1** ✅ | **שלד המובייל** — the base; without it every screen inherits the bugs | 35% | ~~zero horizontal overflow~~ (finding 1 retracted — see §2) · new bottom nav (גילוי · פיד · הודעות · הפרויקטים · עוד) · the "עוד" sheet (friends / portfolio / settings / logout) · round `+` in the top bar | findings 2, 3 |
| **S2** ✅ | **הודעות — list ↔ chat** | 20% | conversation list full-width by default · tap through to chat with a back arrow · drop the two-pane below `md` | finding 4 |
| **S3** ✅ | **טאבים ופריסה** | 20% | scrollable tab bar in the hub · scrollable tab bar in profile · settings stacks to one column | — |
| **S4** ✅ | **Overlays ופוליש** | 15% | notification panel spans the bar below `md` · tap targets ≥44px · 16px input font (no iOS zoom) | finding 5 |
| **S5** ✅ | **אימות** | 10% | `qa/mobile.mjs` at 360/390/430 · one gate (`npm run qa:gate`) running all 8 sweeps · documented in the README | — |

Cumulative completion after each sprint: **35 → 55 → 75 → 90 → 100%**.

**S1–S5 are done — cumulative 100%.** `npm run qa:gate -- --build` is green:
mobile 60/60 · deep-check 30/30 · ui-walkthrough no findings · topbar ✔ ·
viewport-fit 0/17 · sidebar-fit ✔ · account-menu 14/14 · profile-details 13/13.

- S1: the bottom nav is `src/components/MobileNav.tsx`, split out of
  `DashboardSidebar.tsx`, which despite its name was rendering it; that file is
  now genuinely desktop-only.
- S2: messages is list↔chat below `md`, driven by the `conversationId` already
  in the URL, so back/forward and refresh work without extra state. The same
  flow was applied to `MessagesDemo` — which is what actually renders today,
  and was the screen the audit caught as a dead end. The card height also now
  subtracts the bottom nav (`9.5rem`), otherwise the composer sat underneath it.
- S3: settings was the real defect here — its `12rem 1fr` grid resolved to
  `192px 164px` on a 390px phone, leaving the content 164px wide. It now stacks
  below `md`, with the rail becoming a scrollable strip on top. The hub tab bar
  already scrolled; what it lacked was scrolling the *active* tab into view, so
  landing on a later tab looked like nothing was selected. Profile's four tabs
  fit 390px with nothing to spare, so that strip scrolls too rather than
  squeezing the labels at 360px.
- S4: capping the notification panel's *width* was not enough — anchored to the
  bell (~72px in), a 20rem panel still ended 24px past a 390px screen. Below md
  it is `fixed inset-x-2` and spans the bar instead; desktop keeps the anchored
  dropdown. Sub-16px inputs (which make iOS zoom on focus) are handled by one
  `@media (max-width: 767px)` rule in globals.css rather than per-field edits.
  Tap targets: the bell and avatar were 36×36 on **every** route; those plus the
  join, edit, publish, filter and language controls are now ≥44px on mobile via
  `min-h-11 md:min-h-0`, leaving the desktop scale untouched.

- S5: the sweeps already existed; what was missing was a *gate*. Four of them
  (`topbar`, `viewport-fit`, `sidebar-fit`, `ui-walkthrough`) printed "✘" and
  still exited 0, so a failure was invisible to any runner. They now exit
  non-zero, and `qa/gate.mjs` builds, starts one server, runs all eight, and
  returns a single code. Two things the gate immediately exposed, neither of
  them a mobile bug:
  - `ui-walkthrough` flagged 10 "untranslated" strings that were mock project
    titles, tech tags and the "English" language button. Those are data, not
    chrome; they now carry `data-qa-zone="content"` and the sweep skips them.
  - `viewport-fit` flagged `/nda` for 167px of overflow. Measured: `min-h-screen`
    correctly resolves to `calc(100% - 64px)`, and the page is tall because its
    form content is 955px. The suite's premise — empty data means nothing to
    scroll — never held for a static form. It now flags only the actual defect
    (a viewport-sized box whose *content* would have fit), and ends by injecting
    that bug to prove the narrowed check can still fail.

S1 first is deliberate: the overflow and the stale nav are shell-level, so every
other screen is measured against a broken baseline until they're fixed. S5 last
but not optional — what isn't measured breaks again on the next change.

A live tracker with these sprints and progress charts is published as an
artifact (tick tasks to watch the curve move).

---

## 8. Verification

`qa/mobile.mjs` sweeps 360/390/430px asserting: the page cannot scroll
horizontally on any route, bottom nav present with the agreed items and no
clipped labels, messages list↔chat works, no overlay exceeds 92vw, every input
is ≥16px, and every control is ≥44px tall.

It runs inside the gate, which is the single command to run before merging:

```bash
npm run qa:gate -- --build
```

See the README's *Testing & QA* section for the suite table and the rules for
adding one.
