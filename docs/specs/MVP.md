# Flux MVP Definition

## MVP Philosophy

The MVP should deliver immediate value to small Brazilian businesses while establishing the modular architecture foundation. We prioritize **cash flow visibility** as the primary pain point.

## MVP Scope

### Phase 0: Foundation (Core)

**Admin App (Core)** - Always enabled

| Feature | Priority | Description |
|---------|----------|-------------|
| Client Registry | P0 | Name, CNPJ/CPF, contact info, address |
| Supplier Registry | P0 | Same fields as clients, can be same entity |
| Client/Supplier Toggle | P0 | Entity can be both client AND supplier |
| Company Documents | P1 | Upload and organize documents (contracts, CNPJ, etc.) |
| Document Categories | P1 | Contrato Social, Alterações, CNPJ, Contratos de Cliente |
| Document Expiration Alerts | P2 | Notify when documents need renewal |

**Not in MVP:**
- ❌ Automatic Receita Federal lookup (future enhancement)

---

### Phase 1: Financial MVP

**Financial App** - First paid module

| Feature | Priority | Description |
|---------|----------|-------------|
| Accounts Payable | P0 | Register bills, due dates, suppliers, categories |
| Accounts Receivable | P0 | Register expected income, due dates, clients |
| Mark as Paid/Received | P0 | Simple status update with date |
| Cash Flow View | P0 | Timeline view of expected in/out |
| Basic Dashboard | P0 | Total payable, total receivable, balance |
| Overdue Alerts | P1 | Highlight overdue items |
| Categories/Tags | P1 | Organize transactions |

**Not in Phase 1:**
- ❌ DRE (Phase 2)
- ❌ Quotes (Phase 2)
- ❌ Invoicing/Faturamento (Phase 2)
- ❌ Expense reduction suggestions (Phase 2)
- ❌ Cash health score (Phase 2)

---

### Phase 2: Financial Complete

| Feature | Priority | Description |
|---------|----------|-------------|
| Simplified DRE | P0 | Revenue - Costs - Expenses = Result |
| Quotes/Budgets | P0 | Create quotes, track status (pending/approved/rejected) |
| Quote to Receivable | P0 | Convert approved quote to accounts receivable |
| Invoice Generation | P1 | Generate PDF invoice from receivable |
| Cash Health Dashboard | P1 | Visual indicators of financial health |
| Expense Suggestions | P2 | AI-powered suggestions to reduce costs |
| Upcoming Due Dates | P1 | Next 7/15/30 days view |
| Long Overdue Highlight | P1 | Items overdue > 30/60/90 days |

---

### Phase 3: Inventory

**Inventory App**

| Feature | Priority | Description |
|---------|----------|-------------|
| Product Registry | P0 | Name, SKU, cost price, sale price |
| Service Catalog | P0 | Name, description, fixed/average price |
| Purchase Registration | P0 | Manual entry of purchases |
| Sale Registration | P0 | Manual entry of sales |
| Stock Balance | P0 | Current quantity per product |
| CMV Calculation | P1 | Cost of Goods Sold |
| CSP Calculation | P1 | Cost of Services Provided |
| Low Stock Alerts | P2 | Notify when below minimum |

**Integration with Financial (when both enabled):**
- Products/Services available in Quotes
- Sales can auto-generate Receivables
- Purchases can auto-generate Payables

---

### Phase 4: HR

**HR App**

| Feature | Priority | Description |
|---------|----------|-------------|
| Employee Registry | P0 | Name, CPF, role, department, salary, hire date |
| Salary Advance Control | P0 | Register advances, track balance |
| Employee Loans | P0 | Register loans, payment schedule |
| Transportation Voucher | P1 | Monthly control of VT |
| EPI Registry | P1 | Equipment assigned to employee |
| EPI Replacement Alert | P1 | Based on assignment date + validity period |
| Employee Documents | P2 | Store employee documents |

**Not in MVP:**
- ❌ Payroll generation
- ❌ Time tracking
- ❌ Vacation management

---

## MVP Timeline Estimate

| Phase | Duration | Deliverable |
|-------|----------|-------------|
| Phase 0 | 2-3 weeks | Admin App (Core) |
| Phase 1 | 3-4 weeks | Financial MVP |
| Phase 2 | 3-4 weeks | Financial Complete |
| Phase 3 | 3-4 weeks | Inventory |
| Phase 4 | 2-3 weeks | HR |

**Total MVP (all phases):** ~14-18 weeks

**Go-to-market (Phase 0 + 1):** ~5-7 weeks

---

## Success Metrics

### Phase 1 Success (Go-to-Market)
- [ ] User can register clients and suppliers
- [ ] User can upload company documents
- [ ] User can register payables and receivables
- [ ] User can see cash flow projection
- [ ] User can see basic financial dashboard

### Full MVP Success
- [ ] All 4 Apps functional
- [ ] Apps integrate when multiple are enabled
- [ ] Subscription management working
- [ ] At least 3 paying customers

---

## Technical MVP Requirements

1. **Multi-tenant architecture** from day 1
2. **App subscription system** from day 1
3. **Role-based access control** (Admin, User, Viewer)
4. **Mobile-responsive** (business owners check on phone)
5. **Offline-capable** for basic viewing (PWA)
