# Darouna — S.G.I.R.

**Système de Gestion Immobilière Résidentielle**

A mobile-first Progressive Web App for residential building management in North Africa (Algeria, Morocco, France). Built for three distinct roles: Syndic (manager), Resident, and Gardien (caretaker).

---

## Tech Stack

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white&style=flat-square)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white&style=flat-square)
![Vite](https://img.shields.io/badge/Vite-6-646CFF?logo=vite&logoColor=white&style=flat-square)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white&style=flat-square)
![Zustand](https://img.shields.io/badge/Zustand-5-orange?style=flat-square)
![React Router](https://img.shields.io/badge/React_Router-6-CA4245?logo=reactrouter&logoColor=white&style=flat-square)
![PWA](https://img.shields.io/badge/PWA-Workbox-5A0FC8?logo=pwa&logoColor=white&style=flat-square)

| Layer | Technology |
|-------|-----------|
| UI Framework | React 18 + TypeScript |
| Build Tool | Vite |
| Styling | Tailwind CSS (custom design tokens) |
| Routing | React Router v6 with role-based guards |
| State | Zustand (auth + global state) |
| HTTP | Axios with JWT interceptors + refresh logic |
| i18n | react-i18next — Arabic (RTL), French, English |
| PWA | Workbox via vite-plugin-pwa |
| Backend | Node.js REST API (separate repo) |

---

## Features by Role

### Syndic (Building Manager)
- Dashboard with collection rate, budget variance, and open task summary
- Property directory: buildings and apartments management
- Task management: create, assign to gardien, approve/reject submissions
- Financial control: charges, payments, revenue reports
- Announcements and votes for building decisions
- Complaint oversight and response

### Resident
- Personal dashboard with balance, upcoming charges, and building feed
- Apartment details and lease information
- Payment ledger: full history of charges and payments
- Support: file complaints, track status, rate resolution
- Announcements feed with like/comment

### Gardien (Caretaker)
- Daily task list with status updates
- Submit completed work with photo evidence for syndic approval
- Finance overview (read-only)
- Notification feed

---

## Screenshots

> Coming soon — mobile screenshots for each role dashboard.

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or pnpm
- Backend API running (see [residence-app-backend](./residence-app-backend))

### Installation

```bash
# Clone the repository
git clone https://github.com/Tsuyii/darouna-sgir-frontend.git
cd darouna-sgir-frontend

# Install dependencies
npm install

# Copy and configure environment variables
cp .env.example .env.local
# Edit .env.local with your API URL

# Start development server
npm run dev
```

### Build

```bash
npm run build      # Production build
npm run preview    # Preview the production build
```

---

## Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_API_URL` | Base URL for the backend API | `http://localhost:5000` |

Create a `.env.local` file at the project root:

```bash
VITE_API_URL=http://localhost:5000
```

---

## Project Structure

```
src/
├── components/
│   ├── layout/          # TopAppBar, BottomNav, DashboardLayout
│   └── ui/              # GlassCard, MetricCard, StatusBadge, GradientButton
├── pages/
│   ├── auth/            # RoleSelect, Login, Register
│   ├── syndic/          # Dashboard, Units, Tasks, Finance
│   ├── resident/        # Dashboard, Properties, Ledger, Support
│   └── gardien/         # Dashboard, Tasks, Finance
├── lib/
│   ├── api.ts           # Axios instance with JWT interceptor
│   └── auth.ts          # Auth API calls
├── store/
│   └── authStore.ts     # Zustand auth store
├── router/
│   └── index.tsx        # Role-guarded routes
└── i18n/                # en.json, fr.json, ar.json
```

---

## Design System

The app uses the **Verdant Sanctuary / Emerald Zenith** design system with:
- Primary color: `#2b6954` (emerald green)
- Glass-morphism cards with `backdrop-filter: blur(12px)`
- Material Symbols Outlined icons
- Nunito Sans (headlines) + Montserrat (body)
- Full RTL support for Arabic

---

## License

Private — all rights reserved.
