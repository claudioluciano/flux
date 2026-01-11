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
  },
  { strictTableNameTypes: true }
);

export default schema;

// Export validators for use in functions
export { addressValidator, documentCategoryValidator };
