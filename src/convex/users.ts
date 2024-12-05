import { ConvexError, v } from "convex/values";

import { internalMutation, query } from "./_generated/server";

export const getUserById = query({
  args: { userId: v.id("user") },
  async handler(ctx, args) {
    const user = await ctx.db.get(args.userId);

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("accountId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    return user;
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("user", {
      accountId: args.clerkId,
      email: args.email,
      avatar: args.imageUrl,
      fullName: args.name,
    });
  },
});

export const updateUser = internalMutation({
  args: {
    clerkId: v.string(),
    imageUrl: v.string(),
    email: v.string(),
  },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("accountId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    await ctx.db.patch(user._id, {
      avatar: args.imageUrl,
      email: args.email,
    });
  },
});

export const deleteUser = internalMutation({
  args: { clerkId: v.string() },
  async handler(ctx, args) {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("accountId"), args.clerkId))
      .unique();

    if (!user) {
      throw new ConvexError("User not found");
    }

    const files = await ctx.db
      .query("file")
      .filter((q) => q.eq(q.field("owner"), user._id))
      .collect();

    for (const file of files) {
      await ctx.storage.delete(file.bucketFileId);
      await ctx.db.delete(file._id);
    }

    await ctx.db.delete(user._id);
  },
});
