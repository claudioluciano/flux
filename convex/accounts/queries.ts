import { query } from "../_generated/server";
import { v } from "convex/values";
import { canView } from "../lib/permissions";
import { accountTypeValidator } from "../schema";

/**
 * List accounts for the current organization
 */
export const list = query({
  args: {
    type: v.optional(accountTypeValidator),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const showInactive = args.includeInactive ?? false;

    let accounts;
    if (args.type) {
      accounts = await ctx.db
        .query("accounts")
        .withIndex("by_organization_type", (q) =>
          q
            .eq("organizationId", organizationId)
            .eq("type", args.type!)
        )
        .collect();
    } else {
      accounts = await ctx.db
        .query("accounts")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", organizationId)
        )
        .collect();
    }

    // Filter by active status
    if (!showInactive) {
      accounts = accounts.filter((a) => a.isActive);
    }

    // Sort by code
    return accounts.sort((a, b) => a.code.localeCompare(b.code));
  },
});

/**
 * Get a single account by ID
 */
export const get = query({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const account = await ctx.db.get(args.id);

    if (!account || account.organizationId !== organizationId) {
      throw new Error("Conta não encontrada");
    }

    return account;
  },
});

/**
 * Search accounts by name
 */
export const search = query({
  args: {
    query: v.string(),
    type: v.optional(accountTypeValidator),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    const accounts = await ctx.db
      .query("accounts")
      .withSearchIndex("search_accounts", (q) =>
        q.search("name", args.query).eq("organizationId", organizationId)
      )
      .take(50);

    // Filter by type and active status
    let filtered = accounts.filter((a) => a.isActive);
    if (args.type) {
      filtered = filtered.filter((a) => a.type === args.type);
    }

    return filtered;
  },
});

/**
 * Get accounts by type (for dropdowns)
 */
export const getByType = query({
  args: { type: accountTypeValidator },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_organization_type", (q) =>
        q
          .eq("organizationId", organizationId)
          .eq("type", args.type)
      )
      .collect();

    return accounts
      .filter((a) => a.isActive)
      .sort((a, b) => a.code.localeCompare(b.code));
  },
});

/**
 * Get account counts by type
 */
export const getCounts = query({
  args: {},
  handler: async (ctx) => {
    const { organizationId } = await canView(ctx);

    const accounts = await ctx.db
      .query("accounts")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    const active = accounts.filter((a) => a.isActive);

    return {
      total: active.length,
      revenue: active.filter((a) => a.type === "revenue").length,
      expense: active.filter((a) => a.type === "expense").length,
      cost: active.filter((a) => a.type === "cost").length,
    };
  },
});

/**
 * Check if account code exists
 */
export const checkCodeExists = query({
  args: {
    code: v.string(),
    excludeId: v.optional(v.id("accounts")),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_organization_code", (q) =>
        q.eq("organizationId", organizationId).eq("code", args.code.toUpperCase())
      )
      .first();

    if (existing && (!args.excludeId || existing._id !== args.excludeId)) {
      return { exists: true, account: existing };
    }

    return { exists: false, account: null };
  },
});
