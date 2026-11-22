# Karigor — On-Demand Home Services Marketplace (Frontend)

Karigor is a high-performance on-demand home services platform connecting verified technicians across Bangladesh with customers seeking home repair, electrical maintenance, plumbing, appliance servicing, and automation.

Built with **Next.js 16 (App Router & Turbopack)**, **React 19**, **Tailwind CSS v4**, **Base UI (shadcn)**, **TanStack React Query v5**, and fully integrated with the **Karigor API** (`karigor-api`).

---

## 🔑 Test Credentials (MR-4)

The backend database is seeded with the following ready-to-test accounts:

| Role                       | Email                    | Password         | Permissions & Available Views                                                                                                      |
| :------------------------- | :----------------------- | :--------------- | :--------------------------------------------------------------------------------------------------------------------------------- |
| **Platform Administrator** | `admin@karigor.com`      | `Admin@12345`    | System overview, platform revenue/GMV, user management (ban/unban), category manager, global orders                                |
| **Verified Technician**    | `technician@karigor.com` | `Tech@12345`     | Dashboard KPIs, calendar availability scheduler, service catalog editor, booking lifecycle actions (accept/decline/start/complete) |
| **Customer**               | `customer@karigor.com`   | `Customer@12345` | Service exploration, slot picker booking, Stripe checkout, booking cancellation, transaction history, review submission            |

> **Admin Protection Rule:** System administrators cannot be banned, and administrators cannot ban their own accounts.

---

## ⚡ Tech Stack & Architecture

- **Framework:** Next.js 16.4 (App Router, Turbopack, Partial Prerendering)
- **UI & Design:** React 19, Tailwind CSS v4, Base UI primitives, Lucide Icons, Sonner toasts
- **State Management & Caching:** TanStack React Query v5 (optimistic updates, automatic rollback, background cache synchronization) and Zustand (client auth state)
- **Forms & Validation:** React Hook Form + Zod
- **Authentication:** JWT stored in httpOnly, Secure, SameSite `karigor_token` cookie with Next.js edge middleware role-based route protection
- **BFF Proxy Layer:** `/api/bff/[...path]` automatically bridges client fetch requests, forwarding session cookies as Bearer tokens to the backend
- **Real Payments (MR-5):** Real Stripe Checkout integration via `/api/bff/payments/create` with checkout session redirect, double-click protection, and webhook verification polling
- **Testing & Quality:** Vitest unit test suite, ESLint v9, Prettier, Husky, lint-staged, Commitlint, GitHub Actions CI

---

## 🚀 Quick Start & Installation

### 1. Prerequisites

- Node.js >= 20.x
- pnpm >= 9.x
- Karigor API running on `http://localhost:5000/api` (see `karigor-api`)

### 2. Install Dependencies

```bash
pnpm install
```

### 3. Environment Variables

Create `.env.local` in the project root (see `.env.example`):

```env
# Backend API Base URL
NEXT_PUBLIC_API_URL=http://localhost:5000/api
API_URL=http://localhost:5000/api

# Client Base URL
NEXT_PUBLIC_CLIENT_URL=http://localhost:3000

# Stripe Publishable Key (for hosted checkout and elements)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_sample
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

### 5. Run Lint, Typecheck & Unit Tests

```bash
# Run ESLint
pnpm lint

# Run TypeScript compiler check
pnpm typecheck

# Run Vitest unit tests
pnpm test

# Production build
pnpm build
```

---

## 📁 Project Structure

```
karigor-frontend/
├── .github/
│   └── workflows/
│       └── ci.yml                     # Continuous integration workflow
├── src/
│   ├── app/
│   │   ├── (public)/                  # Marketplace public routes
│   │   │   ├── page.tsx               # Home landing with featured services & top technicians
│   │   │   ├── services/              # Search, filter, and pagination catalog
│   │   │   └── technicians/[id]/      # Technician public profile, reviews, slot picker
│   │   ├── api/
│   │   │   ├── bff/[...path]/route.ts # Backend-for-Frontend secure proxy
│   │   │   └── session/route.ts       # Login/logout httpOnly cookie handler
│   │   ├── auth/                      # Authentication (login & register with role choice)
│   │   ├── dashboard/
│   │   │   ├── customer/              # Customer requests, cancel modal, payment logs
│   │   │   │   └── bookings/[id]/pay/ # Real Stripe Checkout initiation (MR-5)
│   │   │   ├── technician/            # Technician overview, profile, availability, bookings
│   │   │   └── admin/                 # Platform metrics, user ban/unban, category management
│   │   ├── payment/
│   │   │   ├── success/page.tsx       # Stripe payment settlement verification & receipt
│   │   │   └── cancel/page.tsx        # Payment cancellation recovery screen
│   │   ├── layout.tsx                 # Root layout with providers & skip-link
│   │   ├── error.tsx                  # Global error boundary
│   │   └── not-found.tsx              # 404 page
│   ├── components/
│   │   ├── feedback/                  # EmptyState, ErrorState, ErrorBoundary
│   │   ├── layout/                    # Navbar, Footer, Sidebar, MobileNav, ThemeToggle
│   │   └── ui/                        # Button, Dialog, Card, Input, Table, Badge, Tabs, etc.
│   ├── features/                      # Domain feature modules (auth, bookings, payments, reviews)
│   ├── lib/                           # API client, error normalizer, auth utilities, constants
│   ├── providers/                     # React Query & NextThemes providers
│   ├── store/                         # Zustand auth store
│   └── types/                         # TypeScript domain & API interfaces
├── tests/
│   └── unit/                          # Vitest unit test suites
├── API_INTEGRATION.md                 # Complete API integration registry (MR-1)
└── README.md
```

---

## 🛡️ Mandatory Requirements Fulfillment

- **MR-1: API Integration:** Full REST mapping documented in [`API_INTEGRATION.md`](./API_INTEGRATION.md).
- **MR-2: UI Error Feedback:** Zero blank screens or unhandled promise rejections. All API errors pass through `normalizeError` with Sonner toast feedback and inline error boundaries.
- **MR-3: Git Commit History:** 30+ conventional commits created on feature branches and cleanly merged into `main`.
- **MR-4: Working Admin Credentials:** Documented above (`admin@karigor.com` / `Admin@12345`).
- **MR-5: Real Stripe Payments:** Real Stripe Checkout redirect implemented. No fake COD or simulated bypasses.
