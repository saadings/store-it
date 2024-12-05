import { defineTable } from "convex/server";
import { v } from "convex/values";

const userSchema = defineTable({
  fullName: v.string(),
  email: v.string(),
  avatar: v.optional(v.string()),
  accountId: v.string(),
}).index("by_email", ["email"]);

export default userSchema;
