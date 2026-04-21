# S.G.I.R. — Darouna Frontend

Système de Gestion Immobilière Résidentielle — Mobile-first PWA for residential building management in North Africa (Algeria/Morocco/France).

---

## Stack

- **React 18 + TypeScript** via Vite
- **Tailwind CSS** (configured with the exact Stitch design tokens below)
- **React Router v6** — role-based protected routes
- **Zustand** — auth & global state
- **Axios** — API client with JWT interceptors + refresh logic
- **react-i18next** — Arabic (RTL), French, English
- **PWA** — `public/manifest.json` + `public/icons/` (10 sizes 48–512px). vite-plugin-pwa removed (incompatible with Vite 8); manifest served statically

---

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── TopAppBar.tsx          # Fixed top bar, blur glass, avatar + notif bell
│   │   ├── BottomNav.tsx          # Role-aware bottom nav (4 tabs per role)
│   │   └── DashboardLayout.tsx    # TopAppBar + BottomNav wrapper
│   └── ui/
│       ├── StatusBadge.tsx        # Tinted glass badges (pending/in-progress/etc.)
│       ├── MetricCard.tsx         # Ambient-depth stat card
│       ├── GradientButton.tsx     # Primary emerald gradient CTA
│       └── GlassCard.tsx         # Glass-morphism floating card
├── pages/
│   ├── auth/
│   │   ├── RoleSelect.tsx         # Role selection (Syndic / Resident / Gardien)
│   │   ├── Login.tsx              # Email + password login
│   │   └── Register.tsx          # Registration form
│   ├── syndic/
│   │   ├── Dashboard.tsx          # Collection rate hero + budget variance + tasks
│   │   ├── Units.tsx              # Buildings + apartments list
│   │   ├── Tasks.tsx              # Task approval list
│   │   └── Finance.tsx            # Charges + payments + reports
│   ├── resident/
│   │   ├── Dashboard.tsx          # Balance hero + bento grid + building feed
│   │   ├── Properties.tsx         # Apartment details
│   │   ├── Ledger.tsx             # Payment history
│   │   └── Support.tsx            # File complaint + view complaints
│   └── gardien/
│       ├── Dashboard.tsx          # Today's summary
│       ├── Tasks.tsx              # Task list + status updates
│       ├── Finance.tsx            # Placeholder
│       └── Menu.tsx               # "More" tab — Phase 2 placeholder (profile/settings)
├── lib/
│   ├── api.ts                     # Axios instance, base URL from VITE_API_URL
│   ├── auth.ts                    # Auth API calls (login/register/refresh/logout/me)
│   └── cn.ts                      # clsx + tailwind-merge
├── store/
│   └── authStore.ts               # Zustand: user, role, tokens, isAuthenticated
├── router/
│   └── index.tsx                  # Routes with role guards
└── i18n/
    ├── index.ts                   # i18next setup
    ├── ar.json                    # Arabic strings
    ├── fr.json                    # French strings
    └── en.json                    # English strings
```

---

## Design System — "Verdant Sanctuary / Emerald Zenith"

Source of truth: `_extracted/stitch/stitch_resident_mobile_view/`

### Color Tokens (exact Tailwind config values)

```ts
colors: {
  "primary":                   "#2b6954",
  "primary-container":         "#71af97",
  "primary-fixed":             "#b0f0d6",
  "primary-fixed-dim":         "#95d3ba",
  "on-primary":                "#ffffff",
  "on-primary-container":      "#004231",
  "on-primary-fixed":          "#002117",
  "on-primary-fixed-variant":  "#0b513d",
  "secondary":                 "#515f74",
  "secondary-container":       "#d5e3fc",
  "secondary-fixed":           "#d5e3fc",
  "secondary-fixed-dim":       "#b9c7df",
  "on-secondary":              "#ffffff",
  "on-secondary-container":    "#57657a",
  "on-secondary-fixed":        "#0d1c2e",
  "on-secondary-fixed-variant":"#3a485b",
  "tertiary":                  "#006b5f",
  "tertiary-container":        "#0db6a4",
  "tertiary-fixed":            "#71f8e4",
  "tertiary-fixed-dim":        "#4fdbc8",
  "on-tertiary":               "#ffffff",
  "on-tertiary-container":     "#004139",
  "on-tertiary-fixed":         "#00201c",
  "on-tertiary-fixed-variant": "#005048",
  "error":                     "#ba1a1a",
  "error-container":           "#ffdad6",
  "on-error":                  "#ffffff",
  "on-error-container":        "#93000a",
  "surface":                   "#faf9f6",
  "surface-bright":            "#faf9f6",
  "surface-dim":               "#dbdad7",
  "surface-variant":           "#e3e2e0",
  "surface-container-lowest":  "#ffffff",
  "surface-container-low":     "#f4f3f1",
  "surface-container":         "#efeeeb",
  "surface-container-high":    "#e9e8e5",
  "surface-container-highest": "#e3e2e0",
  "on-surface":                "#1a1c1a",
  "on-surface-variant":        "#3c4a42",
  "inverse-surface":           "#2f312f",
  "inverse-on-surface":        "#f2f1ee",
  "inverse-primary":           "#95d3ba",
  "surface-tint":              "#2b6954",
  "outline":                   "#6c7a71",
  "outline-variant":           "#bbcabf",
  "background":                "#faf9f6",
  "on-background":             "#1a1c1a",
}
```

### Typography

```ts
fontFamily: {
  "headline": ["Nunito Sans", "sans-serif"],   // Display + section headers
  "body":     ["Montserrat", "sans-serif"],    // Body text, labels, data
  "label":    ["Montserrat", "sans-serif"],    // Small caps, badges
}
// Google Fonts URL:
// https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@700;800;900&family=Montserrat:wght@400;500;600;700&display=swap
```

### Border Radius

```ts
borderRadius: {
  DEFAULT: "0.25rem",
  lg:      "0.5rem",
  xl:      "0.75rem",   // Primary card radius
  full:    "9999px",    // Badges, pills, avatars
}
```

### Custom CSS Classes (add to index.css)

```css
.glass-glow {
  box-shadow: inset 1px 1px 0px 0px rgba(255, 255, 255, 0.3);
}
.ambient-depth {
  box-shadow: 0 20px 40px rgba(43, 105, 84, 0.06);
}
.glass-card {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(12px);
  box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.4);
}
.gloss-button {
  background: linear-gradient(135deg, #064E3B 0%, #10B981 100%);
  box-shadow: inset 2px 2px 4px rgba(255, 255, 255, 0.3), 0 10px 20px rgba(43, 105, 84, 0.1);
}
.material-symbols-outlined {
  font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
}
```

### Icons

Use **Material Symbols Outlined** exclusively.
```html
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet"/>
```

### Design Rules

1. **No 1px solid borders** — use background color shifts for separation
2. **No pure black** — use `on-surface` (#1a1c1a)
3. **Primary emerald gradient** (`#064E3B` → `#10B981`) only for CTAs and active nav
4. Ambient shadow (not drop shadows) for floating cards
5. `backdrop-filter: blur(12px)` on floating glass elements
6. `backdrop-filter: blur(8px)` on secondary glass elements
7. Background organic blobs: fixed, -z-10, `rounded-full blur-[100px]`

### Primary Gradient

```css
background: linear-gradient(to bottom right, #064E3B, #10B981);
```

---

## Role Navigation

### Syndic
- **Dash** → `dashboard` icon
- **Units** → `domain` icon
- **Fix** → `build_circle` icon
- **Cash** → `payments` icon

### Resident
- **Home** → `dashboard` icon
- **Properties** → `domain` icon
- **Ledger** → `account_balance_wallet` icon
- **Support** → `support_agent` icon

### Gardien
- **Home** → `home` icon
- **Tasks** → `assignment` icon
- **Finance** → `account_balance_wallet` icon
- **Menu** → `menu` icon

Bottom nav pattern (active state):
```jsx
// Active
<a className="flex flex-col items-center bg-gradient-to-br from-[#064E3B] to-[#10B981] text-white rounded-xl px-4 py-2 shadow-lg shadow-emerald-900/20">
// Inactive
<a className="flex flex-col items-center text-emerald-900/50 px-4 py-2">
```

Nav container:
```jsx
<nav className="fixed bottom-0 left-0 w-full z-50 bg-white/80 backdrop-blur-xl border-t border-emerald-900/5 shadow-[0_-10px_30px_rgba(43,105,84,0.04)] px-4 pb-6 pt-3 flex justify-around items-center rounded-t-[32px]">
```

---

## Backend API

**Base URL:** `VITE_API_URL` env variable (e.g., `http://localhost:5000`)

> **Important:** All API routes are prefixed `/api/v1/` (not `/api/`).
> e.g., `POST /api/v1/auth/login`, `GET /api/v1/buildings`

All requests: `Authorization: Bearer <accessToken>`

**Response envelope:**
```json
{
  "statusCode": 200,
  "data": {},
  "message": "Human readable message",
  "success": true,
  "timestamp": "2026-03-31T10:00:00Z"
}
```

### Auth Endpoints

```
POST   /api/v1/auth/register         { name, email, password, phone, role }
POST   /api/v1/auth/login            { email, password } → { accessToken, refreshToken, user }
POST   /api/v1/auth/logout           { refreshToken }
POST   /api/v1/auth/refresh-token    { refreshToken } → { accessToken }
GET    /api/v1/auth/me               → { user }
POST   /api/v1/auth/change-password  { currentPassword, newPassword }
```

**Token strategy:**
- Access token: 15 min, stored in memory (Zustand)
- Refresh token: 7 days, stored in `localStorage`
- On 401, auto-retry with `/api/auth/refresh-token`
- On logout, call `/api/v1/auth/logout` to blacklist

### Key Endpoints by Feature

```
# Buildings (Syndic)
GET    /api/v1/buildings
POST   /api/v1/buildings
GET    /api/v1/buildings/:id
PUT    /api/v1/buildings/:id
DELETE /api/v1/buildings/:id
POST   /api/v1/buildings/:id/assign-gardien
GET    /api/v1/buildings/:id/stats       → { totalUnits, occupancy%, revenue, openTasks }

# Apartments (Syndic)
GET    /api/v1/apartments
POST   /api/v1/apartments
GET    /api/v1/apartments/:id
PUT    /api/v1/apartments/:id
DELETE /api/v1/apartments/:id
POST   /api/v1/apartments/:id/assign-resident
DELETE /api/v1/apartments/:id/unassign-resident

# Tasks
POST   /api/v1/tasks                          (Syndic creates)
GET    /api/v1/tasks                          (Syndic: all tasks)
GET    /api/v1/tasks/gardien/my-tasks         (Gardien: my tasks — NOT /tasks/gardien)
POST   /api/v1/tasks/:id/assign               { gardienId }
PUT    /api/v1/tasks/:id/status               { status }
POST   /api/v1/tasks/:id/submit               (Gardien submits for approval)
POST   /api/v1/tasks/:id/approve              { approved: bool, reason? }
POST   /api/v1/tasks/:id/reject               { reason }
# NOTE: /api/v1/tasks/stats does NOT exist. Compute stats from the gardien task list.

# Charges (Syndic issues, Resident reads)
POST   /api/v1/charges
GET    /api/v1/charges
GET    /api/v1/charges/:id
GET    /api/v1/charges/apartment/:apartmentId
GET    /api/v1/charges/overdue
PUT    /api/v1/charges/:id
DELETE /api/v1/charges/:id

# Payments
POST   /api/v1/payments                  { chargeId, method, amount }
GET    /api/v1/payments
GET    /api/v1/payments/:id
POST   /api/v1/payments/:id/confirm      (Syndic confirms offline)
GET    /api/v1/payments/apartment/:apartmentId
GET    /api/v1/payments/resident/history

# Announcements
GET    /api/v1/announcements
POST   /api/v1/announcements
GET    /api/v1/announcements/:id
PUT    /api/v1/announcements/:id
DELETE /api/v1/announcements/:id
POST   /api/v1/announcements/:id/like
POST   /api/v1/announcements/:id/comment
POST   /api/v1/announcements/:id/view

# Votes
GET    /api/v1/votes
POST   /api/v1/votes
GET    /api/v1/votes/:id
POST   /api/v1/votes/:id/cast            { optionId }
POST   /api/v1/votes/:id/close
GET    /api/v1/votes/building/:buildingId

# Complaints
POST   /api/v1/complaints
GET    /api/v1/complaints
GET    /api/v1/complaints/:id
PUT    /api/v1/complaints/:id
POST   /api/v1/complaints/:id/response   { message }
POST   /api/v1/complaints/:id/rate       { rating: 1-5 }
GET    /api/v1/complaints/stats

# Notifications
GET    /api/v1/notifications
GET    /api/v1/notifications/unread-count
PUT    /api/v1/notifications/mark-all-read
PUT    /api/v1/notifications/:id/read
PUT    /api/v1/notifications/:id/archive
```

---

## Auth Store Shape (Zustand)

```ts
interface AuthState {
  user: User | null;
  role: 'syndic' | 'resident' | 'gardien' | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // actions
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => void;
}
```

Refresh token stored in `localStorage` under key `darouna_refresh_token`.

---

## i18n

Language detection order: `?lang=` param → localStorage → browser → fallback English.
RTL layout applies when `i18n.language === 'ar'`: set `dir="rtl"` on `<html>`.

Files: `src/i18n/en.json`, `fr.json`, `ar.json`

---

## PWA Config

From `_extracted/manifest/`:
```json
{
  "name": "Darouna",
  "short_name": "Darouna",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf9f6",
  "theme_color": "#2b6954",
  "icons": [ /* 48 to 512px */ ]
}
```
Note: Update `theme_color` from `#000000` to `#2b6954` (primary green).

---

## Stitch Reference Screens

Located at `_extracted/stitch/stitch_resident_mobile_view/`:

| Folder | Screen | Role |
|--------|--------|------|
| `login_role_selection/` | Role select + CTA | All |
| `refined_syndic_admin_dashboard_emerald/` | Syndic home | Syndic |
| `resident_dashboard_premium_emerald/` | Resident home | Resident |
| `gardien_task_list/` | Task list | Gardien |
| `resident_payment_ledger/` | Payment history | Resident |
| `file_a_complaint/` | New complaint form | Resident |
| `file_a_complaint_arabic/` | Arabic RTL complaint | Resident |
| `syndic_task_approval/` | Approve/reject tasks | Syndic |
| `evidence_capture/` | Photo upload | Gardien |
| `financial_control/` | Finance overview | Syndic |
| `property_directory/` | Building/unit browser | Syndic |

**Rule:** Always open the relevant Stitch `code.html` before building a screen. Match it pixel-for-pixel.

---

## Critical Rules

1. **Backend is read-only** — never modify files under `_extracted/backend/`
2. **Design is the law** — Stitch HTML files are the source of truth for every screen
3. **Mobile-first** — `min-h-screen pb-24` body, fixed bottom nav, fixed top bar
4. **No inline styles** unless they match exactly what Stitch uses (gradient widths, etc.)
5. **No raw borders** — use background shifts or `outline-variant/15` ghost borders
6. **VITE_API_URL** — never hardcode the API URL; always read from env
7. **Token refresh** — implement a single Axios interceptor that retries once on 401
8. **Role guards** — unauthenticated users → `/`, wrong role → redirect to own dashboard
9. **RTL** — `dir="rtl"` + `font-family: 'Noto Sans Arabic', sans-serif` when language is Arabic
10. **PWA** — `public/manifest.json` + `public/icons/` are the live files. `theme_color` is `#2b6954`. Do not use vite-plugin-pwa (incompatible with Vite 8)
11. **TopAppBar** — avatar tap navigates to `/{role}` dashboard; logout is the `logout` icon button next to the notifications bell. Never put logout on the avatar tap.
12. **Backend CORS** — `residence-app-backend/src/server.js` accepts `darouna.vercel.app` and any `darouna-*.vercel.app` preview URL via regex. If adding a new domain, update the `allowedOrigins` array there.

---

## Environment Variables

```bash
# .env.local
VITE_API_URL=http://localhost:5000
VITE_MOCK_DATA=true   # set to 'true' to use mock data (bypasses live API calls)
```

**Vercel production env vars** (set via `vercel env add`):
- `VITE_API_URL` → `https://darouna-sgir-backend.onrender.com`
- `VITE_MOCK_DATA` → `true` (enabled for demo/preview)

> **Gotcha:** Vercel sometimes stores env values with a trailing `\n`. Always use
> `printf 'value' | vercel env add NAME production` (not echo) to avoid this.
> The mock flag check uses `.trim()` defensively: `VITE_MOCK_DATA?.trim() === 'true'`

---

## MongoDB Atlas (Backend DB)

- **User:** `darouna_user`
- **Password:** `Darouna2026x`
- **Cluster:** `cluster0.pks5dvg.mongodb.net`
- **Connection string:** `mongodb+srv://darouna_user:Darouna2026x@cluster0.pks5dvg.mongodb.net/darouna?retryWrites=true&w=majority`
- Connection verified working as of 2026-04-21. All 14 collections present, seed data intact.

> Used by the backend (`residence-app-backend`). Set as `MONGODB_URI` in the backend's environment (Render).

---

## Commands

```bash
npm run dev      # Vite dev server
npm run build    # Production build
npm run preview  # Preview build
```

---

## Git Rules

- After every session: `git add -A && git commit -m "[descriptive summary of what was built]" && git push`
- Never leave uncommitted work at the end of a session
- Commit messages should describe **what was built**, not what files were changed
- Remote: `origin` → `https://github.com/Tsuyii/Darouna`
- Always create or update CHANGELOG.md with today's date and a summary of what was built before the final commit

---

## Test Accounts (seeded 2026-04-03, live on Atlas)

All three accounts verified working against `https://darouna-sgir-backend.onrender.com`.

| Email | Password | Role | Notes |
|-------|----------|------|-------|
| `syndic@test.com` | `Password123!` | syndic | No building ref (syndic manages buildings, not assigned to one) |
| `resident@test.com` | `Password123!` | resident | Apt 1A, Résidence Al Andalus |
| `gardien@test.com` | `Password123!` | gardien | Assigned to Résidence Al Andalus |

> **Gotcha — in-memory rate limiter:** The backend's `loginAttempts` object lives in-process memory.
> After 5 failed attempts per email it blocks indefinitely until the Render dyno restarts.
> If you're locked out, push any commit to the backend repo to trigger a redeploy.

---

## Mock Data (seeded 2026-04-03)

Seed script: `residence-app-backend/scripts/seed.js` — run with `node scripts/seed.js` from the backend root.

**Buildings (2)**
- Résidence Al Andalus — 6 apartments, managed by syndic, caretaker = gardien, Casablanca
- Résidence Les Orangers — 4 apartments, managed by syndic, Rabat

**Apartments (10)**
- Building 1: 1A (occupied → resident), 1B (occupied), 2A, 2B (vacant), 3A (maintenance), 3B (vacant)
- Building 2: 1A, 1B, 2A, 2B (all vacant)

**Announcements (5, all published)**
- Travaux ascenseur (maintenance, high)
- Réunion de copropriété (event, medium)
- Rappel cotisations (general, medium)
- Alerte sécurité (emergency, urgent)
- Jardinage collectif (event, low)

**Tasks (5)**
- `pending` — Nettoyage hall entrée
- `assigned` → gardien — Sortie poubelles
- `in_progress` → gardien — Remplacement ampoule
- `submitted_for_approval` → gardien — Vérification interphone
- `approved` → gardien — Nettoyage parking (approved by syndic)

**Charges (5)**
- Apt 1A: Cotisation Avril 2026 (pending, 800 MAD)
- Apt 1A: Cotisation Mars 2026 (paid, 800 MAD)
- Apt 1A: Eau Mars 2026 (paid, 120 MAD)
- Apt 1B: Cotisation Fév 2026 (overdue, 800 MAD)
- Apt 1B: Sécurité Avril 2026 (pending, 200 MAD)

**Payments (3)**
- RCP-2026-001: 800 MAD bank transfer, completed (Mars maintenance)
- RCP-2026-002: 120 MAD cash, completed (Mars utilities)
- Pending: 800 MAD bank transfer (Avril maintenance)

**Complaints (3)**
- Bruit excessif (noise, high, in_progress — syndic responded)
- Fuite d'eau (maintenance, urgent, open)
- Éclairage défaillant (safety, high, resolved, rated 4/5)

---

## Backend Status (Complete, 193 tests passing)

All features are fully implemented on the backend. Frontend only needs to call the APIs.

| Feature | Backend | Frontend |
|---------|---------|---------|
| Auth (login, register, refresh, logout) | ✅ | ✅ Done |
| Role selection screen | — | ✅ Done |
| Syndic home dashboard | ✅ | ✅ Done |
| Resident home dashboard | ✅ | ✅ Done |
| Gardien dashboard + task list | ✅ | ✅ Done |
| Navigation shell (3 roles) | — | ✅ Done |
| Buildings & apartments (Syndic Units) | ✅ | ✅ Done |
| Syndic Tasks (approve/reject) | ✅ | ✅ Done |
| Syndic Finance (charges/payments) | ✅ | ✅ Done |
| Resident Properties | ✅ | ✅ Done |
| Resident Ledger (payment history) | ✅ | ✅ Done |
| Resident Support (complaints) | ✅ | ✅ Done |
| Announcements (Syndic create/delete + Resident read/like) | ✅ | ✅ Done |
| Votes (Syndic create/close + Resident cast) | ✅ | ✅ Done |
| Notifications panel (bell icon, all roles) | ✅ | ✅ Done |
| Gardien Finance | ✅ | ✅ Done |
| Gardien Menu (real content) | — | ✅ Done |
| Budgets & reports (Syndic Finance section) | ✅ | ✅ Done |

---

## QA Audit — 2026-04-03

Full browser audit via Puppeteer (gstack/browse) against production:
`https://darouna.vercel.app`

### Role: Syndic

| Route | Status | Notes |
|-------|--------|-------|
| `/` (role select) | ✅ OK | Loads cleanly, role cards work, CTA correct |
| `/login/syndic` | ✅ OK | Form works, backend cold-start ~8s on Render free tier |
| `/syndic` (dashboard) | ✅ OK | Real data: 100% collection, 72,000 MAD revenue, 5 open tasks, Résidence Al-Andalus |
| `/syndic/units` | ⚠️ Placeholder | Phase 2 stub — no data shown (CLAUDE.md status corrected) |
| `/syndic/tasks` | ⚠️ Placeholder | Phase 2 stub |
| `/syndic/finance` | ⚠️ Placeholder | Phase 2 stub |
| Role guard (→ /resident) | ✅ OK | Redirects to /syndic correctly |
| Avatar tap | ✅ OK | Navigates to /syndic dashboard |
| Logout button | ✅ OK | Returns to role select |

### Role: Resident

| Route | Status | Notes |
|-------|--------|-------|
| `/login/resident` | ✅ OK | Logs in correctly |
| `/resident` (dashboard) | ✅ OK | Real data: 3,600 MAD balance, 3 announcements in Building Feed |
| `/resident/properties` | ⚠️ Placeholder | Phase 2 stub |
| `/resident/ledger` | ⚠️ Placeholder | Phase 2 stub |
| `/resident/support` | ⚠️ Placeholder | Phase 2 stub |
| Role guard (→ /syndic) | ✅ OK | Redirects to /resident correctly |
| Logout button | ✅ OK | Returns to role select |

### Role: Gardien

| Route | Status | Notes |
|-------|--------|-------|
| `/login/gardien` | ✅ OK | Logs in correctly |
| `/gardien` (dashboard) | ✅ OK | Real data: 8 total tasks, 3 pending, 2 in-progress, 3 completed; Résidence Al-Andalus |
| `/gardien/tasks` | ✅ OK | Live tasks with functional Pause/Submit/Start Task buttons |
| `/gardien/finance` | ⚠️ Placeholder | Phase 2 stub |
| `/gardien/menu` | ❌ → ✅ FIXED | Was missing route → catch-all sent user to role select. Fixed: added GardienMenu page + route |

### Console Errors (all roles)

All errors observed were from Vercel's deployment-protection layer (401/403) and Google FedCM (deprecated API). Zero app-level JS errors across all roles and pages.

### Fixes Applied (2026-04-03)

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🔴 High | Gardien Menu tab navigates to `/` (no route for `/gardien/menu`) | Created `src/pages/gardien/Menu.tsx` + added route in `router/index.tsx` |
| 2 | 🟡 Medium | CLAUDE.md incorrectly marked Syndic Units as ✅ Done | Corrected status to ⏳ Phase 2 next |

### Fixes Applied (2026-04-21)

| # | Severity | Issue | Fix |
|---|----------|-------|-----|
| 1 | 🔴 High | Gardien dashboard calls `GET /api/v1/tasks/stats` — route does not exist | Replaced with `GET /api/v1/tasks/gardien/my-tasks`; compute stats client-side |
| 2 | 🔴 High | Gardien Tasks calls `GET /api/v1/tasks/gardien` — actual route is `/gardien/my-tasks` | Fixed endpoint path |
| 3 | 🟡 Medium | MongoDB `_id` not mapped to `id` — React keys and action handlers break with live data | Added `_id → id` normalization in Gardien Tasks and Resident Dashboard live paths |
| 4 | 🟡 Medium | Announcement types `emergency`, `maintenance`, `general` not in type map | Added all backend types; `emergency` now renders as Urgent/red badge |
