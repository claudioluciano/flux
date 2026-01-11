# Phase 0: Admin App - Progress Tracker

> Last updated: 2026-01-11

## Feature Overview

| Feature | Status | Progress |
|---------|--------|----------|
| Foundation (Schema & Utils) | Complete | 100% |
| Entities | Complete | 100% |
| Documents | Complete | 100% |
| Dashboard Layout | Complete | 100% |
| Auth Pages | Complete | 100% |

---

## Foundation (Schema & Utils)

### Database Schema (`convex/schema.ts`)
- [x] Define `entities` table with all fields and indexes
- [x] Define `documents` table with all fields and indexes
- [x] Add search indexes
- [x] Deploy schema

### Validators (`convex/lib/validators.ts`)
- [x] CPF validation function
- [x] CNPJ validation function
- [x] Document normalization helper
- [x] Shared argument validators

### Permissions (`convex/lib/permissions.ts`)
- [x] `getCurrentUserWithOrg()` - get user + org from session
- [x] `requireRole()` - role hierarchy check
- [x] Helper functions (canView, canEdit, canDelete)

### Better Auth Helpers (`convex/betterAuth/lib.ts`)
- [x] `listSessionsByUser` - get sessions for user
- [x] `getMemberByUserAndOrg` - get member record
- [x] `listOrganizationsByUser` - get user's organizations

### Dependencies
- [x] Install `react-dropzone`
- [x] Install `react-hook-form`, `@hookform/resolvers`, `zod`

---

## Entities

### Backend (`convex/entities/`)

**Queries:**
- [x] `list` - list entities by org with filter
- [x] `get` - get single entity by ID
- [x] `search` - search entities by name
- [x] `checkDocumentExists` - duplicate document check
- [x] `getCounts` - get counts by type

**Mutations:**
- [x] `create` - create entity with validation
- [x] `update` - update entity
- [x] `toggleActive` - soft delete
- [x] `remove` - hard delete

### Components (`components/entities/`)
- [x] `entity-list.tsx` - data table with filters
- [x] `entity-form.tsx` - create/edit form

### Pages
- [x] `app/(dashboard)/entities/page.tsx` - list view
- [x] `app/(dashboard)/entities/new/page.tsx` - create form
- [x] `app/(dashboard)/entities/[id]/page.tsx` - detail view
- [x] `app/(dashboard)/entities/[id]/edit/page.tsx` - edit form

### Features
- [x] Search functionality
- [x] Filter by type (clients/suppliers/both)
- [x] CPF/CNPJ validation
- [x] Soft delete with confirmation
- [x] Show linked documents in detail view

---

## Documents

### Backend (`convex/documents/`)

**Queries:**
- [x] `list` - list documents with filters
- [x] `get` - get single document
- [x] `getByEntity` - documents for an entity
- [x] `getExpiring` - documents expiring soon
- [x] `getDownloadUrl` - storage URL for download
- [x] `search` - search by name
- [x] `getCounts` - counts by category and status

**Mutations:**
- [x] `generateUploadUrl` - get Convex storage URL
- [x] `create` - create document after upload
- [x] `update` - update metadata
- [x] `replaceFile` - replace document file
- [x] `toggleActive` - soft delete
- [x] `remove` - delete document + file
- [x] `unlinkEntity` - remove entity link

### Components (`components/documents/`)
- [x] `document-list.tsx` - grid view with filters
- [x] `document-upload.tsx` - drag & drop upload
- [x] `document-form.tsx` - metadata form
- [x] `document-preview.tsx` - PDF/image viewer
- [x] `expiration-badge.tsx` - expiration status

### Pages
- [x] `app/(dashboard)/documents/page.tsx` - list view
- [x] `app/(dashboard)/documents/new/page.tsx` - upload form
- [x] `app/(dashboard)/documents/[id]/page.tsx` - preview + details
- [x] `app/(dashboard)/documents/[id]/edit/page.tsx` - edit metadata

### Features
- [x] File upload with progress
- [x] Filter by category
- [x] Filter by expiration status
- [x] PDF/image preview
- [x] Download functionality
- [x] Link to entity

---

## Dashboard Layout

### Layout Components
- [x] `components/layout/sidebar.tsx` - navigation sidebar
- [x] `components/layout/header.tsx` - top header with org selector
- [x] `components/layout/page-header.tsx` - page title + actions
- [x] `components/layout/empty-state.tsx` - empty state placeholder
- [x] `components/layout/mobile-sidebar.tsx` - mobile navigation

### Protected Layout
- [x] `app/(dashboard)/layout.tsx` - main layout wrapper
- [x] Auth check (redirect if not logged in)
- [x] Org check (redirect if no active org)

### Polish
- [x] Loading skeletons
- [x] Empty states
- [x] Delete confirmation dialogs

---

## Auth Pages

### Pages
- [x] `app/(auth)/layout.tsx` - auth layout wrapper
- [x] `app/(auth)/login/page.tsx` - login form
- [x] `app/(auth)/register/page.tsx` - registration form
- [x] `app/select-organization/page.tsx` - organization selection/creation

---

## UI Components Added

- [x] `components/ui/progress.tsx` - progress bar component

---

## Verification

- [x] Schema deploys without errors
- [x] Build compiles successfully
- [ ] Entity CRUD works end-to-end (manual testing needed)
- [ ] CPF/CNPJ validation rejects invalid inputs (manual testing needed)
- [ ] Document upload/preview/download works (manual testing needed)
- [ ] Documents link to entities correctly (manual testing needed)
- [ ] Org isolation works (can't see other org's data) (manual testing needed)
- [ ] Role permissions work (viewer can't edit) (manual testing needed)
- [ ] Search works for entities and documents (manual testing needed)
- [ ] Expiration filters work (manual testing needed)

---

## All Routes

```
/                         - Root page (placeholder)
/login                    - Login page
/register                 - Registration page
/select-organization      - Organization selection
/dashboard                - Dashboard home
/entities                 - Entity list
/entities/new             - Create entity
/entities/[id]            - Entity details
/entities/[id]/edit       - Edit entity
/documents                - Document list
/documents/new            - Upload document
/documents/[id]           - Document preview
/documents/[id]/edit      - Edit document metadata
/api/auth/[...all]        - Better Auth API routes
```

---

## Notes

- Used Base UI pattern with `render` prop instead of Radix `asChild`
- Better Auth user table is in component, so user ID is `string` not `Id<"user">`
- All pages use Portuguese (pt-BR) for UI text
- Build passed successfully with all pages included
