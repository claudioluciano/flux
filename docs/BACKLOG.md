# Flux MVP Backlog

> Last updated: 2026-01-11

---

## Phase 0: Admin App - COMPLETE

> Goal: Core entity management and document storage

### 0.1 Foundation
- [x] Database schema (entities, documents tables)
- [x] Validators (CPF, CNPJ)
- [x] Permissions helper functions
- [x] Better Auth integration

### 0.2 Entities (Clients/Suppliers)
- [x] Entity list with filters (all, clients, suppliers)
- [x] Create/edit entity form
- [x] Entity detail page
- [x] Soft delete (deactivate)
- [x] CPF/CNPJ validation

### 0.3 Documents
- [x] Document list with filters (category, expiration)
- [x] File upload with drag & drop
- [x] Document preview (PDF/images)
- [x] Link documents to entities
- [x] Expiration tracking

### 0.4 Dashboard & Layout
- [x] Sidebar navigation
- [x] Mobile responsive layout
- [x] Dashboard with stats
- [x] Empty states

### 0.5 Auth
- [x] Login page
- [x] Register page
- [x] Organization selection/creation
- [x] Protected routes

---

## Phase 1: Financial MVP - COMPLETE

> Goal: Basic accounts payable/receivable with cash flow visibility

### 1.1 Foundation
- [x] Add `accounts` table (expense/revenue categories)
- [x] Add `transactions` table (payables & receivables)
- [x] Default account seeding (common categories)
- [x] Financial validators and helpers

### 1.2 Accounts (Categories)
- [x] Account list page with type tabs
- [x] Create/edit account form
- [x] Account types: expense, revenue, cost
- [x] System accounts protection

### 1.3 Accounts Payable
- [x] Payable list with filters (status, date, supplier)
- [x] Create payable form (description, amount, due date, supplier, category)
- [x] Mark as paid action (full or partial)
- [x] Overdue highlighting
- [x] Payment method tracking
- [x] Payable detail page

### 1.4 Accounts Receivable
- [x] Receivable list with filters (status, date, client)
- [x] Create receivable form (description, amount, due date, client, category)
- [x] Mark as received action (full or partial)
- [x] Overdue highlighting
- [x] Payment method tracking
- [x] Receivable detail page

### 1.5 Cash Flow View
- [x] Cash flow page with chart + table view
- [x] Date range selector (week/month/quarter)
- [x] Daily in/out visualization (bar chart)
- [x] Running balance calculation
- [x] Projected balance toggle

### 1.6 Financial Dashboard
- [x] Balance summary widget (payable, receivable, projected)
- [x] Overdue items widget
- [x] Upcoming due dates widget (next 7 days)
- [x] Quick action buttons

---

## Phase 2: Financial Complete

> Goal: Full financial management with DRE and quotes

### 2.1 DRE (Income Statement)
- [ ] DRE report page
- [ ] Period filters (month, quarter, year)
- [ ] Revenue vs Costs vs Expenses breakdown

### 2.2 Quotes
- [ ] Add `quotes` table with items
- [ ] Quote list page
- [ ] Quote form (client, items, discount, validity)
- [ ] Quote status flow (draft → sent → approved/rejected)
- [ ] Convert quote to receivable
- [ ] Quote PDF generation

### 2.3 Invoicing
- [ ] Invoice PDF template
- [ ] Generate invoice from receivable
- [ ] Company settings (logo, header)

### 2.4 Enhancements
- [ ] Recurring transactions
- [x] Payment methods (moved to Phase 1)
- [x] Partial payments (moved to Phase 1)
- [ ] Cash health score widget

---

## Phase 3: Inventory

> Goal: Product/service catalog with stock tracking

### 3.1 Products
- [ ] Add `products` table
- [ ] Product list page
- [ ] Product form (name, SKU, cost, sale price, stock)
- [ ] Low stock alerts

### 3.2 Services
- [ ] Add `services` table
- [ ] Service list page
- [ ] Service form (name, description, price)

### 3.3 Stock Management
- [ ] Stock movements table
- [ ] Purchase registration (increases stock)
- [ ] Sale registration (decreases stock)
- [ ] Stock balance view

### 3.4 Financial Integration
- [ ] Products/services in quotes (when Financial enabled)
- [ ] Auto-generate payable from purchase
- [ ] Auto-generate receivable from sale
- [ ] CMV/CSP calculation for DRE

---

## Phase 4: HR

> Goal: Employee management with advances and loans

### 4.1 Employees
- [ ] Add `employees` table
- [ ] Employee list page
- [ ] Employee form (name, CPF, role, department, salary, hire date)

### 4.2 Salary Advances
- [ ] Add `advances` table
- [ ] Advance request form
- [ ] Advance balance tracking

### 4.3 Employee Loans
- [ ] Add `loans` table
- [ ] Loan form with payment schedule
- [ ] Installment tracking

### 4.4 Benefits (Optional)
- [ ] Transportation voucher tracking
- [ ] EPI (safety equipment) registry
- [ ] EPI replacement alerts

---

## Priority Order

1. ~~**Phase 1.1-1.4** - Core transactions (P0)~~ COMPLETE
2. ~~**Phase 1.5** - Cash flow view (P0)~~ COMPLETE
3. ~~**Phase 1.6** - Financial dashboard (P0)~~ COMPLETE
4. **Phase 2.1** - DRE (P1) - NEXT
5. **Phase 2.2** - Quotes (P1)
6. **Phase 2.3-2.4** - Invoice & enhancements (P2)
7. **Phase 3** - Inventory (P1)
8. **Phase 4** - HR (P2)

---

## Go-to-Market Milestone

**Minimum for launch:** Phase 0 + Phase 1 complete - ACHIEVED
- [x] User can manage clients/suppliers
- [x] User can upload documents
- [x] User can track payables/receivables
- [x] User can see cash flow projection
- [x] User can track partial payments
- [x] User can select payment methods
