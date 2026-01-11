import { query } from "./_generated/server";
import { v } from "convex/values";

/**
 * Get all sessions for a user
 * This is accessible from outside the component via ctx.runQuery
 */
export const listSessionsByUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("session"),
      _creationTime: v.number(),
      expiresAt: v.number(),
      token: v.string(),
      createdAt: v.number(),
      updatedAt: v.number(),
      ipAddress: v.optional(v.union(v.null(), v.string())),
      userAgent: v.optional(v.union(v.null(), v.string())),
      userId: v.string(),
      activeOrganizationId: v.optional(v.union(v.null(), v.string())),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("session")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();
  },
});

/**
 * Get all members of an organization
 * This is accessible from outside the component via ctx.runQuery
 */
export const listMembersByOrg = query({
  args: { organizationId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("member"),
      _creationTime: v.number(),
      organizationId: v.string(),
      userId: v.string(),
      role: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    return await ctx.db
      .query("member")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();
  },
});

/**
 * Get a member by user ID and organization ID
 */
export const getMemberByUserAndOrg = query({
  args: {
    userId: v.string(),
    organizationId: v.string(),
  },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("member"),
      _creationTime: v.number(),
      organizationId: v.string(),
      userId: v.string(),
      role: v.string(),
      createdAt: v.number(),
    })
  ),
  handler: async (ctx, args) => {
    const members = await ctx.db
      .query("member")
      .withIndex("organizationId", (q) => q.eq("organizationId", args.organizationId))
      .collect();

    return members.find((m) => m.userId === args.userId) ?? null;
  },
});

/**
 * Get an organization by ID
 */
export const getOrganization = query({
  args: { organizationId: v.string() },
  returns: v.union(
    v.null(),
    v.object({
      _id: v.id("organization"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.union(v.null(), v.string())),
      createdAt: v.number(),
      metadata: v.optional(v.union(v.null(), v.string())),
    })
  ),
  handler: async (ctx, args) => {
    // Query by slug or iterate to find by ID
    const orgs = await ctx.db.query("organization").collect();
    return orgs.find((o) => o._id === args.organizationId) ?? null;
  },
});

/**
 * Get organizations for a user (via member table)
 */
export const listOrganizationsByUser = query({
  args: { userId: v.string() },
  returns: v.array(
    v.object({
      _id: v.id("organization"),
      _creationTime: v.number(),
      name: v.string(),
      slug: v.string(),
      logo: v.optional(v.union(v.null(), v.string())),
      createdAt: v.number(),
      metadata: v.optional(v.union(v.null(), v.string())),
      role: v.string(),
    })
  ),
  handler: async (ctx, args) => {
    // Get all memberships for the user
    const memberships = await ctx.db
      .query("member")
      .withIndex("userId", (q) => q.eq("userId", args.userId))
      .collect();

    // Get the organization details for each membership
    const orgsWithRoles = await Promise.all(
      memberships.map(async (m) => {
        const orgs = await ctx.db.query("organization").collect();
        const org = orgs.find((o) => o._id === m.organizationId);
        if (!org) return null;
        return {
          ...org,
          role: m.role,
        };
      })
    );

    return orgsWithRoles.filter((o): o is NonNullable<typeof o> => o !== null);
  },
});
