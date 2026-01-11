import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

// Address validator for entities
const addressValidator = v.object({
  street: v.string(),
  number: v.string(),
  complement: v.optional(v.string()),
  neighborhood: v.string(),
  city: v.string(),
  state: v.string(), // 2-letter code (SP, RJ, etc.)
  zipCode: v.string(), // CEP: 00000-000
  country: v.optional(v.string()), // defaults to "BR"
});

// Document category type
const documentCategoryValidator = v.union(
  v.literal("contrato_social"),
  v.literal("alteracao_social"),
  v.literal("cnpj"),
  v.literal("contrato_cliente"),
  v.literal("alvara"),
  v.literal("certidao"),
  v.literal("other")
);

// Account type validator
const accountTypeValidator = v.union(
  v.literal("revenue"),
  v.literal("expense"),
  v.literal("cost")
);

// Transaction type validator
const transactionTypeValidator = v.union(
  v.literal("payable"),
  v.literal("receivable")
);

// Transaction status validator
const transactionStatusValidator = v.union(
  v.literal("pending"),
  v.literal("partial"),
  v.literal("paid"),
  v.literal("overdue"),
  v.literal("cancelled")
);

// Payment method validator
const paymentMethodValidator = v.union(
  v.literal("cash"),
  v.literal("pix"),
  v.literal("transfer"),
  v.literal("credit_card"),
  v.literal("debit_card"),
  v.literal("boleto"),
  v.literal("check")
);

const schema = defineSchema(
  {
    // Entities: unified table for clients and suppliers
    entities: defineTable({
      // Organization isolation (references Better Auth organization)
      organizationId: v.string(),

      // Core identity
      name: v.string(), // Razão Social
      tradeName: v.optional(v.string()), // Nome Fantasia
      document: v.string(), // CNPJ or CPF (stored normalized, no punctuation)
      entityType: v.union(v.literal("company"), v.literal("individual")), // PJ or PF

      // Role flags (can be both client and supplier)
      isClient: v.boolean(),
      isSupplier: v.boolean(),

      // Contact info
      email: v.optional(v.string()),
      phone: v.optional(v.string()),
      website: v.optional(v.string()),

      // Address
      address: v.optional(addressValidator),

      // Tax registrations (PJ only)
      stateRegistration: v.optional(v.string()), // Inscrição Estadual
      municipalRegistration: v.optional(v.string()), // Inscrição Municipal

      // Metadata
      notes: v.optional(v.string()),
      tags: v.optional(v.array(v.string())),

      // Soft delete & audit
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(), // userId
      updatedBy: v.string(), // userId
    })
      // Primary query pattern: list by org
      .index("by_organization", ["organizationId", "isActive"])
      // Filter by role within org
      .index("by_organization_client", ["organizationId", "isClient", "isActive"])
      .index("by_organization_supplier", [
        "organizationId",
        "isSupplier",
        "isActive",
      ])
      // Document uniqueness check within org
      .index("by_organization_document", ["organizationId", "document"])
      // Search support
      .searchIndex("search_entities", {
        searchField: "name",
        filterFields: ["organizationId", "isActive", "isClient", "isSupplier"],
      }),

    // Documents: company documents with file storage
    documents: defineTable({
      // Organization isolation
      organizationId: v.string(),

      // Core fields
      name: v.string(),
      category: documentCategoryValidator,
      description: v.optional(v.string()),

      // File storage (Convex storage)
      storageId: v.id("_storage"),
      fileName: v.string(),
      fileType: v.string(), // MIME type
      fileSize: v.number(), // bytes

      // Optional entity link
      entityId: v.optional(v.id("entities")),

      // Dates
      issueDate: v.optional(v.number()), // timestamp
      expirationDate: v.optional(v.number()), // timestamp

      // Metadata
      tags: v.optional(v.array(v.string())),

      // Audit
      isActive: v.boolean(),
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
      updatedBy: v.string(),
    })
      // Primary query pattern
      .index("by_organization", ["organizationId", "isActive"])
      // Filter by category
      .index("by_organization_category", [
        "organizationId",
        "category",
        "isActive",
      ])
      // Documents linked to an entity
      .index("by_entity", ["entityId", "isActive"])
      // Expiration tracking
      .index("by_expiration", ["organizationId", "expirationDate", "isActive"])
      // Search
      .searchIndex("search_documents", {
        searchField: "name",
        filterFields: ["organizationId", "category", "isActive"],
      }),

    // Accounts: chart of accounts for categorization
    accounts: defineTable({
      organizationId: v.string(),

      // Identity
      code: v.string(), // e.g., "001", "002"
      name: v.string(), // e.g., "Vendas de Produtos"
      type: accountTypeValidator,
      description: v.optional(v.string()),

      // Flags
      isSystem: v.boolean(), // Pre-seeded accounts
      isActive: v.boolean(),

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
      updatedBy: v.string(),
    })
      .index("by_organization", ["organizationId", "isActive"])
      .index("by_organization_type", ["organizationId", "type", "isActive"])
      .index("by_organization_code", ["organizationId", "code"])
      .searchIndex("search_accounts", {
        searchField: "name",
        filterFields: ["organizationId"],
      }),

    // Transactions: payables and receivables
    transactions: defineTable({
      organizationId: v.string(),
      type: transactionTypeValidator,

      // Relations
      entityId: v.optional(v.id("entities")), // Client or Supplier
      accountId: v.optional(v.id("accounts")), // Category

      // Details
      description: v.string(),
      notes: v.optional(v.string()),

      // Values
      amount: v.number(), // Total amount
      paidAmount: v.number(), // Amount paid so far (for partial payments)

      // Dates
      issueDate: v.number(), // When created
      dueDate: v.number(), // When due
      paidAt: v.optional(v.number()), // When fully paid

      // Payment
      status: transactionStatusValidator,
      paymentMethod: v.optional(paymentMethodValidator),

      // Metadata
      tags: v.optional(v.array(v.string())),
      isActive: v.boolean(),

      // Audit
      createdAt: v.number(),
      updatedAt: v.number(),
      createdBy: v.string(),
      updatedBy: v.string(),
    })
      .index("by_organization", ["organizationId", "isActive"])
      .index("by_organization_type", ["organizationId", "type", "isActive"])
      .index("by_organization_status", ["organizationId", "status", "isActive"])
      .index("by_organization_dueDate", ["organizationId", "dueDate"])
      .index("by_entity", ["entityId"])
      .searchIndex("search_transactions", {
        searchField: "description",
        filterFields: ["organizationId", "type"],
      }),
  },
  { strictTableNameTypes: true }
);

export default schema;

// Export validators for use in functions
export {
  addressValidator,
  documentCategoryValidator,
  accountTypeValidator,
  transactionTypeValidator,
  transactionStatusValidator,
  paymentMethodValidator,
};
