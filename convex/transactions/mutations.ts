import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { canEdit, canDelete } from "../lib/permissions";
import {
  transactionTypeValidator,
  transactionStatusValidator,
  paymentMethodValidator,
} from "../schema";
import {
  validateAmount,
  validateDates,
  validatePaymentAmount,
  calculateStatus,
} from "../lib/financialValidators";

/**
 * Create a new transaction
 */
export const create = mutation({
  args: {
    type: transactionTypeValidator,
    entityId: v.optional(v.id("entities")),
    accountId: v.optional(v.id("accounts")),
    description: v.string(),
    notes: v.optional(v.string()),
    amount: v.number(),
    issueDate: v.number(),
    dueDate: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    // Validate amount
    const amountValidation = validateAmount(args.amount);
    if (!amountValidation.valid) {
      throw new Error(amountValidation.error);
    }

    // Validate dates
    const dateValidation = validateDates(args.issueDate, args.dueDate);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }

    // Validate entity belongs to organization
    if (args.entityId) {
      const entity = await ctx.db.get(args.entityId);
      if (!entity || entity.organizationId !== organizationId) {
        throw new Error("Entidade não encontrada");
      }
    }

    // Validate account belongs to organization
    if (args.accountId) {
      const account = await ctx.db.get(args.accountId);
      if (!account || account.organizationId !== organizationId) {
        throw new Error("Conta não encontrada");
      }
    }

    if (!args.description.trim()) {
      throw new Error("Descrição é obrigatória");
    }

    const now = Date.now();

    // Determine initial status
    const status = args.dueDate < now ? "overdue" : "pending";

    return await ctx.db.insert("transactions", {
      organizationId,
      type: args.type,
      entityId: args.entityId,
      accountId: args.accountId,
      description: args.description.trim(),
      notes: args.notes?.trim() || undefined,
      amount: args.amount,
      paidAmount: 0,
      issueDate: args.issueDate,
      dueDate: args.dueDate,
      status,
      tags: args.tags,
      isActive: true,
      createdAt: now,
      updatedAt: now,
      createdBy: user._id,
      updatedBy: user._id,
    });
  },
});

/**
 * Update an existing transaction
 */
export const update = mutation({
  args: {
    id: v.id("transactions"),
    entityId: v.optional(v.id("entities")),
    accountId: v.optional(v.id("accounts")),
    description: v.string(),
    notes: v.optional(v.string()),
    amount: v.number(),
    issueDate: v.number(),
    dueDate: v.number(),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);
    const { id, ...data } = args;

    const transaction = await ctx.db.get(id);
    if (!transaction || transaction.organizationId !== organizationId) {
      throw new Error("Transação não encontrada");
    }

    // Can't edit paid or cancelled transactions
    if (transaction.status === "paid" || transaction.status === "cancelled") {
      throw new Error("Não é possível editar transação paga ou cancelada");
    }

    // Validate amount
    const amountValidation = validateAmount(data.amount);
    if (!amountValidation.valid) {
      throw new Error(amountValidation.error);
    }

    // Amount can't be less than already paid
    if (data.amount < transaction.paidAmount) {
      throw new Error("Valor não pode ser menor que o já pago");
    }

    // Validate dates
    const dateValidation = validateDates(data.issueDate, data.dueDate);
    if (!dateValidation.valid) {
      throw new Error(dateValidation.error);
    }

    // Validate entity
    if (data.entityId) {
      const entity = await ctx.db.get(data.entityId);
      if (!entity || entity.organizationId !== organizationId) {
        throw new Error("Entidade não encontrada");
      }
    }

    // Validate account
    if (data.accountId) {
      const account = await ctx.db.get(data.accountId);
      if (!account || account.organizationId !== organizationId) {
        throw new Error("Conta não encontrada");
      }
    }

    if (!data.description.trim()) {
      throw new Error("Descrição é obrigatória");
    }

    // Recalculate status
    const newStatus = calculateStatus(
      data.amount,
      transaction.paidAmount,
      data.dueDate,
      transaction.status
    );

    await ctx.db.patch(id, {
      entityId: data.entityId,
      accountId: data.accountId,
      description: data.description.trim(),
      notes: data.notes?.trim() || undefined,
      amount: data.amount,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      status: newStatus,
      tags: data.tags,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Record a payment (partial or full)
 */
export const recordPayment = mutation({
  args: {
    id: v.id("transactions"),
    amount: v.number(),
    paymentMethod: v.optional(paymentMethodValidator),
    paidAt: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.organizationId !== organizationId) {
      throw new Error("Transação não encontrada");
    }

    if (transaction.status === "paid") {
      throw new Error("Transação já foi paga");
    }

    if (transaction.status === "cancelled") {
      throw new Error("Transação está cancelada");
    }

    // Validate payment amount
    const validation = validatePaymentAmount(
      args.amount,
      transaction.amount,
      transaction.paidAmount
    );
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const newPaidAmount = transaction.paidAmount + args.amount;
    const isFullyPaid = newPaidAmount >= transaction.amount;
    const paidAt = args.paidAt ?? Date.now();

    await ctx.db.patch(args.id, {
      paidAmount: newPaidAmount,
      status: isFullyPaid ? "paid" : "partial",
      paidAt: isFullyPaid ? paidAt : undefined,
      paymentMethod: args.paymentMethod,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return {
      newPaidAmount,
      remainingBalance: transaction.amount - newPaidAmount,
      isFullyPaid,
    };
  },
});

/**
 * Cancel a transaction
 */
export const cancel = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.organizationId !== organizationId) {
      throw new Error("Transação não encontrada");
    }

    if (transaction.status === "paid") {
      throw new Error("Não é possível cancelar transação já paga");
    }

    if (transaction.paidAmount > 0) {
      throw new Error("Não é possível cancelar transação com pagamento parcial");
    }

    await ctx.db.patch(args.id, {
      status: "cancelled",
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { success: true };
  },
});

/**
 * Toggle transaction active status (soft delete)
 */
export const toggleActive = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.organizationId !== organizationId) {
      throw new Error("Transação não encontrada");
    }

    await ctx.db.patch(args.id, {
      isActive: !transaction.isActive,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { isActive: !transaction.isActive };
  },
});

/**
 * Permanently delete a transaction (requires admin role)
 */
export const remove = mutation({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const { organizationId } = await canDelete(ctx);

    const transaction = await ctx.db.get(args.id);
    if (!transaction || transaction.organizationId !== organizationId) {
      throw new Error("Transação não encontrada");
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});

/**
 * Update overdue status for all pending transactions
 * (Can be called periodically or on page load)
 */
export const updateOverdueStatus = mutation({
  args: {},
  handler: async (ctx) => {
    const { user, organizationId } = await canEdit(ctx);
    const now = Date.now();

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    const toUpdate = transactions.filter(
      (t) =>
        t.isActive &&
        (t.status === "pending" || t.status === "partial") &&
        t.dueDate < now
    );

    for (const t of toUpdate) {
      await ctx.db.patch(t._id, {
        status: "overdue",
        updatedAt: now,
        updatedBy: user._id,
      });
    }

    return { updated: toUpdate.length };
  },
});
