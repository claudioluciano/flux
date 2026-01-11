import { defineSchema } from "convex/server";

// Empty schema with strict enforcement - tables not defined here will be deleted
// Better Auth tables are managed by the betterAuth component
const schema = defineSchema({}, { strictTableNameTypes: true });

export default schema;
