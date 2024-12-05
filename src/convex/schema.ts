import fileSchema from "@/schemas/file";
import userSchema from "@/schemas/user";
import { defineSchema } from "convex/server";

export default defineSchema({
  user: userSchema,
  file: fileSchema,
});
