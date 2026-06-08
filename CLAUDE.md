# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this project is

A **Homestay Booking Management System** — a web platform where guests browse/book homestays, owners list and manage properties, and admins verify listings. The full specification lives in [Homestay-Booking-Management-System-1.pdf](Homestay-Booking-Management-System-1.pdf); the phased build plan lives in [README.md](README.md).

**Current reality vs. target.** The repo today is a **frontend-only prototype** scaffolded by Figma Make: React views wired to in-memory mock data with a fake auth context. There is **no backend, database, real authentication, payments, or tests yet**. Most of the work described in the spec is still to be built — see the roadmap in [README.md](README.md). When implementing a feature, assume you are filling in this gap, not extending a finished system.

## Commands

```bash
npm install        # install deps (a "pnpm" overrides block exists in package.json; pnpm install also works)
npm run dev        # start Vite dev server (default http://localhost:5173)
npm run build      # production build via Vite
```

There is **no lint, test, or typecheck script** defined. `tsc` is not wired up as a script and there is no `tsconfig` test runner. If you add tests or linting, add the corresponding npm script and document it here.

## Architecture

### Figma Make origin (don't break the scaffold)
- The package is named `@figma/my-make-file`; [vite.config.ts](vite.config.ts) registers a custom `figma:asset/` resolver that maps `figma:asset/<file>` imports to `src/assets/<file>`.
- The comment in [vite.config.ts](vite.config.ts) warns the React and Tailwind plugins are both required even if Tailwind looks unused — **do not remove them**.
- `@` is aliased to `src/` (e.g. `import { Button } from "@/app/components/ui/button"`).

### MVC naming convention (the key project-wide pattern)
The spec defines an MVC structure with **prefixed class names**, and the code follows it:
- **`V_*` = Views** — exist today in [src/app/views/](src/app/views/) (e.g. `V_DashboardView`, `V_BookingView`, `V_AdminVerificationView`). Shared presentational pieces also use the prefix (`V_SearchBar`).
- **`C_*` = Controllers** — **planned, not yet created** (spec lists `C_AuthController`, `C_BookingController`, `C_HomestayManagementController`, `C_AdminController`, `C_HomestayController`).
- **`M_*` = Models** — **planned, not yet created** (spec lists `M_User`, `M_RegisteredUser`, `M_Owner`, `M_Admin`, `M_Homestay`, `M_Location`, `M_Booking`, `M_Feedback`).

When adding controllers/models, follow this `V_/C_/M_` prefix convention. Today views read directly from mock data and `AuthContext`; the intended direction is Views → Controllers → Models.

### Routing & role-based access
[src/app/App.tsx](src/app/App.tsx) is the router and the source of truth for which roles see which pages. `ProtectedRoute` gates routes by role. Roles are `guest | user | owner | admin`, and the `hasRole` logic in [src/app/context/AuthContext.tsx](src/app/context/AuthContext.tsx) has important quirks:
- `'guest'` means **not logged in** (the unregistered visitor), not a logged-in role.
- `admin` passes every role check; `owner` also satisfies `user`-only routes.

### Data & auth (all mocked)
- [src/app/data/mockData.ts](src/app/data/mockData.ts) is the single in-memory data source and defines the `User`, `Homestay`, and `Booking` TypeScript interfaces plus seed arrays. There is **no persistence** — state resets on reload.
- [src/app/context/AuthContext.tsx](src/app/context/AuthContext.tsx) fakes login: it infers role from the email string (`admin@…` → admin, `owner@…` → owner, else user) and never checks a password. Replace this when wiring real auth.

### Code data model vs. spec data model
The code interfaces are a **flattened** version of the spec's normalized schema. Reconcile these when building the backend:
- Code `Homestay` inlines address/city/`pricePerHour`/`maxGuests`/`amenities[]`. The spec **normalizes** these into separate `Location` (lat/long/address/city), `Amenities` (bed/room counts + boolean flags), and a `price_per_hour` on `Homestay`.
- The spec has `Owner` (adds `bank_account_number`) and `Admin` (adds `admin_code`) as extensions of `User`; the code only has a flat `User` with a `role` field.
- **`Feedback`/reviews** and **ID verification** records exist in the spec but have **no code representation yet**.
- Status enums differ slightly — code `Homestay.status` is `pending|approved|rejected|archived` and `Booking.status` is `pending|approved|rejected|cancelled`; the spec booking states are `Pending|Confirmed|Cancelled|Completed`. Pick one and keep views consistent.

### UI components
- Canonical component library is **shadcn/ui** (Radix primitives) in [src/app/components/ui/](src/app/components/ui/) — prefer these for new UI. **MUI** (`@mui/material`) is also installed; avoid mixing the two in the same surface without reason.
- Tailwind CSS v4 (config-less, via `@tailwindcss/vite`); global styles in [src/styles/](src/styles/). Toasts use `sonner` (`Toaster` mounted in `App.tsx`).

## Spec-driven constraints worth remembering
These come from the PDF and should shape how features are built:
- **Event-triggered data capture**: collect personal data (especially ID) only at a real business event (booking confirmed, verification started, payment, check-in/out). Don't collect ID at registration.
- **ID verification** (UC for booking): accepts CCCD / driver's license / passport; documents must be encrypted at rest and in transit, masked, access-logged, and deleted after the legally required retention period. Low-confidence cases route to human review.
- **Owner listings require admin approval** before going public (`pending` → admin `approve`/`reject`). Editing Address or Price re-triggers verification.
- **Deletes are soft**: deleting a homestay sets status to `archived` for historical reporting, not a hard delete.
