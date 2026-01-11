# Inventory App

> **Type:** Paid App
> **Dependencies:** Admin (Core)
> **Optional Integrations:** Financial (costs feed into DRE, sales generate receivables)

## Overview

The Inventory App manages products, services, stock movements, and provides cost calculations (CMV/CSP) for businesses that sell goods or provide services.

## Features

### 1. Product Catalog

Registry of all products the company buys and sells.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| sku | string | ✅ | Unique product code |
| name | string | ✅ | Product name |
| description | string | ❌ | Detailed description |
| category | string | ❌ | Product category |
| brand | string | ❌ | Brand name |
| costPrice | number | ✅ | Purchase cost |
| salePrice | number | ✅ | Selling price |
| markup | number | auto | % markup calculated |
| currentStock | number | auto | Current quantity |
| minimumStock | number | ❌ | Alert threshold |
| unit | string | ✅ | Unit of measure |
| defaultSupplierId | reference | ❌ | Preferred supplier |
| isActive | boolean | ✅ | Available for use |

#### Units of Measure

| Code | Description |
|------|-------------|
| UN | Unidade (Unit) |
| KG | Quilograma |
| G | Grama |
| LT | Litro |
| ML | Mililitro |
| MT | Metro |
| M2 | Metro Quadrado |
| M3 | Metro Cúbico |
| CX | Caixa |
| PC | Pacote |
| DZ | Dúzia |

#### User Stories

```
As a user, I want to:
- Register a new product with cost and sale prices
- See the automatic markup calculation
- Assign products to categories
- Set minimum stock levels for alerts
- Link a product to its default supplier
- Search products by name, SKU, or category
- See current stock level for each product
- Deactivate products no longer sold
```

---

### 2. Service Catalog

Registry of all services the company provides.

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Service name |
| description | string | ❌ | Detailed description |
| category | string | ❌ | Service category |
| priceType | enum | ✅ | fixed, average, hourly |
| price | number | ✅ | Base price |
| estimatedHours | number | ❌ | For hourly services |
| isActive | boolean | ✅ | Available for use |

#### Price Types

| Type | Use Case |
|------|----------|
| fixed | Same price every time (e.g., "Website Setup - R$ 2.000") |
| average | Varies but has typical price (e.g., "Consulting - ~R$ 150/h") |
| hourly | Charged by hour (e.g., "Development - R$ 120/h") |

#### User Stories

```
As a user, I want to:
- Register services my company offers
- Set fixed or variable pricing
- Categorize services
- Use services in quotes (Financial App)
- Track revenue by service type
```

---

### 3. Stock Movements

Track all inventory changes.

#### Movement Types

| Type | Effect | Description |
|------|--------|-------------|
| purchase | + stock | Buying from supplier |
| sale | - stock | Selling to customer |
| adjustment | +/- | Manual correction |
| return | +/- | Customer or supplier return |

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| productId | reference | ✅ | Which product |
| type | enum | ✅ | Movement type |
| quantity | number | ✅ | How many (+ or -) |
| unitCost | number | ✅ | Cost per unit |
| totalCost | number | auto | quantity × unitCost |
| date | date | ✅ | When it happened |
| entityId | reference | ❌ | Supplier or Client |
| transactionId | reference | ❌ | Linked financial transaction |
| notes | string | ❌ | Additional info |
| balanceAfter | number | auto | Stock after movement |

#### User Stories

```
As a user, I want to:
- Register a purchase (increase stock)
- Register a sale (decrease stock)
- Make inventory adjustments
- See movement history for a product
- Filter movements by type, date, supplier
- Link movements to financial transactions
```

---

### 4. Stock Dashboard

Overview of inventory status.

#### Widgets

| Widget | Description |
|--------|-------------|
| Total Products | Count of active products |
| Total Stock Value | Sum of (stock × cost) for all products |
| Low Stock Alerts | Products below minimum |
| Top Sellers | Best selling products (by quantity) |
| Top Revenue | Best selling products (by value) |
| Recent Movements | Latest stock changes |
| Stock by Category | Breakdown by product category |

---

### 5. CMV Calculation (Custo das Mercadorias Vendidas)

Cost of Goods Sold calculation for commerce businesses.

#### Formula

```
CMV = Estoque Inicial + Compras - Estoque Final

Where:
- Estoque Inicial = Stock value at period start
- Compras = Sum of all purchases in period
- Estoque Final = Stock value at period end
```

#### Report Output

```
CMV Report - January 2025
─────────────────────────────────
Estoque Inicial (01/01):    R$ 50.000,00
(+) Compras:                R$ 30.000,00
(-) Estoque Final (31/01):  R$ 45.000,00
─────────────────────────────────
CMV:                        R$ 35.000,00
```

#### User Stories

```
As a user, I want to:
- Generate CMV report for any period
- See CMV breakdown by product category
- Compare CMV across periods
- Use CMV data in DRE (Financial App)
```

---

### 6. CSP Calculation (Custo dos Serviços Prestados)

Cost of Services Provided calculation.

#### Components

For service businesses, CSP includes:
- Direct labor costs
- Materials used
- Third-party services
- Other direct costs

#### Simple Approach (MVP)

```
CSP = Sum of costs directly linked to service delivery

Tracked via:
- Service-linked expenses in Financial App
- Manual cost allocation per service
```

#### User Stories

```
As a user, I want to:
- Track costs associated with service delivery
- Generate CSP report for any period
- See profitability per service type
- Use CSP data in DRE (Financial App)
```

---

## Integration with Financial App

When both Inventory and Financial are enabled:

### Quotes Enhancement
- Select products from catalog (with prices)
- Select services from catalog (with prices)
- Stock availability shown
- Auto-calculate totals

### Automatic Transactions
- Purchase → Can create Payable
- Sale → Can create Receivable
- User chooses whether to auto-create

### DRE Integration
- CMV feeds into DRE cost section
- CSP feeds into DRE cost section
- Product revenue categorized automatically

---

## API Endpoints

### Products

```typescript
// Queries
products.list({ organizationId, filters?, pagination? })
products.get({ id })
products.search({ organizationId, query })
products.getLowStock({ organizationId })

// Mutations
products.create({ organizationId, data })
products.update({ id, data })
products.adjustStock({ id, quantity, reason })
products.toggleActive({ id })
```

### Services

```typescript
// Queries
services.list({ organizationId, filters?, pagination? })
services.get({ id })
services.search({ organizationId, query })

// Mutations
services.create({ organizationId, data })
services.update({ id, data })
services.toggleActive({ id })
```

### Stock Movements

```typescript
// Queries
movements.list({ organizationId, productId?, type?, dateRange?, pagination? })
movements.get({ id })
movements.getByProduct({ productId })

// Mutations
movements.create({ organizationId, data })
movements.update({ id, data })  // Only for adjustments
movements.delete({ id })  // Only for adjustments
```

### Reports

```typescript
// Queries
reports.getCMV({ organizationId, startDate, endDate })
reports.getCSP({ organizationId, startDate, endDate })
reports.getStockValuation({ organizationId, date? })
reports.getTopProducts({ organizationId, period, metric })
```

---

## Permissions

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View products | ✅ | ✅ | ✅ | ✅ |
| Create product | ✅ | ✅ | ✅ | ❌ |
| Edit product | ✅ | ✅ | ✅ | ❌ |
| Delete product | ✅ | ✅ | ❌ | ❌ |
| View movements | ✅ | ✅ | ✅ | ✅ |
| Create movement | ✅ | ✅ | ✅ | ❌ |
| Edit adjustment | ✅ | ✅ | ❌ | ❌ |
| View reports | ✅ | ✅ | ✅ | ✅ |

---

## Future Enhancements

- [ ] Barcode/QR code scanning
- [ ] Multi-location inventory
- [ ] Batch/lot tracking
- [ ] Expiration date tracking
- [ ] NFe import for automatic purchase entry
- [ ] Automatic reorder suggestions
- [ ] Inventory forecasting
- [ ] Product images
- [ ] Product variants (size, color)
- [ ] Composite products (kits)
- [ ] Cost averaging methods (FIFO, weighted average)
