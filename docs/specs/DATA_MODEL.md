# Flux Data Model

## Core Entities

### Organization (Tenant)

The root entity. All data belongs to an organization.

```typescript
Organization {
  id: Id
  name: string
  cnpj: string
  createdAt: Date
  
  // Subscription
  plan: 'free' | 'starter' | 'business' | 'enterprise'
  apps: AppId[]  // ['admin', 'financial', 'inventory', 'hr']
  
  // Settings
  settings: {
    currency: 'BRL'
    timezone: 'America/Sao_Paulo'
    fiscalYearStart: number  // Month (1-12)
  }
}
```

### User

```typescript
User {
  id: Id
  organizationId: Id<Organization>
  
  name: string
  email: string
  role: 'owner' | 'admin' | 'member' | 'viewer'
  
  // Permissions per App
  appPermissions: {
    [appId: string]: 'full' | 'read' | 'none'
  }
  
  createdAt: Date
  lastLoginAt: Date
}
```

---

## Admin App Entities

### Entity (Client/Supplier)

A single table for both clients and suppliers. An entity can be both.

```typescript
Entity {
  id: Id
  organizationId: Id<Organization>
  
  // Type flags
  isClient: boolean
  isSupplier: boolean
  
  // Identification
  type: 'company' | 'individual'
  name: string
  tradeName?: string  // Nome fantasia
  document: string    // CNPJ or CPF
  
  // Contact
  email?: string
  phone?: string
  website?: string
  
  // Address
  address?: {
    street: string
    number: string
    complement?: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  
  // Business info
  stateRegistration?: string  // Inscrição Estadual
  municipalRegistration?: string  // Inscrição Municipal
  
  notes?: string
  tags: string[]
  
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Document

Company documents storage.

```typescript
Document {
  id: Id
  organizationId: Id<Organization>
  
  // Classification
  category: 'contrato_social' | 'alteracao_social' | 'cnpj' | 
            'contrato_cliente' | 'alvara' | 'certidao' | 'other'
  
  // If linked to a client
  entityId?: Id<Entity>
  
  name: string
  description?: string
  
  // File
  fileId: Id<File>  // Convex file storage
  fileName: string
  fileType: string
  fileSize: number
  
  // Validity
  issueDate?: Date
  expirationDate?: Date
  
  tags: string[]
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Financial App Entities

### Account

Chart of accounts for categorization.

```typescript
Account {
  id: Id
  organizationId: Id<Organization>
  
  code: string       // e.g., "1.1.01"
  name: string       // e.g., "Receita de Vendas"
  type: 'revenue' | 'expense' | 'asset' | 'liability'
  
  parentId?: Id<Account>
  
  isSystem: boolean  // Pre-created accounts
  isActive: boolean
  
  createdAt: Date
}
```

### Transaction

Both payables and receivables in one table.

```typescript
Transaction {
  id: Id
  organizationId: Id<Organization>
  
  // Type
  type: 'payable' | 'receivable'
  
  // Linked entities
  entityId?: Id<Entity>      // Client or Supplier
  accountId?: Id<Account>    // Category
  quoteId?: Id<Quote>        // If generated from quote
  
  // Details
  description: string
  notes?: string
  
  // Values
  amount: number           // Gross amount
  discount?: number
  interest?: number
  netAmount: number        // Final amount
  
  // Dates
  issueDate: Date          // When created
  dueDate: Date            // When due
  
  // Payment
  status: 'pending' | 'partial' | 'paid' | 'overdue' | 'cancelled'
  paidAmount: number
  paidAt?: Date
  paymentMethod?: 'cash' | 'pix' | 'transfer' | 'credit_card' | 
                  'debit_card' | 'boleto' | 'check' | 'other'
  
  // Recurrence
  isRecurring: boolean
  recurrence?: {
    frequency: 'weekly' | 'monthly' | 'yearly'
    endDate?: Date
    parentId?: Id<Transaction>  // Original transaction
  }
  
  // Attachments
  attachments: Id<File>[]
  
  tags: string[]
  
  createdAt: Date
  updatedAt: Date
}
```

### Quote

Budgets/Orçamentos.

```typescript
Quote {
  id: Id
  organizationId: Id<Organization>
  
  // Identification
  number: string           // Quote number (ORÇ-0001)
  
  // Client
  entityId: Id<Entity>
  
  // Status workflow
  status: 'draft' | 'sent' | 'approved' | 'rejected' | 'expired' | 'converted'
  
  // Dates
  issueDate: Date
  validUntil: Date
  approvedAt?: Date
  
  // Items
  items: QuoteItem[]
  
  // Totals
  subtotal: number
  discount?: number
  discountType?: 'percentage' | 'fixed'
  total: number
  
  // Notes
  notes?: string
  terms?: string
  
  // Conversion
  convertedToTransactionId?: Id<Transaction>
  
  createdAt: Date
  updatedAt: Date
}

QuoteItem {
  id: string
  
  // Can be product, service, or manual
  type: 'product' | 'service' | 'manual'
  productId?: Id<Product>    // If Inventory enabled
  serviceId?: Id<Service>    // If Inventory enabled
  
  description: string
  quantity: number
  unitPrice: number
  discount?: number
  total: number
}
```

---

## Inventory App Entities

### Product

```typescript
Product {
  id: Id
  organizationId: Id<Organization>
  
  // Identification
  sku: string
  name: string
  description?: string
  
  // Categorization
  category?: string
  brand?: string
  
  // Pricing
  costPrice: number      // Preço de custo
  salePrice: number      // Preço de venda
  markup?: number        // Percentage
  
  // Stock
  currentStock: number
  minimumStock?: number
  unit: string           // 'un', 'kg', 'lt', 'mt', etc.
  
  // Supplier
  defaultSupplierId?: Id<Entity>
  
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

### Service

```typescript
Service {
  id: Id
  organizationId: Id<Organization>
  
  name: string
  description?: string
  category?: string
  
  // Pricing
  priceType: 'fixed' | 'average' | 'hourly'
  price: number
  
  // For hourly services
  estimatedHours?: number
  
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

### StockMovement

```typescript
StockMovement {
  id: Id
  organizationId: Id<Organization>
  
  productId: Id<Product>
  
  type: 'purchase' | 'sale' | 'adjustment' | 'return'
  
  // Linked entities
  entityId?: Id<Entity>           // Supplier (purchase) or Client (sale)
  transactionId?: Id<Transaction> // If linked to financial
  
  quantity: number                // Positive or negative
  unitCost: number
  totalCost: number
  
  date: Date
  notes?: string
  
  // Stock balance after movement
  balanceAfter: number
  
  createdAt: Date
}
```

---

## HR App Entities

### Employee

```typescript
Employee {
  id: Id
  organizationId: Id<Organization>
  
  // Personal info
  name: string
  cpf: string
  rg?: string
  birthDate?: Date
  
  // Contact
  email?: string
  phone?: string
  address?: Address
  
  // Employment
  role: string              // Função
  department?: string
  hireDate: Date
  terminationDate?: Date
  
  // Compensation
  salary: number
  salaryType: 'monthly' | 'hourly'
  paymentMethod?: 'transfer' | 'pix' | 'cash'
  bankInfo?: {
    bank: string
    agency: string
    account: string
    accountType: 'checking' | 'savings'
    pixKey?: string
  }
  
  // Status
  status: 'active' | 'vacation' | 'leave' | 'terminated'
  
  // Documents
  documents: Id<File>[]
  
  notes?: string
  
  createdAt: Date
  updatedAt: Date
}
```

### EmployeeControl

Controls for advances, loans, benefits.

```typescript
EmployeeControl {
  id: Id
  organizationId: Id<Organization>
  employeeId: Id<Employee>
  
  type: 'advance' | 'loan' | 'transport_voucher' | 'meal_voucher' | 'other'
  
  description: string
  
  // Values
  amount: number
  
  // For loans: installment tracking
  isInstallment: boolean
  totalInstallments?: number
  currentInstallment?: number
  
  // Dates
  date: Date
  dueDate?: Date
  
  // Status
  status: 'pending' | 'paid' | 'discounted' | 'cancelled'
  
  notes?: string
  
  createdAt: Date
}
```

### EmployeeEPI

Safety equipment tracking.

```typescript
EmployeeEPI {
  id: Id
  organizationId: Id<Organization>
  employeeId: Id<Employee>
  
  // Equipment
  name: string              // e.g., "Capacete de Segurança"
  description?: string
  category?: string         // e.g., "Proteção da Cabeça"
  
  // Assignment
  assignedAt: Date
  quantity: number
  
  // Validity
  validityDays: number      // How long the EPI is valid
  expiresAt: Date           // Calculated: assignedAt + validityDays
  
  // Replacement
  replacedAt?: Date
  replacementReason?: 'expired' | 'damaged' | 'lost' | 'other'
  
  status: 'active' | 'replaced' | 'returned'
  
  notes?: string
  
  createdAt: Date
}
```

---

## Indexes (for Convex)

```typescript
// Entity indexes
entities: {
  by_organization: ['organizationId'],
  by_organization_type: ['organizationId', 'isClient', 'isSupplier'],
  by_document: ['organizationId', 'document'],
}

// Transaction indexes
transactions: {
  by_organization: ['organizationId'],
  by_organization_type: ['organizationId', 'type'],
  by_organization_status: ['organizationId', 'status'],
  by_organization_dueDate: ['organizationId', 'dueDate'],
  by_entity: ['organizationId', 'entityId'],
}

// Product indexes
products: {
  by_organization: ['organizationId'],
  by_sku: ['organizationId', 'sku'],
}

// Employee indexes
employees: {
  by_organization: ['organizationId'],
  by_cpf: ['organizationId', 'cpf'],
  by_status: ['organizationId', 'status'],
}
```
