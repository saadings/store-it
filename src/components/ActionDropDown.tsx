"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { actionsDropdownItems } from "@/constants";
import type { Doc } from "@/convex/_generated/dataModel";
import {
  deleteFile,
  removeFileUser,
  renameFile,
  shareFile,
} from "@/server/actions/file.actions";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { FileDetails, ShareInput } from "./ActionsModalContent";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { useToast } from "@/hooks/use-toast";

interface ActionType {
  label: string;
  icon: string;
  value: string;
}

interface ActionDropDownProps {
  file: Doc<"file">;
  user: Doc<"user">;
}

const ActionDropDown = ({ file, user }: ActionDropDownProps) => {
  const { _id, name, url, extension, bucketFileId } = file;
  const pathname = usePathname();
  const { toast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [action, setAction] = useState<ActionType | null>(null);
  const [fileName, setFileName] = useState(name);
  const [isLoading, setIsLoading] = useState(false);
  const [emails, setEmails] = useState<string[]>([]);

  const closeAllModals = () => {
    setIsModalOpen(false);
    setIsDropdownOpen(false);
    setAction(null);
    setFileName(name);
    setEmails([]);
  };

  const handleAction = async () => {
    if (!action) return;

    setIsLoading(true);
    let success = false;

    const actions = {
      rename: () =>
        renameFile({
          fileId: _id,
          name: fileName,
          extension: extension!,
          path: pathname,
        }),
      share: () =>
        shareFile({
          fileId: _id,
          emails,
          path: pathname,
        }),
      delete: () =>
        deleteFile({ fileId: _id, storageId: bucketFileId, path: pathname }),
    };

    success = await actions[action.value as keyof typeof actions]();

    if (success) {
      closeAllModals();
      toast({
        description: `${action.value} successful.`,
        className: "success-toast",
      });
    }

    setIsLoading(false);
  };

  const handleRemoveUser = async (clerkId: string) => {
    await removeFileUser({
      fileId: _id,
      clerkId,
      path: pathname,
    });
  };

  const renderDialogContent = () => {
    if (!action) return null;

    const { value, label } = action;

    return (
      <DialogContent className="shad-dialog button">
        <DialogHeader className="flex flex-col gap-3">
          <DialogTitle className="text-center text-light-100">
            {label}
          </DialogTitle>
          {value === "rename" && (
            <div className="flex flex-row gap-3">
              <Input
                type="text"
                value={fileName.split(".")[0]}
                onChange={(e) => setFileName(e.target.value)}
              />
              <Button disabled variant={"outline"}>
                .{extension}
              </Button>
            </div>
          )}
          {value === "details" && <FileDetails file={file} user={user} />}
          {value === "share" && (
            <ShareInput
              file={file}
              onInputChange={setEmails}
              onRemove={handleRemoveUser}
            />
          )}
          {value === "delete" && (
            <p className="delete-confirmation">
              Are you sure you want to delete?{" "}
              <span className="delete-file-name">{name}</span>
            </p>
          )}
          <DialogDescription className="text-center text-xs text-light-200"></DialogDescription>
        </DialogHeader>
        {["rename", "delete", "share"].includes(value) && (
          <DialogFooter className="flex flex-col gap-2 md:flex-row">
            <Button onClick={closeAllModals} className="modal-cancel-button">
              Cancel
            </Button>
            <Button onClick={handleAction} className="modal-submit-button">
              <p className="capitalize">{value}</p>
              {isLoading && (
                <Image
                  src={"/assets/icons/loader.svg"}
                  alt="loader"
                  width={24}
                  height={24}
                  className="animate-spin"
                />
              )}
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    );
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger className="shad-no-focus">
          <Image
            src={"/assets/icons/dots.svg"}
            alt="options"
            width={24}
            height={24}
          />
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel className="max-w-[200px] truncate">
            {name}
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          {actionsDropdownItems.map(({ value, label, icon }) => (
            <DropdownMenuItem
              key={value}
              className="shad-dropdown-item"
              onClick={() => {
                setAction({ label, icon, value });

                if (["rename", "share", "delete", "details"].includes(value)) {
                  setIsModalOpen(true);
                }
              }}
            >
              {value === "download" ? (
                <Link
                  href={url}
                  download={name}
                  className="flex items-center gap-2"
                >
                  <Image src={icon} alt={label} width={30} height={30} />
                  {label}
                </Link>
              ) : (
                <div className="flex items-center gap-2">
                  <Image src={icon} alt={label} width={30} height={30} />
                  {label}
                </div>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {renderDialogContent()}
    </Dialog>
  );
};

export default ActionDropDown;
