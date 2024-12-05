"use server";

import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";
import { fetchMutation } from "convex/nextjs";
import { revalidatePath } from "next/cache";

export const uploadFile = async ({
  file,
  ownerId,
  accountId,
  storageId,
  path,
}: {
  file: { name: string; size: number };
  ownerId: string;
  accountId: string;
  storageId: Id<"_storage">;
  path: string;
}) => {
  const res = await fetchMutation(api.file.saveFile, {
    file: {
      name: file.name,
      size: file.size,
    },
    ownerId,
    accountId,
    storageId,
  });

  revalidatePath(path);
  // revalidatePath("/");
  return res;
};

export const renameFile = async ({
  fileId,
  name,
  extension,
  path,
}: {
  fileId: Id<"file">;
  name: string;
  extension: string;
  path: string;
}) => {
  const res = await fetchMutation(api.file.renameFile, {
    fileId,
    name,
    extension,
  });

  revalidatePath(path);
  return res;
};

export const shareFile = async ({
  fileId,
  emails,
  path,
}: {
  fileId: Id<"file">;
  emails: string[];
  path: string;
}) => {
  const res = await fetchMutation(api.file.updateFileUsers, {
    fileId,
    emails,
  });
  revalidatePath(path);

  return res;
};

export const removeFileUser = async ({
  fileId,
  clerkId,
  path,
}: {
  fileId: Id<"file">;
  clerkId: string;
  path: string;
}) => {
  const res = await fetchMutation(api.file.removeFileUser, {
    fileId,
    clerkId,
  });

  revalidatePath(path);
  return res;
};

export const deleteFile = async ({
  fileId,
  storageId,
  path,
}: {
  fileId: Id<"file">;
  storageId: Id<"_storage">;
  path: string;
}) => {
  const res = await fetchMutation(api.file.deleteFile, {
    fileId,
    storageId,
  });

  revalidatePath(path);
  // revalidatePath("/");

  return res;
};
