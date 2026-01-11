import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { canEdit, canDelete } from "../lib/permissions";
import { accountTypeValidator } from "../schema";
import { DEFAULT_ACCOUNTS } from "../lib/financialValidators";

/**
 * Create a new account
 */
export const create = mutation({
  args: {
    code: v.string(),
    name: v.string(),
    type: accountTypeValidator,
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const normalizedCode = args.code.toUpperCase().trim();

    // Check for duplicate code
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_organization_code", (q) =>
        q.eq("organizationId", organizationId).eq("code", normalizedCode)
      )
      .first();

    if (existing) {
      throw new Error("Já existe uma conta com este código");
    }

    if (!args.name.trim()) {
      throw new Error("Nome da conta é obrigatório");
    }

    const now = Date.now();

    return await ctx.db.insert("accounts", {
      organizationId,
      code: normalizedCode,
      name: args.name.trim(),
      type: args.type,
      description: args.description?.trim() || undefined,
      isSystem: false,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });
  },
});

/**
 * Update an existing account
 */
export const update = mutation({
  args: {
    id: v.id("accounts"),
    code: v.string(),
    name: v.string(),
    type: accountTypeValidator,
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);
    const { id, ...data } = args;

    const account = await ctx.db.get(id);
    if (!account || account.organizationId !== organizationId) {
      throw new Error("Conta não encontrada");
    }

    // Don't allow editing system accounts' code or type
    if (account.isSystem && (data.code !== account.code || data.type !== account.type)) {
      throw new Error("Não é possível alterar código ou tipo de contas do sistema");
    }

    const normalizedCode = data.code.toUpperCase().trim();

    // Check for duplicate code (excluding self)
    const existing = await ctx.db
      .query("accounts")
      .withIndex("by_organization_code", (q) =>
        q.eq("organizationId", organizationId).eq("code", normalizedCode)
      )
      .first();

    if (existing && existing._id !== id) {
      throw new Error("Já existe uma conta com este código");
    }

    if (!data.name.trim()) {
      throw new Error("Nome da conta é obrigatório");
    }

    await ctx.db.patch(id, {
      code: normalizedCode,
      name: data.name.trim(),
      type: data.type,
      description: data.description?.trim() || undefined,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Toggle account active status (soft delete)
 */
export const toggleActive = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const account = await ctx.db.get(args.id);
    if (!account || account.organizationId !== organizationId) {
      throw new Error("Conta não encontrada");
    }

    // Don't allow deactivating system accounts
    if (account.isSystem && account.isActive) {
      throw new Error("Não é possível desativar contas do sistema");
    }

    await ctx.db.patch(args.id, {
      isActive: !account.isActive,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { isActive: !account.isActive };
  },
});

/**
 * Permanently delete an account (requires admin role)
 */
export const remove = mutation({
  args: { id: v.id("accounts") },
  handler: async (ctx, args) => {
    const { organizationId } = await canDelete(ctx);

    const account = await ctx.db.get(args.id);
    if (!account || account.organizationId !== organizationId) {
      throw new Error("Conta não encontrada");
    }

    // Don't allow deleting system accounts
    if (account.isSystem) {
      throw new Error("Não é possível excluir contas do sistema");
    }

    // Check for linked transactions
    const linkedTransaction = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .filter((q) => q.eq(q.field("accountId"), args.id))
      .first();

    if (linkedTransaction) {
      throw new Error(
        "Não é possível excluir conta com transações vinculadas. Desative a conta em vez disso."
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Seed default accounts for an organization
 */
export const seedDefaults = mutation({
  args: {},
  handler: async (ctx) => {
    const { user, organizationId } = await canEdit(ctx);

    // Check if accounts already exist
    const existingAccounts = await ctx.db
      .query("accounts")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .first();

    if (existingAccounts) {
      throw new Error("Organização já possui contas cadastradas");
    }

    const now = Date.now();
    const createdAccounts: string[] = [];

    // Create revenue accounts
    for (const account of DEFAULT_ACCOUNTS.revenue) {
      const id = await ctx.db.insert("accounts", {
        organizationId,
        code: account.code,
        name: account.name,
        type: "revenue",
        isSystem: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
        updatedBy: user._id,
      });
      createdAccounts.push(id);
    }

    // Create expense accounts
    for (const account of DEFAULT_ACCOUNTS.expense) {
      const id = await ctx.db.insert("accounts", {
        organizationId,
        code: account.code,
        name: account.name,
        type: "expense",
        isSystem: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
        updatedBy: user._id,
      });
      createdAccounts.push(id);
    }

    // Create cost accounts
    for (const account of DEFAULT_ACCOUNTS.cost) {
      const id = await ctx.db.insert("accounts", {
        organizationId,
        code: account.code,
        name: account.name,
        type: "cost",
        isSystem: true,
        isActive: true,
        createdAt: now,
        updatedAt: now,
        createdBy: user._id,
        updatedBy: user._id,
      });
      createdAccounts.push(id);
    }

    return { created: createdAccounts.length };
  },
});
