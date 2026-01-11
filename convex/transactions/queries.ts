import { query } from "../_generated/server";
import { v } from "convex/values";
import { canView } from "../lib/permissions";
import { transactionTypeValidator, transactionStatusValidator } from "../schema";
import { isOverdue, getRemainingBalance } from "../lib/financialValidators";

/**
 * List transactions for the current organization
 */
export const list = query({
  args: {
    type: v.optional(transactionTypeValidator),
    status: v.optional(transactionStatusValidator),
    entityId: v.optional(v.id("entities")),
    startDate: v.optional(v.number()),
    endDate: v.optional(v.number()),
    includeInactive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const showInactive = args.includeInactive ?? false;

    let transactions;

    if (args.type) {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_organization_type", (q) =>
          q.eq("organizationId", organizationId).eq("type", args.type!)
        )
        .collect();
    } else {
      transactions = await ctx.db
        .query("transactions")
        .withIndex("by_organization", (q) =>
          q.eq("organizationId", organizationId)
        )
        .collect();
    }

    // Filter by active status
    if (!showInactive) {
      transactions = transactions.filter((t) => t.isActive);
    }

    // Filter by status
    if (args.status) {
      transactions = transactions.filter((t) => t.status === args.status);
    }

    // Filter by entity
    if (args.entityId) {
      transactions = transactions.filter((t) => t.entityId === args.entityId);
    }

    // Filter by date range
    if (args.startDate) {
      transactions = transactions.filter((t) => t.dueDate >= args.startDate!);
    }
    if (args.endDate) {
      transactions = transactions.filter((t) => t.dueDate <= args.endDate!);
    }

    // Sort by due date (ascending)
    return transactions.sort((a, b) => a.dueDate - b.dueDate);
  },
});

/**
 * Get a single transaction by ID with related data
 */
export const get = query({
  args: { id: v.id("transactions") },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const transaction = await ctx.db.get(args.id);

    if (!transaction || transaction.organizationId !== organizationId) {
      throw new Error("Transação não encontrada");
    }

    // Get related entity
    let entity = null;
    if (transaction.entityId) {
      entity = await ctx.db.get(transaction.entityId);
    }

    // Get related account
    let account = null;
    if (transaction.accountId) {
      account = await ctx.db.get(transaction.accountId);
    }

    return {
      ...transaction,
      entity,
      account,
      remainingBalance: getRemainingBalance(transaction.amount, transaction.paidAmount),
    };
  },
});

/**
 * Get overdue transactions
 */
export const getOverdue = query({
  args: {
    type: v.optional(transactionTypeValidator),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const now = Date.now();

    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    // Filter active, unpaid, and overdue
    transactions = transactions.filter(
      (t) =>
        t.isActive &&
        t.status !== "paid" &&
        t.status !== "cancelled" &&
        t.dueDate < now
    );

    // Filter by type
    if (args.type) {
      transactions = transactions.filter((t) => t.type === args.type);
    }

    // Sort by due date (oldest first)
    return transactions.sort((a, b) => a.dueDate - b.dueDate);
  },
});

/**
 * Get transactions due in the next N days
 */
export const getUpcoming = query({
  args: {
    days: v.optional(v.number()),
    type: v.optional(transactionTypeValidator),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const now = Date.now();
    const daysAhead = args.days ?? 7;
    const endDate = now + daysAhead * 24 * 60 * 60 * 1000;

    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization_dueDate", (q) =>
        q.eq("organizationId", organizationId).gte("dueDate", now)
      )
      .collect();

    // Filter active, unpaid, and within date range
    transactions = transactions.filter(
      (t) =>
        t.isActive &&
        t.status !== "paid" &&
        t.status !== "cancelled" &&
        t.dueDate <= endDate
    );

    // Filter by type
    if (args.type) {
      transactions = transactions.filter((t) => t.type === args.type);
    }

    // Sort by due date
    return transactions.sort((a, b) => a.dueDate - b.dueDate);
  },
});

/**
 * Get summary totals by status
 */
export const getSummary = query({
  args: {
    type: v.optional(transactionTypeValidator),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const now = Date.now();

    let transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    // Filter active only
    transactions = transactions.filter((t) => t.isActive);

    // Filter by type
    if (args.type) {
      transactions = transactions.filter((t) => t.type === args.type);
    }

    // Calculate summaries
    const pending = transactions.filter(
      (t) => t.status === "pending" || t.status === "partial"
    );
    const overdue = transactions.filter(
      (t) =>
        (t.status === "pending" || t.status === "partial" || t.status === "overdue") &&
        t.dueDate < now
    );
    const paid = transactions.filter((t) => t.status === "paid");

    return {
      totalPending: pending.reduce((sum, t) => sum + (t.amount - t.paidAmount), 0),
      totalOverdue: overdue.reduce((sum, t) => sum + (t.amount - t.paidAmount), 0),
      totalPaid: paid.reduce((sum, t) => sum + t.amount, 0),
      countPending: pending.length,
      countOverdue: overdue.length,
      countPaid: paid.length,
    };
  },
});

/**
 * Get cash flow data for a date range
 */
export const getCashFlow = query({
  args: {
    startDate: v.number(),
    endDate: v.number(),
    includeProjected: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);
    const includeProjected = args.includeProjected ?? true;

    const transactions = await ctx.db
      .query("transactions")
      .withIndex("by_organization", (q) =>
        q.eq("organizationId", organizationId)
      )
      .collect();

    // Filter active transactions
    const active = transactions.filter((t) => t.isActive && t.status !== "cancelled");

    // Group by date and calculate in/out
    const dailyData: Record<
      string,
      { date: string; inflow: number; outflow: number; transactions: typeof active }
    > = {};

    for (const t of active) {
      // Use paidAt for paid transactions, dueDate for pending
      const dateToUse = t.status === "paid" && t.paidAt ? t.paidAt : t.dueDate;

      // Skip if outside range
      if (dateToUse < args.startDate || dateToUse > args.endDate) {
        continue;
      }

      // Skip projected if not included
      if (!includeProjected && t.status !== "paid") {
        continue;
      }

      const dateKey = new Date(dateToUse).toISOString().split("T")[0];

      if (!dailyData[dateKey]) {
        dailyData[dateKey] = { date: dateKey, inflow: 0, outflow: 0, transactions: [] };
      }

      if (t.type === "receivable") {
        dailyData[dateKey].inflow += t.status === "paid" ? t.amount : t.amount - t.paidAmount;
      } else {
        dailyData[dateKey].outflow += t.status === "paid" ? t.amount : t.amount - t.paidAmount;
      }

      dailyData[dateKey].transactions.push(t);
    }

    // Sort by date and calculate running balance
    const sortedDays = Object.values(dailyData).sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let runningBalance = 0;
    const result = sortedDays.map((day) => {
      runningBalance += day.inflow - day.outflow;
      return {
        ...day,
        balance: runningBalance,
      };
    });

    return {
      days: result,
      totalInflow: result.reduce((sum, d) => sum + d.inflow, 0),
      totalOutflow: result.reduce((sum, d) => sum + d.outflow, 0),
      netFlow: result.reduce((sum, d) => sum + d.inflow - d.outflow, 0),
    };
  },
});

/**
 * Search transactions by description
 */
export const search = query({
  args: {
    query: v.string(),
    type: v.optional(transactionTypeValidator),
  },
  handler: async (ctx, args) => {
    const { organizationId } = await canView(ctx);

    let searchQuery = ctx.db
      .query("transactions")
      .withSearchIndex("search_transactions", (q) => {
        let sq = q.search("description", args.query).eq("organizationId", organizationId);
        if (args.type) {
          sq = sq.eq("type", args.type);
        }
        return sq;
      });

    const transactions = await searchQuery.take(50);

    return transactions.filter((t) => t.isActive);
  },
});
