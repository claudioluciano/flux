import { mutation } from "../_generated/server";
import { v } from "convex/values";
import { canEdit, canDelete } from "../lib/permissions";
import { documentCategoryValidator } from "../lib/validators";

/**
 * Generate an upload URL for file storage
 */
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    await canEdit(ctx);
    return await ctx.storage.generateUploadUrl();
  },
});

/**
 * Create a new document record after file upload
 */
export const create = mutation({
  args: {
    name: v.string(),
    category: documentCategoryValidator,
    description: v.optional(v.string()),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
    entityId: v.optional(v.id("entities")),
    issueDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    // Verify entity belongs to organization if provided
    if (args.entityId) {
      const entity = await ctx.db.get(args.entityId);
      if (!entity || entity.organizationId !== organizationId) {
        throw new Error("Entity not found");
      }
    }

    const now = Date.now();

    return await ctx.db.insert("documents", {
      organizationId,
      name: args.name.trim(),
      category: args.category,
      description: args.description?.trim(),
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      entityId: args.entityId,
      issueDate: args.issueDate,
      expirationDate: args.expirationDate,
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
 * Update document metadata (not the file itself)
 */
export const update = mutation({
  args: {
    id: v.id("documents"),
    name: v.string(),
    category: documentCategoryValidator,
    description: v.optional(v.string()),
    entityId: v.optional(v.id("entities")),
    issueDate: v.optional(v.number()),
    expirationDate: v.optional(v.number()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);
    const { id, ...data } = args;

    // Verify document exists and belongs to organization
    const doc = await ctx.db.get(id);
    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    // Verify entity if changing
    if (data.entityId) {
      const entity = await ctx.db.get(data.entityId);
      if (!entity || entity.organizationId !== organizationId) {
        throw new Error("Entity not found");
      }
    }

    await ctx.db.patch(id, {
      name: data.name.trim(),
      category: data.category,
      description: data.description?.trim(),
      entityId: data.entityId,
      issueDate: data.issueDate,
      expirationDate: data.expirationDate,
      tags: data.tags,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return id;
  },
});

/**
 * Replace the file for an existing document
 */
export const replaceFile = mutation({
  args: {
    id: v.id("documents"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    // Verify document exists and belongs to organization
    const doc = await ctx.db.get(args.id);
    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    // Delete old file
    await ctx.storage.delete(doc.storageId);

    // Update with new file
    await ctx.db.patch(args.id, {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return args.id;
  },
});

/**
 * Soft delete a document (set inactive)
 */
export const toggleActive = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    await ctx.db.patch(args.id, {
      isActive: !doc.isActive,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { isActive: !doc.isActive };
  },
});

/**
 * Permanently delete a document (requires admin role)
 */
export const remove = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const { organizationId } = await canDelete(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    // Delete file from storage
    await ctx.storage.delete(doc.storageId);

    // Delete document record
    await ctx.db.delete(args.id);

    return { success: true };
  },
});

/**
 * Unlink document from entity
 */
export const unlinkEntity = mutation({
  args: { id: v.id("documents") },
  handler: async (ctx, args) => {
    const { user, organizationId } = await canEdit(ctx);

    const doc = await ctx.db.get(args.id);
    if (!doc || doc.organizationId !== organizationId) {
      throw new Error("Document not found");
    }

    await ctx.db.patch(args.id, {
      entityId: undefined,
      updatedAt: Date.now(),
      updatedBy: user._id,
    });

    return { success: true };
  },
});
