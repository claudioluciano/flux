import { query } from "../_generated/server";
import { v } from "convex/values";
import { canView } from "../lib/permissions";

/**
 * List entities for the current organization
 */
export const list = query({
  args: {
    filter: v.optional(
      v.union(
        v.literal("all"),
        v.literal("clients"),
        v.literal("suppliers"),
        v.literal("both")
      )
    ),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const showInactive = args.includeInactive ?? false;
    const filter = args.filter ?? "all";

    // Get all entities for the organization
    let entities = await ctx.db
      .query("entities")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    // Filter by active status
    if (!showInactive) {
      entities = entities.filter((e) => e.isActive);
    }

    // Apply role filter
    switch (filter) {
      case "clients":
        return entities.filter((e) => e.isClient && !e.isSupplier);
      case "suppliers":
        return entities.filter((e) => e.isSupplier && !e.isClient);
      case "both":
        return entities.filter((e) => e.isClient && e.isSupplier);
      default:
        return entities;
    }
  },
});

/**
 * Get a single entity by ID
 */
export const get = query({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const entity = await ctx.db.get(args.id);

    if (!entity || entity.organizationId !== organizationId) {
      throw new Error("Entity not found");
    }

    return entity;
  },
});

/**
 * Search entities by name
 */
export const search = query({
  args: {
    query: v.string(),
    filter: v.optional(v.union(v.literal("clients"), v.literal("suppliers"))),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    // Use search index
    let searchQuery = ctx.db
      .query("entities")
      .withSearchIndex("search_entities", (q) => {
        let sq = q
          .search("name", args.query)
          .eq("organizationId", organizationId)
          .eq("isActive", true);

        if (args.filter === "clients") {
          sq = sq.eq("isClient", true);
        } else if (args.filter === "suppliers") {
          sq = sq.eq("isSupplier", true);
        }

        return sq;
      });

    return await searchQuery.take(50);
  },
});

/**
 * Check if a document (CPF/CNPJ) already exists in the organization
 */
export const checkDocumentExists = query({
  args: {
    document: v.string(),
    excludeId: v.optional(v.id("entities")),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    // Normalize document (remove non-digits)
    const normalized = args.document.replace(/\D/g, "");

    const existing = await ctx.db
      .query("entities")
      .withIndex("by_organization_document", (q) =>
        q.eq("organizationId", organizationId).eq("document", normalized)
      )
      .first();

    if (existing && (!args.excludeId || existing._id !== args.excludeId)) {
      return { exists: true, entity: existing };
    }

    return { exists: false, entity: null };
  },
});

/**
 * Get entity counts by type
 */
export const getCounts = query({
  args: {},
  handler: async (ctx) => {
    const { organizationId } = await canView(ctx);

    const entities = await ctx.db
      .query("entities")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    return {
      total: entities.length,
      clients: entities.filter((e) => e.isClient && !e.isSupplier).length,
      suppliers: entities.filter((e) => e.isSupplier && !e.isClient).length,
      both: entities.filter((e) => e.isClient && e.isSupplier).length,
    };
  },
});
