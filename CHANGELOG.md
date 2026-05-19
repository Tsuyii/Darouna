# CHANGELOG

## 2026-05-19 — Payment Flow Fixes

### Fixed
- **`src/pages/resident/Ledger.tsx`**: Payment sheet was rendering behind the bottom nav (both `z-50`, nav wins due to DOM order) — bumped sheet to `z-[200]` so it appears above nav correctly
- **`src/pages/resident/Ledger.tsx`**: Charges API response shape mismatch — endpoint returns `data.data.charges[]` not a flat array; field names are `description` (not `title`), `category` (not `type`), `_id` (not `id`), `paymentMethod` (not `method`) — added explicit mapping in the `load()` function
- **`src/pages/resident/Dashboard.tsx`**: Pay Now hero button had no `onClick` — wired to `navigate('/resident/ledger')`
- **`darouna-frontend/.env.local`**: `VITE_API_URL` was pointing to port `5000` but backend runs on `5001` — corrected for local dev

---

## 2026-04-22 — Mock Payment Interface

### Updated
- **`src/pages/resident/Ledger.tsx`**: Added a full mock payment flow as a bottom sheet modal. No real payment gateway is connected.
  - **"Pay Now"** hero button opens a charge-selection step; per-row **"Pay"** button on each unpaid charge skips straight to method selection
  - **5-step flow**: Select charge → Choose method → Enter details → Processing animation → Success/receipt screen
  - **Payment methods**: Credit/Debit Card (formatted card number, name, expiry, CVV), Bank Transfer (shows syndic RIB, asks for payer's reference), Cash at reception (instructions only)
  - **Processing step**: 2.2 s pulsing ring + progress bar animation
  - **Success screen**: Gradient receipt card with generated `MOCK-2026-XXXX` reference, amount, method, date, and status
  - **Optimistic state update**: on completion the charge flips to `paid` and a new entry appears in the Payments tab — no page reload needed
  - In non-mock mode silently calls `POST /api/v1/payments` then always shows success (graceful degradation)

---

## 2026-04-14 — Gardien Finance, Gardien Menu, Budget Report

### Added / Replaced
- **`src/pages/gardien/Finance.tsx`** (replaced placeholder): Real work-summary page for the Gardien role. Hero shows tasks completed & approved this month. Stats grid: Approved / In Progress / Pending counts. Completed tasks list with date and approved badge. Monthly breakdown table (total assigned, approved, awaiting approval, in progress). Fetches from `GET /api/v1/tasks/gardien`; falls back to mock tasks when `VITE_MOCK_DATA=true`.
- **`src/pages/gardien/Menu.tsx`** (replaced placeholder): Real profile & settings page. Shows avatar initials + name + email from Zustand auth store with "Caretaker" badge. Language switcher (Français / English / العربية) using react-i18next. Change Password accordion calling `POST /api/v1/auth/change-password` with success/error feedback. About section (app name, version, role).
- **Budget Report section in `src/pages/syndic/Finance.tsx`**: Appended below the charges list. Computes collection rate from live charge data and renders a gradient progress bar. Breakdown table: Total issued, Collected, Pending, Overdue — all in MAD. Derived from the same charges array already loaded on the page (no extra API call).

---

## 2026-04-01 — Phase 2: Buildings & Apartments

### Added
- **`src/lib/buildings.ts`**: Typed API helper module — `buildingsApi` (list, get, create, update, remove, stats) and `apartmentsApi` (list, listByBuilding, create, update, remove, assignResident, unassignResident). Shared `Building`, `Apartment`, and `BuildingStats` TypeScript interfaces.
- **`src/pages/syndic/BuildingDetail.tsx`**: Full-screen slide-in detail panel for a selected building. Tabs: "Apartments" (live list with occupancy bar, assign/unassign resident, optimistic delete) and "Building Info" (editable form with save + danger-zone delete). Nested modals for adding apartments and assigning residents. Loading skeletons and error states throughout.
- **`src/pages/syndic/Units.tsx`** (replaced placeholder): Fully functional property directory — hero heading, 3 live stat cards (total units, active buildings, avg units per building), search bar with clear button, filter chips (All / Large / Small), building cards list with gradient manage button, FAB to add building, integrates BuildingDetail panel. Loading skeletons, empty state, and error+retry state.

### Design
- Matches Stitch `property_directory/code.html` — left-bordered stat cards, ambient-depth cards, emerald gradient CTAs, Material Symbols Outlined icons, Nunito Sans headlines, Montserrat body text
- Mobile-first at 390px with `pb-28` scroll clearance and fixed FAB above bottom nav

---

## 2026-04-01 — Phase 1 Complete

### Added
- **main.tsx / App.tsx**: Wired BrowserRouter + AppRouter; `initFromStorage` called on mount to restore session from refresh token
- **Login page** (`/login/:role`): Email/password form, role badge, error handling, navigate to dashboard on success
- **Register page** (`/register/:role`): Full name/email/phone/password form, auto-login after registration
- **Syndic Dashboard**: Live API-connected dashboard — collection rate hero with progress bar, budget variance cards (total units, open tasks), maintenance snapshot (latest 3 tasks), quick-action buttons, property card
- **Syndic Units** (Phase 2 placeholder): Feature-preview cards for property directory
- **Syndic Tasks** (Phase 2 placeholder): Feature-preview cards for task management
- **Syndic Finance** (Phase 2 placeholder): Feature-preview cards for financial control
- **Resident Dashboard**: Live API-connected — outstanding balance hero with Pay Now CTA, bento quick-insights grid, building announcements feed
- **Resident Properties** (Phase 2 placeholder)
- **Resident Ledger** (Phase 2 placeholder)
- **Resident Support** (Phase 2 placeholder)
- **Gardien Dashboard**: Live API-connected task stats (total/pending/in-progress/completed), CTA to tasks
- **Gardien Tasks**: Full live task list from `/api/tasks/gardien` — start task, submit task actions with optimistic UI
- **Gardien Finance** (Phase 2 placeholder)

### Design
- All screens match Stitch "Verdant Sanctuary / Emerald Zenith" design system
- Glass-morphism cards, ambient-depth shadows, emerald gradient CTAs, Material Symbols Outlined icons
