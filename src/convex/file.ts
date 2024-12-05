import { getFileType } from "@/lib/utils";
import { ConvexError, v } from "convex/values";
import type { Id } from "./_generated/dataModel";
import { mutation, query } from "./_generated/server";

export const generateUploadUrl = mutation(async (ctx) => {
  return await ctx.storage.generateUploadUrl();
});

export const saveFile = mutation({
  args: {
    file: v.object({ name: v.string(), size: v.number() }),
    ownerId: v.string(),
    accountId: v.string(),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const fileUrl = await ctx.storage.getUrl(args.storageId);

    if (!fileUrl) {
      throw new ConvexError("File not found");
    }

    const fileData = {
      accountId: args.accountId,
      bucketFileId: args.storageId,
      owner: args.ownerId as Id<"user">,
      name: args.file.name,
      url: fileUrl,
      users: [],
      extension: getFileType(args.file.name).extension,
      size: args.file.size,
      type: getFileType(args.file.name).type as
        | "document"
        | "image"
        | "video"
        | "audio"
        | "other",
    };

    await ctx.db.insert("file", fileData);

    return fileData;
  },
});

export const getFiles = query({
  args: {
    type: v.string(),
    searchText: v.string(),
    accountId: v.string(),
  },
  handler: async (ctx, { accountId, type = "", searchText = "" }) => {
    let fileTypes: string[];

    switch (type) {
      case "documents":
        fileTypes = ["document"];
        break;
      case "images":
        fileTypes = ["image"];
        break;
      case "media":
        fileTypes = ["video", "audio"];
        break;
      case "others":
        fileTypes = ["other"];
        break;
      case "":
        // When type is empty, we want all types
        fileTypes = []; // An empty array indicates all types
        break;
      default:
        fileTypes = ["document"];
    }

    // Build the query for owned files
    let ownedFilesQuery = ctx.db.query("file");

    if (searchText.trim() !== "") {
      // @ts-expect-error - TS doesn't know about withSearchIndex
      ownedFilesQuery = ownedFilesQuery.withSearchIndex("by_name", (q) =>
        q.search("name", searchText),
      );
    }

    // Build the filter conditions
    ownedFilesQuery = ownedFilesQuery.filter((q) => {
      // Base condition: files owned by the user
      const conditions = [q.eq(q.field("accountId"), accountId)];

      // Add file type conditions if fileTypes is not empty
      if (fileTypes.length > 0) {
        conditions.push(
          q.or(...fileTypes.map((type) => q.eq(q.field("type"), type))),
        );
      }

      return q.and(...conditions);
    });

    const ownedFiles = await ownedFilesQuery.collect();

    // Build the query for shared files
    let sharedFilesQuery = ctx.db.query("file");

    if (searchText.trim() !== "") {
      // @ts-expect-error - TS doesn't know about withSearchIndex
      sharedFilesQuery = sharedFilesQuery.withSearchIndex("by_name", (q) =>
        q.search("name", searchText),
      );
    }

    // Build the filter conditions
    sharedFilesQuery = sharedFilesQuery.filter((q) => {
      // Base condition: files not owned by the user
      const conditions = [q.neq(q.field("accountId"), accountId)];

      // Add file type conditions if fileTypes is not empty
      if (fileTypes.length > 0) {
        conditions.push(
          q.or(...fileTypes.map((type) => q.eq(q.field("type"), type))),
        );
      }

      return q.and(...conditions);
    });

    const potentialSharedFiles = await sharedFilesQuery.collect();

    // Filter shared files where the user's accountId is in the users array
    const sharedFiles = potentialSharedFiles.filter(
      (file) => Array.isArray(file.users) && file.users.includes(accountId),
    );

    // Combine owned and shared files
    const allFiles = [...ownedFiles, ...sharedFiles];

    return allFiles;
  },
});

export const renameFile = mutation({
  args: {
    fileId: v.id("file"),
    name: v.string(),
    extension: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.fileId, {
      name: `${args.name}.${args.extension}`,
    });

    return true;
  },
});

export const deleteFile = mutation({
  args: {
    fileId: v.id("file"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    await ctx.storage.delete(args.storageId);
    await ctx.db.delete(args.fileId);

    return true;
  },
});

export const updateFileUsers = mutation({
  args: {
    fileId: v.id("file"),
    emails: v.array(v.string()),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }

    const allUsers = await ctx.db.query("user").collect();

    const users = allUsers.filter((user) => args.emails.includes(user.email));

    const clerkIds = users.map((user) => user.accountId);

    const existingClerkIds = file.users || [];
    const combinedClerkIds = [...new Set([...clerkIds, ...existingClerkIds])];

    await ctx.db.patch(args.fileId, {
      users: combinedClerkIds,
    });

    return true;
  },
});

export const removeFileUser = mutation({
  args: {
    fileId: v.id("file"),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const file = await ctx.db.get(args.fileId);
    if (!file) {
      throw new ConvexError("File not found");
    }

    const existingClerkIds = file.users || [];
    const newClerkIds = existingClerkIds.filter((id) => id !== args.clerkId);

    await ctx.db.patch(args.fileId, {
      users: newClerkIds,
    });

    return true;
  },
});

export const getTotalSpace = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("user")
      .filter((q) => q.eq(q.field("accountId"), args.clerkId))
      .unique();

    if (!user) {
      throw new Error("User not found.");
    }

    const files = await ctx.db
      .query("file")
      .filter((q) => q.eq(q.field("accountId"), args.clerkId))
      .collect();

    const totalSpace = {
      image: { size: 0, latestDate: "" },
      document: { size: 0, latestDate: "" },
      video: { size: 0, latestDate: "" },
      audio: { size: 0, latestDate: "" },
      other: { size: 0, latestDate: "" },
      used: 0,
      all: 2 * 1024 * 1024 * 1024, // 2GB available bucket storage
    };

    files.forEach((file) => {
      const fileType = file.type;
      const fileSize = file.size || 0;
      const fileTime = file._creationTime;

      // Accumulate the size
      totalSpace[fileType].size += fileSize;
      totalSpace.used += fileSize;

      // Update latestDate if this file is more recent
      const fileDate = new Date(fileTime).toISOString();
      if (
        !totalSpace[fileType].latestDate ||
        new Date(fileDate) > new Date(totalSpace[fileType].latestDate)
      ) {
        totalSpace[fileType].latestDate = fileDate;
      }
    });

    return totalSpace;
  },
});
