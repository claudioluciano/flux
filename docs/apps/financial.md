# Financial App

> **Type:** Paid App
> **Dependencies:** Admin (Core)
> **Optional Integrations:** Inventory (enhanced quotes)

## Overview

The Financial App provides complete financial management for small businesses: accounts payable/receivable, cash flow visualization, income statements (DRE), quotes, and invoicing.

## Features

### 1. Accounts Payable (Contas a Pagar)

Track all bills and expenses.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | ✅ | What is this payment for |
| amount | number | ✅ | Total amount |
| dueDate | date | ✅ | When it's due |
| supplierId | reference | ❌ | Link to supplier (Admin App) |
| accountId | reference | ❌ | Expense category |
| status | enum | ✅ | pending, paid, overdue, cancelled |
| paidAt | date | ❌ | When it was paid |
| paymentMethod | enum | ❌ | How it was paid |
| isRecurring | boolean | ❌ | Repeats monthly/weekly |
| notes | string | ❌ | Additional info |
| attachments | file[] | ❌ | Invoices, receipts |

#### User Stories

```
As a user, I want to:
- Register a new bill to pay
- Set the due date and amount
- Link a bill to a supplier
- Categorize the expense
- Mark a bill as paid
- See all overdue bills
- Create recurring bills (rent, utilities)
- Attach invoice/receipt files
```

---

### 2. Accounts Receivable (Contas a Receber)

Track all expected income.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| description | string | ✅ | What is this income for |
| amount | number | ✅ | Total amount |
| dueDate | date | ✅ | When expected |
| clientId | reference | ❌ | Link to client (Admin App) |
| accountId | reference | ❌ | Revenue category |
| quoteId | reference | ❌ | If from approved quote |
| status | enum | ✅ | pending, received, overdue, cancelled |
| receivedAt | date | ❌ | When received |
| paymentMethod | enum | ❌ | How it was received |
| notes | string | ❌ | Additional info |

#### User Stories

```
As a user, I want to:
- Register expected income
- Link income to a client
- Categorize the revenue
- Mark as received when paid
- See all overdue receivables
- Track partial payments
- Convert quotes to receivables
```

---

### 3. Cash Flow (Fluxo de Caixa)

Visualize money in and out over time.

#### Views

1. **Timeline View**
   - Calendar-style view showing daily in/out
   - Color coded: green (income), red (expenses)
   - Running balance line

2. **List View**
   - Chronological list of all transactions
   - Filter by type, status, date range
   - Group by day/week/month

3. **Projection View**
   - Future cash position based on pending items
   - "What if" scenarios

#### Key Metrics

- **Current Balance:** Sum of all completed transactions
- **Projected Balance:** Current + pending (by date)
- **Total Receivable:** All pending receivables
- **Total Payable:** All pending payables
- **Net Position:** Receivable - Payable

---

### 4. Dashboard

Intuitive overview of financial health.

#### Widgets

| Widget | Description | Priority |
|--------|-------------|----------|
| Balance Summary | Current, Projected, Receivable, Payable | P0 |
| Cash Health | Visual indicator (good/warning/critical) | P1 |
| Overdue Items | Count and total of overdue transactions | P0 |
| Upcoming Week | Next 7 days of due dates | P1 |
| Monthly Comparison | This month vs last month | P1 |
| Top Expenses | Biggest expense categories | P2 |
| Top Clients | Clients with most revenue | P2 |
| Expense Suggestions | AI-powered savings tips | P2 |

#### Cash Health Calculation

```
Health Score = (Receivable + Current Balance) / Payable

> 2.0  = Excellent (green)
> 1.5  = Good (light green)
> 1.0  = Warning (yellow)
> 0.5  = Critical (orange)
< 0.5  = Danger (red)
```

---

### 5. DRE (Demonstração do Resultado do Exercício)

Simplified income statement for business owners.

#### Structure

```
RECEITA BRUTA (Gross Revenue)
  + Vendas de Produtos
  + Prestação de Serviços
  + Outras Receitas

(-) DEDUÇÕES
  - Devoluções
  - Descontos
  
= RECEITA LÍQUIDA (Net Revenue)

(-) CUSTOS
  - CMV (Custo das Mercadorias Vendidas)
  - CSP (Custo dos Serviços Prestados)
  
= LUCRO BRUTO (Gross Profit)

(-) DESPESAS OPERACIONAIS
  - Despesas Administrativas
  - Despesas com Pessoal
  - Despesas Comerciais
  - Outras Despesas

= RESULTADO OPERACIONAL (Operating Result)

(+/-) RESULTADO FINANCEIRO
  + Receitas Financeiras
  - Despesas Financeiras

= RESULTADO LÍQUIDO (Net Result)
```

#### Filters
- Period: Month, Quarter, Year, Custom
- Compare: vs Previous Period, vs Same Period Last Year

---

### 6. Quotes (Orçamentos)

Create and manage quotes/budgets.

#### Quote Status Flow

```
Draft → Sent → Approved → Converted to Receivable
              ↘ Rejected
              ↘ Expired
```

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| number | string | auto | Quote number (ORÇ-0001) |
| clientId | reference | ✅ | Who is this for |
| validUntil | date | ✅ | Expiration date |
| items | array | ✅ | Line items |
| subtotal | number | auto | Sum of items |
| discount | number | ❌ | Total discount |
| total | number | auto | Final amount |
| notes | string | ❌ | Notes for client |
| terms | string | ❌ | Terms and conditions |

#### Quote Items

| Field | Type | Description |
|-------|------|-------------|
| type | enum | 'product', 'service', 'manual' |
| productId | reference | If type=product (requires Inventory) |
| serviceId | reference | If type=service (requires Inventory) |
| description | string | Item description |
| quantity | number | Quantity |
| unitPrice | number | Price per unit |
| discount | number | Line discount |
| total | number | Line total |

#### Integration with Inventory

When Inventory App is enabled:
- Products can be selected from Product catalog
- Services can be selected from Service catalog
- Prices auto-fill from catalog
- Stock availability shown for products

Without Inventory:
- Manual entry only
- No product/service linking

#### User Stories

```
As a user, I want to:
- Create a quote for a client
- Add products/services from my catalog (if Inventory enabled)
- Add manual line items
- Apply discounts (per item or total)
- Set an expiration date
- Send quote as PDF
- Track quote status
- Convert approved quote to receivable
- Duplicate a quote
```

---

### 7. Invoicing (Faturamento)

Generate internal invoices for receivables.

> Note: This is NOT NFe/NFSe integration. It generates internal PDF invoices only.

#### Invoice Generation

From a receivable, user can:
1. Generate PDF invoice
2. Customize with company logo/header
3. Download or send via email

#### Invoice Template

```
┌────────────────────────────────────────┐
│ [Company Logo]                         │
│ Company Name                           │
│ CNPJ: XX.XXX.XXX/XXXX-XX              │
│ Address                                │
├────────────────────────────────────────┤
│ FATURA #FAT-0001                       │
│ Data: DD/MM/YYYY                       │
├────────────────────────────────────────┤
│ Cliente:                               │
│ Name / CNPJ / Address                  │
├────────────────────────────────────────┤
│ Descrição              Qtd   Valor     │
│ ─────────────────────────────────────  │
│ Item 1                  1    R$ X,XX   │
│ Item 2                  2    R$ X,XX   │
├────────────────────────────────────────┤
│                     Subtotal: R$ X,XX  │
│                     Desconto: R$ X,XX  │
│                        TOTAL: R$ X,XX  │
├────────────────────────────────────────┤
│ Observações:                           │
│ Payment instructions, etc.             │
└────────────────────────────────────────┘
```

---

## API Endpoints

### Transactions

```typescript
// Queries
transactions.list({ organizationId, type?, status?, dateRange?, pagination? })
transactions.get({ id })
transactions.getByEntity({ entityId })
transactions.getOverdue({ organizationId })
transactions.getCashFlow({ organizationId, startDate, endDate })
transactions.getDRE({ organizationId, period })

// Mutations
transactions.create({ organizationId, data })
transactions.update({ id, data })
transactions.markAsPaid({ id, paidAt, paymentMethod })
transactions.cancel({ id, reason })
transactions.delete({ id })
```

### Quotes

```typescript
// Queries
quotes.list({ organizationId, status?, pagination? })
quotes.get({ id })
quotes.getByClient({ clientId })

// Mutations
quotes.create({ organizationId, data })
quotes.update({ id, data })
quotes.updateStatus({ id, status })
quotes.convertToReceivable({ id })
quotes.duplicate({ id })
quotes.generatePDF({ id })
```

### Accounts

```typescript
// Queries
accounts.list({ organizationId })
accounts.get({ id })

// Mutations
accounts.create({ organizationId, data })
accounts.update({ id, data })
accounts.delete({ id })
```

---

## Permissions

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View transactions | ✅ | ✅ | ✅ | ✅ |
| Create transaction | ✅ | ✅ | ✅ | ❌ |
| Edit transaction | ✅ | ✅ | ✅ | ❌ |
| Delete transaction | ✅ | ✅ | ❌ | ❌ |
| View reports (DRE) | ✅ | ✅ | ✅ | ✅ |
| Manage quotes | ✅ | ✅ | ✅ | ❌ |
| Manage accounts | ✅ | ✅ | ❌ | ❌ |

---

## Future Enhancements

- [ ] Bank account integration (Open Finance)
- [ ] Automatic bank reconciliation
- [ ] NFe/NFSe integration
- [ ] Boleto generation
- [ ] PIX QR code generation
- [ ] Multi-currency support
- [ ] Budget planning
- [ ] Financial goals
- [ ] AI-powered cash flow predictions
- [ ] Automatic expense categorization
