import { defineTable } from "convex/server";
import { v } from "convex/values";

const fileSchema = defineTable({
  name: v.string(),
  url: v.string(),
  type: v.union(
    v.literal("document"),
    v.literal("image"),
    v.literal("video"),
    v.literal("audio"),
    v.literal("other"),
  ),
  extension: v.optional(v.string()),
  size: v.optional(v.number()),
  bucketFileId: v.id("_storage"),
  accountId: v.string(),
  users: v.array(v.string()),
  owner: v.id("user"),
})
  .index("by_type", ["type"])
  .searchIndex("by_name", {
    searchField: "name",
    filterFields: ["type"],
  });

export default fileSchema;
