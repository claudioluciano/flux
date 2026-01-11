import { createAuth } from "../auth";

// Export a static instance for Better Auth schema generation
// This is required for the CLI to generate the schema
export const auth = createAuth({} as any);
