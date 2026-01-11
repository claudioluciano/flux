# Flux Architecture

## App-Based Architecture

Flux follows a modular architecture where each business function is encapsulated in an **App**. Users subscribe to individual Apps based on their needs.

### App Types

1. **Core Apps** - Always enabled, required for the system to function
2. **Paid Apps** - Optional modules with individual subscriptions

### App Dependency Model

```
┌─────────────────────────────────────────────────────────┐
│                        ADMIN (Core)                      │
│         Clients · Suppliers · Company Documents          │
└─────────────────────────┬───────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          │               │               │
          ▼               ▼               ▼
    ┌───────────┐   ┌───────────┐   ┌───────────┐
    │ FINANCIAL │   │ INVENTORY │   │    HR     │
    │           │   │           │   │           │
    │ Payables  │   │ Purchases │   │ Employees │
    │ Receivabl │◄──│ Sales     │   │ Advances  │
    │ Cash Flow │   │ CMV/CSP   │   │ Loans     │
    │ DRE       │   │ Services  │   │ EPIs      │
    │ Quotes    │──►│ Catalog   │   │           │
    │ Invoicing │   │           │   │           │
    └───────────┘   └───────────┘   └───────────┘
```

### App Dependencies

| App | Depends On | Optional Integrations |
|-----|------------|----------------------|
| Admin | - | - |
| Financial | Admin | Inventory (enhanced quotes) |
| Inventory | Admin | Financial (costs/revenue) |
| HR | Admin | Financial (salary costs) |

### Internal Integrations

When multiple Apps are enabled, they enhance each other:

| Apps Enabled | Integration Benefit |
|--------------|---------------------|
| Financial + Inventory | Quotes can pull products/services with pricing; Sales feed into receivables |
| Financial + HR | Salary costs appear in cash flow projections |
| Inventory + Financial | CMV/CSP calculations can feed into DRE |

## Multi-Tenancy

Each organization (tenant) has:
- Isolated data
- Individual App subscriptions
- Separate user management

## Tech Stack (Proposed)

- **Frontend:** Next.js (App Router)
- **Backend:** Convex (real-time database + functions)
- **Auth:** Convex Auth or Clerk
- **Payments:** Stripe (subscription management)
- **File Storage:** Convex File Storage (for documents)

## Data Isolation

```
Organization (Tenant)
├── Users (with roles)
├── App Subscriptions
├── Admin Data
│   ├── Clients
│   ├── Suppliers
│   └── Documents
├── Financial Data (if subscribed)
│   ├── Accounts
│   ├── Transactions
│   └── Quotes
├── Inventory Data (if subscribed)
│   ├── Products
│   ├── Services
│   └── Movements
└── HR Data (if subscribed)
    ├── Employees
    └── Benefits/Controls
```

## Feature Flags & App Access

The system uses feature flags to control App access:

```typescript
// Example: Checking app access
const hasFinancial = organization.apps.includes('financial');
const hasInventory = organization.apps.includes('inventory');

// Enhanced quotes (when both Financial + Inventory are enabled)
const canUseEnhancedQuotes = hasFinancial && hasInventory;
```

## API Structure

Each App exposes its own set of functions/endpoints:

```
/api
├── /admin          # Always available
│   ├── /clients
│   ├── /suppliers
│   └── /documents
├── /financial      # Requires Financial subscription
│   ├── /accounts
│   ├── /transactions
│   ├── /quotes
│   └── /reports
├── /inventory      # Requires Inventory subscription
│   ├── /products
│   ├── /services
│   └── /movements
└── /hr             # Requires HR subscription
    ├── /employees
    └── /controls
```
