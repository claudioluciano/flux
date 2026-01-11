# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Flux is a modular SaaS business management platform for Brazilian SMBs. Uses a modular architecture where users subscribe to individual Apps (Admin is always-on, Financial/Inventory/HR are paid modules). Built with Next.js 16 + Convex + Better Auth.

## Commands

```bash
bun dev          # Start Next.js dev server
bun build        # Build for production
bun lint         # Run ESLint
bunx convex dev   # Start Convex dev server (run alongside bun dev)
```

## Tech Stack

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript (strict)
- **Backend:** Convex (real-time database + functions)
- **Auth:** Better Auth with `@convex-dev/better-auth` integration
- **UI:** Base UI + shadcn components, Tailwind CSS 4, Lucide icons
- **Package Manager:** Bun

## Architecture

### App Modules

Each business function is a separate App with dependencies:

```
Admin (Core) ← Financial, Inventory, HR (all depend on Admin)
```

When multiple apps are enabled, they integrate (e.g., Financial + Inventory enables enhanced quotes with products/services).

### Key Directories

- `app/` - Next.js App Router pages and API routes
- `convex/` - Convex backend functions and schema
- `convex/betterAuth/` - Better Auth database adapter and schema
- `components/ui/` - shadcn UI components (Base UI style)
- `lib/` - Utilities: `auth-client.ts` (frontend auth), `auth-server.ts` (server auth), `utils.ts` (className helpers)
- `docs/` - Product specs and app documentation

### Authentication Flow

1. Server-side: `getToken()` from `lib/auth-server.ts` preloads token in root layout
2. Client-side: `ConvexBetterAuthProvider` wraps app with auth context
3. Use `authClient` from `lib/auth-client.ts` for `signIn`, `signUp`, `signOut`, `useSession`
4. Convex functions access user via `authComponent.getAuthUser(ctx)`

### Convex Patterns

- Schema defined in `convex/schema.ts` (auth tables in `convex/betterAuth/schema.ts`)
- HTTP routes in `convex/http.ts` handle auth callbacks
- Use `convex.config.ts` to register components (betterAuth is already registered)

## Environment Variables

Required in `.env.local`:

- `CONVEX_DEPLOYMENT` - Convex deployment identifier
- `NEXT_PUBLIC_CONVEX_URL` - Convex API endpoint
- `NEXT_PUBLIC_CONVEX_SITE_URL` - Convex site URL for OAuth
- `NEXT_PUBLIC_SITE_URL` - App URL (localhost:3000 in dev)

## Styling

- Uses CSS custom properties with OKLch colors
- Dark mode via `.dark` class
- Use `cn()` from `lib/utils.ts` to merge Tailwind classes
- Components use CVA (class-variance-authority) for variants
