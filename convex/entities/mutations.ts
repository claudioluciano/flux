import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { canEdit, canDelete } from "../lib/permissions";
import {
  validateDocument,
  normalizeDocument,
  entityArgsValidator,
} from "../lib/validators";

/**
 * Create a new entity
 */
export const create = mutation({
  args: entityArgsValidator,
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    // Validate document (CPF or CNPJ)
    const validation = validateDocument(args.document, args.entityType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const normalizedDoc = normalizeDocument(args.document);

    // Check for duplicate document in this organization
    const existing = await ctx.db
      .query("entities")
      .withIndex("by_organization_document", (q) =>
        q.eq("organizationId", organizationId).eq("document", normalizedDoc)
      )
      .first();

    if (existing) {
      throw new Error("Já existe uma entidade com este documento");
    }

    // Must be at least client or supplier
    if (!args.isClient && !args.isSupplier) {
      throw new Error("Entidade deve ser cliente ou fornecedor");
    }

    const now = Date.now();

    return await ctx.db.insert("entities", {
      organizationId,
      name: args.name.trim(),
      tradeName: args.tradeName?.trim(),
      document: normalizedDoc,
      entityType: args.entityType,
      isClient: args.isClient,
      isSupplier: args.isSupplier,
      email: args.email?.trim() || undefined,
      phone: args.phone?.trim() || undefined,
      website: args.website?.trim() || undefined,
      address: args.address,
      stateRegistration: args.stateRegistration?.trim() || undefined,
      municipalRegistration: args.municipalRegistration?.trim() || undefined,
      notes: args.notes?.trim() || undefined,
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
 * Update an existing entity
 */
export const update = mutation({
  args: {
    id: v.id("entities"),
    ...entityArgsValidator,
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);
    const { id, ...data } = args;

    // Verify entity exists and belongs to organization
    const entity = await ctx.db.get(id);
    if (!entity || entity.organizationId !== organizationId) {
      throw new Error("Entity not found");
    }

    // Validate document
    const validation = validateDocument(data.document, data.entityType);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const normalizedDoc = normalizeDocument(data.document);

    // Check for duplicate (excluding self)
    const existing = await ctx.db
      .query("entities")
      .withIndex("by_organization_document", (q) =>
        q.eq("organizationId", organizationId).eq("document", normalizedDoc)
      )
      .first();

    if (existing && existing._id !== id) {
      throw new Error("Já existe uma entidade com este documento");
    }

    // Must be at least client or supplier
    if (!data.isClient && !data.isSupplier) {
      throw new Error("Entidade deve ser cliente ou fornecedor");
    }

    await ctx.db.patch(id, {
      name: data.name.trim(),
      tradeName: data.tradeName?.trim(),
      document: normalizedDoc,
      entityType: data.entityType,
      isClient: data.isClient,
      isSupplier: data.isSupplier,
      email: data.email?.trim() || undefined,
      phone: data.phone?.trim() || undefined,
      website: data.website?.trim() || undefined,
      address: data.address,
      stateRegistration: data.stateRegistration?.trim() || undefined,
      municipalRegistration: data.municipalRegistration?.trim() || undefined,
      notes: data.notes?.trim() || undefined,
      tags: data.tags,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Toggle entity active status (soft delete)
 */
export const toggleActive = mutation({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const entity = await ctx.db.get(args.id);
    if (!entity || entity.organizationId !== organizationId) {
      throw new Error("Entity not found");
    }

    await ctx.db.patch(args.id, {
      isActive: !entity.isActive,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { isActive: !entity.isActive };
  },
});

/**
 * Permanently delete an entity (requires admin role)
 */
export const remove = mutation({
  args: { id: v.id("entities") },
  handler: async (ctx, args) => {
    const { organizationId } = await canDelete(ctx);

    const entity = await ctx.db.get(args.id);
    if (!entity || entity.organizationId !== organizationId) {
      throw new Error("Entity not found");
    }

    // Check for linked documents
    const linkedDocs = await ctx.db
      .query("documents")
      .withIndex("by_entity", (q) => q.eq("entityId", args.id))
      .first();

    if (linkedDocs) {
      throw new Error(
        "Não é possível excluir entidade com documentos vinculados. Remova os documentos primeiro."
      );
    }

    await ctx.db.delete(args.id);
    return { success: true };
  },
});
