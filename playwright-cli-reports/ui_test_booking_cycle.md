Browser automation verified full booking cycle via `playwright-cli` against `http://localhost:8080` (Docker stack: frontend 8080, backend 3001, postgres healthy).

### Booking cycle – verified

**Owner adds homestay** `frontend/src/app/views/V_HomestayFormView.tsx:96`
- Login `owner@example.com`/`password123` → header shows `My Homestays`/`Manage Bookings` `frontend/src/app/components/Header.tsx:35`
- `My Homestays` `frontend/src/app/views/V_HomestayManagementView.tsx:74` table loaded via `GET /api/owner/homestays?ownerId=2`
- `+ Add New Homestay` `V_HomestayFormView.tsx:142` → filled Title `Playwright Test Homestay 9876`, City `Hanoi`, Address `99 Test Street`, Price `250000`, Max Guests `5`, amenities WiFi/TV/Air Conditioning → `Submit Homestay` → dialog `Homestay Submitted!` → redirected to `/my-homestays` new row ID `13` status `pending`, `unavailable` – awaiting approval.

**Admin approves** `frontend/src/app/views/V_AdminVerificationView.tsx:114`
- Login `admin@example.com` → `Admin Panel` `Header.tsx:47`
- Pending table `2` rows (Hue + new homestay). `View` dialog `V_AdminVerificationView.tsx` → `Approve` → toast `You have approved a homestay.` → pending `1`, row `13` now `approved`/`available`, appears on dashboard `V_DashboardView.tsx:147` as card `250.000 ₫ / hour`.

**User books** `frontend/src/app/views/V_BookingView.tsx:187`
- Login `user@example.com` → `My Bookings` visible, dashboard shows new card at `/homestay/13` detail `V_HomestayDetailView.tsx:105` → `Book Homestay`
- Booking form hourly: Date `2026-08-25`, guests `2`, Start `10:00`, Duration `3` → price breakdown `250.000 ₫/hour x 3 = 750.000 ₫` `V_BookingView.tsx:434` → `Confirm Booking` → `Booking Successful!` dialog → redirected to `/`, then `My Bookings` `V_MyBookingsView.tsx:123` row pending `Aug 25 10:00-13:00`.

**Owner accepts** `frontend/src/app/views/V_OwnerBookingsView.tsx:103`
- Login owner → `Manage Bookings` → 1 pending `Sa Pa`/`Playwright Test`. `Accept` `V_OwnerBookingsView.tsx` → confirm `window.confirm` → toast `Booking approved. Guest can now pay` → status `approved`, `0 pending`.

**User pays** `frontend/src/app/views/V_TransactionView.tsx:36`
- Login user → `My Bookings` row now shows `Pay` → `checkout` view `#5` total `750.000 ₫`, Bank TPBank `00339705529` → `Confirm 750.000 ₫ Payment` → `POST /api/transactions` → dialog `Payment Successful` receipt `TXN-3-5` `750.000 ₫` `bank transfer` → `View My Bookings` → status `confirmed`, no `Pay` button.

**Reject path also verified**: second booking `Sa Pa Mountain Retreat` `2026-08-27 10:00 2h 320.000 ₫` created as user, owner `Reject` with `dialog-accept` on confirm `Reject this booking request?` → status `rejected`, toast `Booking rejected.`

API verified: `GET /api/bookings/homestay/13/availability` returned `{"check_in_date":"2026-08-25T10:00:00.000Z","check_out_date":"2026-08-25T13:00:00.000Z"}` → overlap detection works `V_BookingView.tsx:107`.

### UI bugs

**Critical – Responsive overflow (all pages):**
- `frontend/src/app/components/Header.tsx:14` `px-[80px]` + `frontend/src/app/components/V_SearchBar.tsx:23` `w-[400px]` + `frontend/src/app/components/Footer.tsx:5` `px-[80px]` → at 375px `document.documentElement.scrollWidth 791 > innerWidth 375` (also 808>768 tablet), header search/input and nav overflow outside viewport, horizontal scroll. Reproduced via `playwright-cli resize 375 812` + `eval scrollWidth`. Same `px-[80px]` in `V_DashboardView.tsx:147`, `V_HomestayManagementView.tsx:74`, `V_HomestayFormView.tsx:142`, `V_BookingView.tsx:188`, `V_HomestayDetailView.tsx:105`, `V_AdminVerificationView.tsx:114`, `V_OwnerBookingsView.tsx:103`, `V_MyBookingsView.tsx:123`. At 1280px no overflow (`1265<1280`) but fails <1024px.
- Dashboard `V_DashboardView.tsx:276` `grid grid-cols-3` non-responsive: 3 columns forced on mobile → cards cramped, filter sidebar `w-[280px]` doesn't stack. Should be `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` and flex column on small.
- Detail `V_HomestayDetailView.tsx:129` `grid grid-cols-[1fr_400px]` fixed 400px sidebar → overflows mobile, price card not stacked.
- Booking `V_BookingView.tsx:220` `grid grid-cols-2` for Date/Guests and Start/Duration stays 2-col on mobile → cramped inputs.
- Tables (`V_HomestayManagementView.tsx`, `V_MyBookingsView.tsx`, `V_OwnerBookingsView.tsx`, `V_AdminVerificationView.tsx`) wide, no `overflow-x-auto` wrapper → at 375px table forces page overflow (observed My Bookings 791px width). Horizontally scrollable container needed.
- Form amenities `V_HomestayFormView.tsx:267` `grid-cols-3` stays 3-col on mobile → checkboxes squeezed.

**Data / Logic:**
- `My Bookings` shows row `Viettel AI Feb 01, 8202 14:00` (`frontend/src/app/views/V_MyBookingsView.tsx:130` date formatting from malformed `82026-02-01` recorded by prior `e2e/test_booking_cycle.spec.ts:71`). Input `type="date"` allowed invalid year 8202; backend accepted `checkInDate` `82026-02-01` → stored as far future. Missing validation on `V_BookingView.tsx:225` `hourlyDate` / `V_BookingView.tsx:358` daily.
- Auth persistence: `frontend/src/app/context/AuthContext.tsx:19` `useState(null)` in-memory only → `page.goto` or refresh logs out (observed after `goto /homestay/13` while logged in as user → `Login to Book`). Expected for prototype but listed as `README` in-memory prototype; production needs storage.

**Minor:**
- No overlapping text detected via leaf-node bbox intersection check at desktop (0 overlaps, 78 leaves). No clipped images (`imgCount 8, clipped 0, overflowEls 0`).
- Images use `object-cover` in `Dashboard` `aspect-[16/9]` and `Detail` `aspect-[21/9]` – correctly clipped but intentional; no stretch.
- Console verbose only: `Input elements should have autocomplete attributes (suggested: "current-password")` on `/login` and `new-password` on `/register` – non-blocking a11y.
- Disabled `Images` file input `V_HomestayFormView.tsx:306` shows `Image persistence is not enabled yet` – correct fallback but button disabled without tooltip.
- Checkbox snapshot shows duplicate `role=checkbox` nodes (Radix renders hidden input + button) – not user-visible but double in accessibility tree.

### Quality checks

- `GET /api/health` `{"status":"ok","modules":["M_User","M_Owner","M_Admin"]}` ok. `GET /api/homestays` 200, `POST /api/guest/login` 200 for all roles. `requests` trace shows only `/api/*` calls, no 4xx except `Cannot GET /` and `Cannot GET /api/` (expected). `console` 0 errors.
- Screenshots captured: `/tmp/form.png`, `/tmp/dashboard_user.png`, `/tmp/mobile_mybookings.png`, `/tmp/mobile_detail.png` – visual check shows cards not overlapping, prices aligned, but mobile header truncated.

**Remains:** Fix responsive paddings (`px-4 md:px-[80px]`), make search `w-full max-w-[400px]`, wrap tables in `overflow-x-auto`, make grids responsive, add date validation (`max`/`min` year), persist auth via storage, fix autocomplete attributes.