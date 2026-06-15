# Homestay Booking Management System

A web platform for managing the full homestay rental lifecycle — guests browse, search, and book properties; owners list and manage homestays; and admins verify listings before they go public. Built around an event-triggered, privacy-by-design data model.

The complete requirements are in [Homestay-Booking-Management-System-1.pdf](Homestay-Booking-Management-System-1.pdf). Architecture and conventions for contributors are in [CLAUDE.md](CLAUDE.md). Backend owner/admin class documentation is in [docs/owner-admin-classes.md](docs/owner-admin-classes.md).

## Tech stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + TypeScript, Vite 6, Tailwind CSS v4, shadcn/ui (Radix), react-router-dom 7 |
| State (current) | In-memory mock data + React Context (no persistence) |
| Backend (planned) | Node.js + Express **or** Java Spring Boot, REST API |
| Database (planned) | Relational (PostgreSQL/MySQL) |
| Integrations (planned) | Google Maps, payment gateway, ID verification / OCR |

## Getting started

```bash
npm install      # or: pnpm install
npm run dev      # http://localhost:5173
npm run build    # production build
```

## Current status

The app is a **frontend prototype**: all nine guest/owner/admin views exist and are wired through role-based routing, but they read from mock data and a fake login. There is no backend, database, real auth, payments, or tests yet. The roadmap below tracks the path from prototype to the system described in the spec.

**Roles:** `guest` (unregistered visitor) · `user` (registered guest) · `owner` (host) · `admin`.

## Development timeline

A realistic build plan over **~10–12 weeks** (Agile, iterative). Phases are roughly sequential but front-end and back-end tracks can overlap. Use case IDs (UC x.x) reference the spec.

### Phase 0 — Scaffold ✅ (done)
- [x] Figma Make React/Vite/TypeScript project, Tailwind + shadcn/ui
- [x] Role-based routing and `ProtectedRoute` ([src/app/App.tsx](src/app/App.tsx))
- [x] Mock auth context and seed data (users, homestays, bookings)
- [x] Initial views for guest, owner, and admin flows

### Phase 1 — Foundations (Weeks 1–2)
*Goal: a real architecture and data layer to build features on.*
- [ ] Finalize the normalized data model (User/Owner/Admin · Homestay/Location/Amenities · Booking · Feedback) and reconcile with current flat interfaces
- [ ] Stand up the backend skeleton (Express or Spring Boot) + relational schema + migrations
- [ ] Introduce the `M_*` model and `C_*` controller layers (MVC convention from the spec)
- [ ] Real authentication: registration + login with hashed/salted passwords, JWT/session (replaces the mock `AuthContext`)
- [ ] **Verify:** a user can register, log in, and hit a role-gated route end-to-end against the API

### Phase 2 — Guest browsing (Weeks 2–3)
*Goal: anyone can find a homestay. (UC 1.x)*
- [ ] View homestay details (UC 1.1)
- [ ] View on map via Google Maps (UC 1.2)
- [ ] Filter by location, price, room count, amenities (UC 1.3)
- [ ] Search by name (UC 1.4)
- [ ] Register an account (UC 1.5)
- [ ] **Verify:** filter/search return correct results and "Not found" states; details load real data

### Phase 3 — Booking & identity (Weeks 3–5)
*Goal: a registered guest can book, with identity verification. (UC 2.x)*
- [ ] Login / logout against the API (UC 2.1, 2.2)
- [ ] Book a homestay with a date/time range + availability validation to prevent overbooking (UC 2.3)
- [ ] Booking lifecycle: `Pending → Confirmed → Completed/Cancelled`
- [ ] ID verification at booking time (CCCD / license / passport), event-triggered capture, encryption at rest & in transit, masking, audit logging, retention/deletion policy; low-confidence cases routed to human review
- [ ] **Verify:** booking blocks double-booking; ID flow stores only minimal, encrypted data and is fully logged

### Phase 4 — Owner management (Weeks 5–6)
*Goal: hosts manage their listings. (UC 3.x)*
- [ ] Create homestay profile → enters `Pending Approval` (UC 3.1)
- [ ] Update homestay profile; editing Address/Price re-triggers admin verification (UC 3.2)
- [ ] Delete homestay → soft-archive (status `archived`) with confirmation (UC 3.3)
- [ ] Owner bank-account details for payouts
- [ ] **Verify:** new/edited listings are not publicly visible until re-approved; deletes archive rather than hard-delete

### Phase 5 — Admin verification (Week 6–7)
*Goal: nothing goes public without review. (UC 4.x)*
- [ ] Admin queue of pending homestays
- [ ] Approve / reject with reason; notify the host (UC 4.1)
- [ ] Approved listings become visible on the dashboard
- [ ] **Verify:** a rejected/pending listing never appears in guest browsing

### Phase 6 — Feedback & reviews (Week 7–8)
- [ ] Guests add feedback/reviews on homestays (after a completed stay)
- [ ] Display reviews on detail pages; allow guests to remove their own
- [ ] Admin moderation of feedback
- [ ] **Verify:** only eligible guests can review; moderation removes content from public view

### Phase 7 — Payments (Week 8–9)
- [ ] Integrate a payment gateway with encrypted communication
- [ ] Charge on booking confirmation; route payouts to owner accounts
- [ ] Refund / cancellation handling per policy
- [ ] **Verify:** a test transaction completes, refunds correctly, and is fully traceable

### Phase 8 — Hardening & non-functional (Weeks 9–11)
- [ ] Real-time availability updates (no overbooking under concurrency)
- [ ] Security pass: RBAC, least-privilege, encryption in transit/at rest, time-stamped audit logs
- [ ] Performance/load testing for concurrent users; cross-browser checks (Chrome, Firefox, Safari)
- [ ] Automated test suite (unit + integration + key e2e flows) and CI
- [ ] **Verify:** load test meets targets; security checklist passes; CI green

### Phase 9 — Deployment (Weeks 11–12)
- [ ] Cloud deployment (AWS / Azure / GCP) with monitoring and versioned releases
- [ ] Operational runbook and backup/retention jobs
- [ ] **Verify:** production smoke test of the full guest → booking → payment → review flow

### Future enhancements (post-launch, from the spec)
- Personalized recommender system · collaborative group bookings · AI concierge chatbot · dynamic pricing analytics · 360° virtual tours

## Design principles (from the spec)
- **Event-triggered data capture** — collect personal data (especially ID) only when a real business event requires it, never preemptively.
- **Privacy by design** — data minimization, masking, encryption, role-scoped access, audited actions, time-bound retention then secure deletion.
- **Approval before publish** — listings require admin verification; sensitive edits re-trigger it.
