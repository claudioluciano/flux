# Flux Documentation

Flux is a modular business management SaaS platform targeting the Brazilian market. Users subscribe only to the apps they need, with Core Apps always enabled as dependencies for other modules.

## Philosophy

- **Modular by design:** Each business function is a separate App
- **Pay for what you need:** Individual pricing per App
- **Core foundation:** Some Apps are always enabled (Admin) as other Apps depend on them
- **Internal integrations:** Apps enhance each other when both are enabled

## Documentation Structure

```
docs/
├── README.md                 # This file
├── specs/
│   ├── ARCHITECTURE.md       # System architecture & app dependency model
│   ├── MVP.md                # MVP definition and roadmap
│   └── DATA_MODEL.md         # Core entities and relationships
└── apps/
    ├── admin.md              # Admin (Core App) - Registry & Documents
    ├── financial.md          # Financial App
    ├── inventory.md          # Inventory App
    └── hr.md                 # HR App
```

## Apps Overview

| App | Type | Description |
|-----|------|-------------|
| **Admin** | Core (required) | Clients, Suppliers, Company Documents |
| **Financial** | Paid | Accounts payable/receivable, Cash flow, DRE, Quotes, Invoicing |
| **Inventory** | Paid | Purchases, Sales, CMV/CSP calculation, Service Catalog |
| **HR** | Paid | Employee management, Advances, Loans, Benefits, EPIs |

## Target Market

Small and medium Brazilian businesses that need:
- Centralized client/supplier management
- Financial visibility and control
- Basic inventory tracking
- Employee information management

The system is designed for business owners and managers, not accountants (simplified DRE, no payroll generation).
