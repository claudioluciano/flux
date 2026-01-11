import { QueryCtx, MutationCtx } from "../_generated/server";
import { authComponent } from "../auth";
import { components } from "../_generated/api";

// Role types matching Better Auth organization plugin
export type Role = "owner" | "admin" | "member";

// Role hierarchy for permission checks
const ROLE_HIERARCHY: Record<Role, number> = {
  owner: 3,
  admin: 2,
  member: 1,
};

// Type for the auth context result
export interface AuthContext {
  user: {
    _id: string; // Better Auth user ID (from component table)
    email: string;
    name: string;
  };
  organizationId: string;
  role: Role;
}

/**
 * Get the current authenticated user
 * Throws if not authenticated
 */
export async function getAuthUser(ctx: QueryCtx | MutationCtx) {
  const user = await authComponent.getAuthUser(ctx);
  if (!user) {
    throw new Error("Not authenticated");
  }
  return user;
}

/**
 * Get the current authenticated user (safe version)
 * Returns null if not authenticated
 */
export async function safeGetAuthUser(ctx: QueryCtx | MutationCtx) {
  return await authComponent.safeGetAuthUser(ctx);
}

/**
 * Get the active organization ID from the user's session
 * The Better Auth organization plugin stores activeOrganizationId in the session
 */
async function getActiveOrganizationId(
  ctx: QueryCtx | MutationCtx,
  userId: string
): Promise<string | null> {
  // Query sessions for this user from the Better Auth component
  const sessions = await ctx.runQuery(
    components.betterAuth.lib.listSessionsByUser,
    { userId }
  );

  // Find the most recent valid session with an active organization
  const now = Date.now();
  const validSession = sessions
    .filter((s) => s.expiresAt > now && s.activeOrganizationId)
    .sort((a, b) => b.updatedAt - a.updatedAt)[0];

  return validSession?.activeOrganizationId ?? null;
}

/**
 * Get the member record for a user in an organization
 */
async function getMember(
  ctx: QueryCtx | MutationCtx,
  userId: string,
  organizationId: string
) {
  // Query the member from Better Auth component
  return await ctx.runQuery(
    components.betterAuth.lib.getMemberByUserAndOrg,
    { userId, organizationId }
  );
}

/**
 * Get the current user with their active organization context
 * Throws if not authenticated or no organization selected
 */
export async function getCurrentUserWithOrg(
  ctx: QueryCtx | MutationCtx
): Promise<AuthContext> {
  const user = await getAuthUser(ctx);

  // Get active organization from session
  const organizationId = await getActiveOrganizationId(ctx, user._id);
  if (!organizationId) {
    throw new Error("No organization selected");
  }

  // Get member record to verify membership and get role
  const member = await getMember(ctx, user._id, organizationId);
  if (!member) {
    throw new Error("Not a member of this organization");
  }

  return {
    user: {
      _id: user._id,
      email: user.email,
      name: user.name,
    },
    organizationId,
    role: member.role as Role,
  };
}

/**
 * Require a minimum role for the current user
 * Throws if user doesn't have sufficient permissions
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  minimumRole: Role
): Promise<AuthContext> {
  const authContext = await getCurrentUserWithOrg(ctx);

  const userRoleLevel = ROLE_HIERARCHY[authContext.role] || 0;
  const requiredLevel = ROLE_HIERARCHY[minimumRole];

  if (userRoleLevel < requiredLevel) {
    throw new Error(
      `Insufficient permissions. Required: ${minimumRole}, Current: ${authContext.role}`
    );
  }

  return authContext;
}

/**
 * Check if user can view (any authenticated member)
 */
export async function canView(ctx: QueryCtx | MutationCtx): Promise<AuthContext> {
  return getCurrentUserWithOrg(ctx);
}

/**
 * Check if user can edit (member or higher)
 */
export async function canEdit(ctx: MutationCtx): Promise<AuthContext> {
  return requireRole(ctx, "member");
}

/**
 * Check if user can delete (admin or higher)
 */
export async function canDelete(ctx: MutationCtx): Promise<AuthContext> {
  return requireRole(ctx, "admin");
}

/**
 * Check if user can manage (owner only)
 */
export async function canManage(ctx: MutationCtx): Promise<AuthContext> {
  return requireRole(ctx, "owner");
}
