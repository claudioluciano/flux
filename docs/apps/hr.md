# HR App

> **Type:** Paid App
> **Dependencies:** Admin (Core)
> **Optional Integrations:** Financial (salary costs in cash flow)

## Overview

The HR App manages employee information, salary advances, loans, benefits, and safety equipment (EPIs). It's designed for information control, not payroll generation—data is organized for the accountant.

## Features

### 1. Employee Registry

Complete employee database.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Full name |
| cpf | string | ✅ | CPF number |
| rg | string | ❌ | RG number |
| birthDate | date | ❌ | Date of birth |
| email | string | ❌ | Contact email |
| phone | string | ❌ | Contact phone |
| address | object | ❌ | Full address |
| role | string | ✅ | Job title/function |
| department | string | ❌ | Department |
| hireDate | date | ✅ | When hired |
| terminationDate | date | ❌ | If terminated |
| salary | number | ✅ | Monthly salary |
| salaryType | enum | ✅ | monthly, hourly |
| paymentMethod | enum | ❌ | transfer, pix, cash |
| bankInfo | object | ❌ | Bank account details |
| status | enum | ✅ | active, vacation, leave, terminated |
| documents | file[] | ❌ | Employee documents |
| notes | string | ❌ | Internal notes |

#### Bank Information

```typescript
bankInfo: {
  bank: string        // Bank name
  agency: string      // Agency number
  account: string     // Account number
  accountType: 'checking' | 'savings'
  pixKey?: string     // PIX key
}
```

#### User Stories

```
As a user, I want to:
- Register a new employee with all their information
- Track employee hire dates and roles
- Store bank information for payments
- Upload employee documents (contracts, IDs)
- Mark employees as on vacation or leave
- Terminate employees and keep records
- Search employees by name, CPF, or role
- See all employees by department
```

---

### 2. Salary Advances (Adiantamento Salarial)

Track salary advances given to employees.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| employeeId | reference | ✅ | Which employee |
| amount | number | ✅ | Advance amount |
| date | date | ✅ | When given |
| dueDate | date | ❌ | When to discount |
| status | enum | ✅ | pending, discounted, cancelled |
| notes | string | ❌ | Reason/notes |

#### User Stories

```
As a user, I want to:
- Register a salary advance for an employee
- Track pending advances
- Mark advances as discounted from payroll
- See advance history per employee
- Generate report for accountant
```

---

### 3. Employee Loans (Empréstimos)

Track loans made to employees with installment payments.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| employeeId | reference | ✅ | Which employee |
| amount | number | ✅ | Total loan amount |
| date | date | ✅ | When given |
| totalInstallments | number | ✅ | How many payments |
| installmentAmount | number | auto | amount ÷ installments |
| paidInstallments | number | auto | How many paid |
| status | enum | ✅ | active, paid, cancelled |
| notes | string | ❌ | Reason/notes |

#### Installments View

```
Loan: R$ 1.200,00 (12x R$ 100,00)
Employee: João Silva
Started: 01/01/2025

Installment | Due Date   | Status
──────────────────────────────────
1/12        | 01/02/2025 | ✓ Paid
2/12        | 01/03/2025 | ✓ Paid
3/12        | 01/04/2025 | Pending
4/12        | 01/05/2025 | Pending
...
```

#### User Stories

```
As a user, I want to:
- Register a loan for an employee
- Define number of installments
- Track payment progress
- Mark installments as paid
- See remaining balance
- Generate report for accountant
```

---

### 4. Transportation Voucher (Vale-Transporte)

Monthly control of transportation benefits.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| employeeId | reference | ✅ | Which employee |
| month | date | ✅ | Reference month |
| workDays | number | ✅ | Days in month |
| dailyAmount | number | ✅ | VT per day |
| totalAmount | number | auto | workDays × dailyAmount |
| status | enum | ✅ | pending, provided, cancelled |

#### User Stories

```
As a user, I want to:
- Register monthly VT for each employee
- Calculate total based on work days
- Track which months have been provided
- Generate monthly VT report
```

---

### 5. EPI Control (Equipamentos de Proteção Individual)

Track safety equipment assigned to employees.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| employeeId | reference | ✅ | Which employee |
| name | string | ✅ | Equipment name |
| description | string | ❌ | Details |
| category | string | ❌ | Equipment category |
| assignedAt | date | ✅ | When given |
| quantity | number | ✅ | How many |
| validityDays | number | ✅ | Days until replacement |
| expiresAt | date | auto | assignedAt + validityDays |
| status | enum | ✅ | active, replaced, returned |
| replacedAt | date | ❌ | If replaced |
| replacementReason | enum | ❌ | expired, damaged, lost |
| notes | string | ❌ | Additional info |

#### EPI Categories

| Category | Examples |
|----------|----------|
| Proteção da Cabeça | Capacete, Touca |
| Proteção dos Olhos | Óculos, Protetor facial |
| Proteção Auditiva | Protetor auricular, Abafador |
| Proteção Respiratória | Máscara, Respirador |
| Proteção das Mãos | Luvas |
| Proteção dos Pés | Botina, Bota |
| Proteção contra Quedas | Cinto, Trava-quedas |
| Vestimentas | Avental, Macacão |

#### User Stories

```
As a user, I want to:
- Register EPI given to employee
- Set validity period for each equipment
- See alerts for EPIs expiring soon
- Record EPI replacement
- Track EPI history per employee
- Generate EPI report for compliance
```

#### Replacement Alert Dashboard

```
EPI Replacements Needed
───────────────────────────────────────────
⚠️ Expiring in 7 days:
  - João Silva: Capacete (expires 15/01)
  - Maria Santos: Luvas (expires 18/01)

🔴 Already expired:
  - Pedro Costa: Óculos (expired 05/01)
```

---

### 6. HR Dashboard

Overview of employee-related information.

#### Widgets

| Widget | Description |
|--------|-------------|
| Total Employees | Active employee count |
| By Department | Employee distribution |
| Pending Advances | Total advances to discount |
| Active Loans | Loans in progress |
| EPI Alerts | Expiring/expired EPIs |
| Recent Hires | New employees |
| Birthdays | This month's birthdays |
| Total Payroll | Sum of salaries (estimate) |

---

## Integration with Financial App

When both HR and Financial are enabled:

### Salary Cost Projection
- Employee salaries appear in cash flow projections
- Monthly payroll estimate as recurring expense
- Vacation provisions calculation

### Expense Categorization
- Advances categorized as "Adiantamento Salarial"
- VT categorized as "Vale-Transporte"
- Easy tracking of labor costs

---

## Reports for Accountant

The HR App can generate reports suitable for accountant processing:

### Monthly Reports
- Employee roster with salaries
- Advances to discount
- Loan installments to discount
- VT provided
- New hires / Terminations

### Annual Reports
- Employee history
- Total advances/loans
- EPI compliance record

---

## API Endpoints

### Employees

```typescript
// Queries
employees.list({ organizationId, status?, department?, pagination? })
employees.get({ id })
employees.search({ organizationId, query })
employees.getByDepartment({ organizationId, department })

// Mutations
employees.create({ organizationId, data })
employees.update({ id, data })
employees.terminate({ id, terminationDate, reason })
employees.reactivate({ id })
```

### Controls (Advances, Loans, VT)

```typescript
// Queries
controls.list({ organizationId, employeeId?, type?, status?, pagination? })
controls.get({ id })
controls.getByEmployee({ employeeId, type? })
controls.getPendingAdvances({ organizationId })
controls.getActiveLoans({ organizationId })

// Mutations
controls.create({ organizationId, data })
controls.update({ id, data })
controls.markAsDiscounted({ id })
controls.payLoanInstallment({ id })
controls.cancel({ id, reason })
```

### EPIs

```typescript
// Queries
epis.list({ organizationId, employeeId?, status?, pagination? })
epis.get({ id })
epis.getByEmployee({ employeeId })
epis.getExpiring({ organizationId, days })
epis.getExpired({ organizationId })

// Mutations
epis.create({ organizationId, data })
epis.update({ id, data })
epis.replace({ id, reason, newEpiData? })
epis.markAsReturned({ id })
```

---

## Permissions

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View employees | ✅ | ✅ | ✅* | ❌ |
| Create employee | ✅ | ✅ | ❌ | ❌ |
| Edit employee | ✅ | ✅ | ❌ | ❌ |
| View salaries | ✅ | ✅ | ❌ | ❌ |
| Manage advances | ✅ | ✅ | ✅ | ❌ |
| Manage loans | ✅ | ✅ | ❌ | ❌ |
| Manage EPIs | ✅ | ✅ | ✅ | ❌ |
| View reports | ✅ | ✅ | ❌ | ❌ |

*Members can see basic employee info but not salaries

---

## Future Enhancements

- [ ] Payroll generation integration
- [ ] Time tracking / Ponto
- [ ] Vacation management
- [ ] Benefits management (health, dental)
- [ ] Performance reviews
- [ ] Training records
- [ ] Organization chart
- [ ] Employee self-service portal
- [ ] eSocial integration
- [ ] Meal voucher (VR/VA) control
- [ ] Commission tracking
