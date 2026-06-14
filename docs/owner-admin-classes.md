# Owner and Admin Backend Classes

This document summarizes the owner and admin model classes that coordinate homestay listing management and platform verification in the backend.

## Overview

Owner and admin workflows share `backend/src/repositories/homestayRepository.js` as the data-access dependency. The repository owns PostgreSQL queries for creating, updating, archiving, filtering, and changing the verification status of homestays. Public guest-facing repository reads only return approved listings, so pending, rejected, and archived records stay out of guest browsing flows.

## Owner class: `M_Owner`

| Item | Details |
|------|---------|
| Source | `backend/src/models/M_Owner.js` |
| Class | `M_Owner` |
| Purpose | Owner/host homestay management. |
| Related routes | `backend/src/routes/ownerRoutes.js` |
| Repository dependency | `backend/src/repositories/homestayRepository.js` |

`M_Owner` represents host-side listing operations for UC 3.x. It validates owner homestay payloads, delegates persistence to the homestay repository, and preserves verification rules when a listing is created, updated, or soft-archived.

### Main methods

| Method | Use case mapping | Behavior |
|--------|------------------|----------|
| `createHomestay(fieldList)` | UC 3.1 create homestay | Validates required owner, title, price, address, city, and guest-capacity fields. Creates the homestay through the repository with status `pending`, `isVerified = false`, and no rejection reason. |
| `updateHomestay(homestayID, fieldList)` | UC 3.2 update/reverification | Loads the existing homestay, checks owner scope when `ownerId` is provided, validates the merged payload, and updates listing, location, and amenity data. Sensitive edits to address or price re-trigger admin verification by setting status `pending`, `isVerified = false`, and clearing the rejection reason. |
| `deleteHomestay(homestayID)` | UC 3.3 soft archive | Calls the repository archive operation instead of hard-deleting the listing. Archived records get status `archived` and `isVerified = false`. |
| `viewMyHomestays(ownerID)` | Owner listing management | Returns all listings owned by the supplied owner ID so owners can manage their pending, approved, rejected, or archived records. |

### Owner route mapping

`backend/src/routes/ownerRoutes.js` exposes the owner model through `/api/owner` routes:

- `GET /api/owner/homestays?ownerId=` → `viewMyHomestays`
- `GET /api/owner/homestays/:id?ownerId=` → owner-scoped homestay detail based on `viewMyHomestays`
- `POST /api/owner/homestays` → `createHomestay` (UC 3.1)
- `PUT /api/owner/homestays/:id` → `updateHomestay` (UC 3.2)
- `DELETE /api/owner/homestays/:id` → `deleteHomestay` soft archive (UC 3.3)

## Admin class: `M_Admin`

| Item | Details |
|------|---------|
| Source | `backend/src/models/M_Admin.js` |
| Class | `M_Admin` |
| Purpose | Platform administrator verification workflow. |
| Related routes | `backend/src/routes/adminRoutes.js` |
| Repository dependency | `backend/src/repositories/homestayRepository.js` |

`M_Admin` represents the platform verification workflow for UC 4.1. It provides read access to pending and full admin listing queues, then updates verification status through repository status changes.

### Main methods

| Method | Use case mapping | Behavior |
|--------|------------------|----------|
| `viewPendingHomestays()` | UC 4.1 verify homestay | Returns listings with status `pending` for admin review. |
| `viewAllHomestays()` | Admin listing oversight | Returns every homestay status for back-office visibility, including pending, approved, rejected, and archived records. |
| `approveHomestay(homestayID)` | UC 4.1 verify homestay | Sets the homestay status to `approved`, sets `isVerified = true`, and clears any rejection reason. |
| `rejectHomestay(homestayID, reason)` | UC 4.1 verify homestay | Requires a non-empty rejection reason, then sets the homestay status to `rejected`, sets `isVerified = false`, and stores the trimmed rejection reason. |

### Admin route mapping

`backend/src/routes/adminRoutes.js` exposes the admin model through `/api/admin` routes:

- `GET /api/admin/homestays` → `viewAllHomestays`
- `GET /api/admin/homestays/pending` → `viewPendingHomestays` (UC 4.1)
- `POST /api/admin/homestays/:id/approve` → `approveHomestay` (UC 4.1)
- `POST /api/admin/homestays/:id/reject` → `rejectHomestay` (UC 4.1)

## Status behavior

| Status/event | Resulting state | Visibility |
|--------------|-----------------|------------|
| New listing created by an owner | `status = pending`, `isVerified = false`, `rejectionReason = null` | Hidden from public guest views until approved. |
| Sensitive listing edit by an owner, such as address or price | `status = pending`, `isVerified = false`, `rejectionReason = null` | Hidden from public guest views until re-approved. |
| Admin approval | `status = approved`, `isVerified = true`, `rejectionReason = null` | Visible in public guest views and treated as available. |
| Admin rejection | `status = rejected`, `isVerified = false`, rejection reason required | Hidden from public guest views; owner can use the reason to revise and resubmit. |
| Owner deletion request | `status = archived`, `isVerified = false` | Hidden from public guest views while preserved for historical/admin records. |

## Repository responsibilities

`backend/src/repositories/homestayRepository.js` centralizes persistence for both classes:

- `createHomestay` inserts new listings as `pending`.
- `updateHomestay` saves owner edits and accepts model-provided verification status updates.
- `archiveHomestay` performs UC 3.3 soft archive behavior.
- `findPendingHomestays` and `findAllHomestaysForAdmin` power admin review screens.
- `setHomestayStatus` applies admin approval and rejection decisions.
- `findAllHomestays`, `filterHomestays`, and `searchHomestays` restrict public guest listing reads to approved homestays, which hides archived listings from public guest views.
