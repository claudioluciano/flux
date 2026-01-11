# Admin App (Core)

> **Type:** Core App (Always Enabled)
> **Dependencies:** None
> **Depends on this:** Financial, Inventory, HR

## Overview

The Admin App is the foundation of Flux. It manages the core entities that all other Apps depend on: Clients, Suppliers, and Company Documents.

Every Flux organization has Admin enabled by default. It cannot be disabled.

## Features

### 1. Entity Registry (Clients & Suppliers)

A unified registry where each entity can be a Client, Supplier, or both.

#### Entity Types
- **Company** (Pessoa Jurídica) - Has CNPJ
- **Individual** (Pessoa Física) - Has CPF

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Legal name (Razão Social) |
| tradeName | string | ❌ | Trade name (Nome Fantasia) |
| document | string | ✅ | CNPJ or CPF |
| type | enum | ✅ | 'company' or 'individual' |
| isClient | boolean | ✅ | Can sell to this entity |
| isSupplier | boolean | ✅ | Can buy from this entity |
| email | string | ❌ | Contact email |
| phone | string | ❌ | Contact phone |
| website | string | ❌ | Website URL |
| address | object | ❌ | Full address |
| stateRegistration | string | ❌ | Inscrição Estadual |
| municipalRegistration | string | ❌ | Inscrição Municipal |
| notes | string | ❌ | Internal notes |
| tags | string[] | ❌ | Custom tags for filtering |

#### User Stories

```
As a user, I want to:
- Register a new client with their contact info
- Register a new supplier with their contact info
- Mark an entity as both client AND supplier
- Search entities by name, document, or tags
- Filter entities by type (client/supplier/both)
- Edit entity information
- Deactivate an entity (soft delete)
- See all transactions with an entity (if Financial enabled)
```

#### UI Screens

1. **Entity List**
   - Table/List view with search and filters
   - Quick filters: All | Clients | Suppliers | Both
   - Columns: Name, Document, Type, Contact, Tags, Status

2. **Entity Form** (Create/Edit)
   - Type selector (Company/Individual)
   - Document input with validation (CNPJ/CPF format)
   - Contact section
   - Address section (with CEP auto-fill - future)
   - Client/Supplier toggles
   - Tags input
   - Notes textarea

3. **Entity Detail**
   - All entity information
   - Related documents (from Documents feature)
   - Transaction history (if Financial enabled)
   - Quick actions: Edit, Deactivate

---

### 2. Company Documents

Store and organize important company documents.

#### Document Categories

| Category | Portuguese | Description |
|----------|------------|-------------|
| contrato_social | Contrato Social | Company formation document |
| alteracao_social | Alteração Social | Amendments to formation |
| cnpj | CNPJ | Federal tax registration |
| contrato_cliente | Contrato de Cliente | Client contracts |
| alvara | Alvará | Operating permits |
| certidao | Certidão | Certificates (negative debt, etc.) |
| other | Outros | Miscellaneous documents |

#### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| name | string | ✅ | Document name |
| category | enum | ✅ | Document category |
| entityId | reference | ❌ | Link to client (for contracts) |
| description | string | ❌ | Additional details |
| file | file | ✅ | Uploaded file |
| issueDate | date | ❌ | When document was issued |
| expirationDate | date | ❌ | When document expires |
| tags | string[] | ❌ | Custom tags |

#### User Stories

```
As a user, I want to:
- Upload a company document
- Categorize documents by type
- Link a document to a specific client
- Set expiration dates on documents
- Receive alerts before documents expire (future)
- Search documents by name, category, or tags
- Download documents
- Preview PDF documents in-app
```

#### UI Screens

1. **Document List**
   - Grid or list view
   - Filter by category
   - Filter by expiration (expired, expiring soon, valid)
   - Search by name

2. **Document Upload**
   - Drag & drop zone
   - Category selector
   - Entity selector (optional)
   - Date pickers for issue/expiration
   - Tags input

3. **Document Preview**
   - PDF viewer (if PDF)
   - Image viewer (if image)
   - Download button
   - Edit metadata button

---

## API Endpoints

### Entities

```typescript
// Queries
entities.list({ organizationId, filters?, pagination? })
entities.get({ id })
entities.search({ organizationId, query })

// Mutations
entities.create({ organizationId, data })
entities.update({ id, data })
entities.toggleActive({ id })
entities.delete({ id })  // Hard delete (admin only)
```

### Documents

```typescript
// Queries
documents.list({ organizationId, filters?, pagination? })
documents.get({ id })
documents.getByEntity({ entityId })
documents.getExpiring({ organizationId, days })

// Mutations
documents.create({ organizationId, data, file })
documents.update({ id, data })
documents.delete({ id })
documents.generateUploadUrl()  // For file upload
```

---

## Permissions

| Action | Owner | Admin | Member | Viewer |
|--------|-------|-------|--------|--------|
| View entities | ✅ | ✅ | ✅ | ✅ |
| Create entity | ✅ | ✅ | ✅ | ❌ |
| Edit entity | ✅ | ✅ | ✅ | ❌ |
| Delete entity | ✅ | ✅ | ❌ | ❌ |
| View documents | ✅ | ✅ | ✅ | ✅ |
| Upload document | ✅ | ✅ | ✅ | ❌ |
| Delete document | ✅ | ✅ | ❌ | ❌ |

---

## Future Enhancements

- [ ] Automatic CNPJ lookup from Receita Federal
- [ ] CEP auto-fill for addresses
- [ ] Document expiration email alerts
- [ ] Document OCR and search within content
- [ ] Entity merge (deduplicate)
- [ ] Import entities from CSV/Excel
- [ ] Entity groups/categories
