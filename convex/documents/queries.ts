import { query } from "../_generated/server";
import { v } from "convex/values";
import { canView } from "../lib/permissions";
import { documentCategoryValidator } from "../lib/validators";

/**
 * List documents for the current organization
 */
export const list = query({
  args: {
    category: v.optional(documentCategoryValidator),
    entityId: v.optional(v.id("entities")),
    expirationFilter: v.optional(
      v.union(
        v.literal("expired"),
        v.literal("expiring_soon"), // within 30 days
        v.literal("valid")
      )
    ),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    let docs;

    // Query based on filters
    if (args.entityId) {
      // Get documents for a specific entity
      docs = await ctx.db
        .query("documents")
        .withIndex("by_entity", (q) =>
          q.eq("entityId", args.entityId).eq("isActive", true)
        )
        .collect();

      // Filter by organization (safety check)
      docs = docs.filter((d) => d.organizationId === organizationId);
    } else if (args.category) {
      // Get documents by category
      docs = await ctx.db
        .query("documents")
        .withIndex("by_organization_category", (q) =>
          q
            .eq("organizationId", organizationId)
            .eq("category", args.category!)
            .eq("isActive", true)
        )
        .collect();
    } else {
      // Get all documents for the organization
      docs = await ctx.db
        .query("documents")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", organizationId).eq("isActive", true)
        )
        .collect();
    }

    // Apply expiration filter
    if (args.expirationFilter) {
      const now = Date.now();
      const thirtyDays = 30 * 24 * 60 * 60 * 1000;

      docs = docs.filter((doc) => {
        if (!doc.expirationDate) {
          // Documents without expiration are considered "valid"
          return args.expirationFilter === "valid";
        }

        switch (args.expirationFilter) {
          case "expired":
            return doc.expirationDate < now;
          case "expiring_soon":
            return (
              doc.expirationDate >= now &&
              doc.expirationDate <= now + thirtyDays
            );
          case "valid":
            return doc.expirationDate > now + thirtyDays;
          default:
            return true;
        }
      });
    }

    return docs;
  },
});

/**
 * Get a single document by ID
 */
export const get = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const doc = await ctx.db.get(args.id);

    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    return doc;
  },
});

/**
 * Get documents for a specific entity
 */
export const getByEntity = query({
  args: { entityId: v.id("entities") },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    // Verify entity belongs to organization
    const entity = await ctx.db.get(args.entityId);
    if (!entity || entity.organizationId !== organizationId) {
      throw new Error("Entity not found");
    }

    return await ctx.db
      .query("documents")
      .withIndex("by_entity", (q) =>
        q.eq("entityId", args.entityId).eq("isActive", true)
      )
      .collect();
  },
});

/**
 * Get documents expiring within N days
 */
export const getExpiring = query({
  args: { days: v.number() },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const now = Date.now();
    const threshold = now + args.days * 24 * 60 * 60 * 1000;

    // Get all active documents for the organization
    const docs = await ctx.db
      .query("documents")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId).eq("isActive", true)
      )
      .collect();

    // Filter by expiration date
    return docs.filter(
      (doc) =>
        doc.expirationDate !== undefined && doc.expirationDate <= threshold
    );
  },
});

/**
 * Get download URL for a document
 */
export const getDownloadUrl = query({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const doc = await ctx.db.get(args.id);

    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    const url = await ctx.storage.getUrl(doc.storageId);
    return { url, fileName: doc.fileName, fileType: doc.fileType };
  },
});

/**
 * Search documents by name
 */
export const search = query({
  args: {
    query: v.string(),
    category: v.optional(documentCategoryValidator),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    let searchQuery = ctx.db
      .query("documents")
      .withSearchIndex("search_documents", (q) => {
        let sq = q
          .search("name", args.query)
          .eq("organizationId", organizationId)
          .eq("isActive", true);

        if (args.category) {
          sq = sq.eq("category", args.category);
        }

        return sq;
      });

    return await searchQuery.take(50);
  },
});

/**
 * Get document counts by category and status
 */
export const getCounts = query({
  args: {},
  handler: async (ctx) => {
    const { organizationId } = await canView(ctx);
    const now = Date.now();
    const thirtyDays = 30 * 24 * 60 * 60 * 1000;

    const docs = await ctx.db
      .query("documents")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId).eq("isActive", true)
      )
      .collect();

    const expired = docs.filter(
      (d) => d.expirationDate && d.expirationDate < now
    ).length;

    const expiringSoon = docs.filter(
      (d) =>
        d.expirationDate &&
        d.expirationDate >= now &&
        d.expirationDate <= now + thirtyDays
    ).length;

    // Count by category
    const byCategory: Record<string, number> = {};
    for (const doc of docs) {
      byCategory[doc.category] = (byCategory[doc.category] || 0) + 1;
    }

    return {
      total: docs.length,
      expired,
      expiringSoon,
      byCategory,
    };
  },
});
