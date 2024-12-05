import type { Doc } from "@/convex/_generated/dataModel";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import { convertFileSize } from "@/lib/utils";
import type React from "react";
import { Input } from "./ui/input";
import { useQueries } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useMemo } from "react";
import { Button } from "./ui/button";
import Image from "next/image";

const ImageThumbnail = ({
  type,
  url,
  extension,
  name,
  _creationTime,
}: Doc<"file">) => (
  <div className="file-details-thumbnail">
    <Thumbnail type={type} url={url} extension={extension} />
    <div className="flex flex-col">
      <p className="subtitle-2 mb-1">{name}</p>
      <FormattedDateTime date={_creationTime.toString()} className="caption" />
    </div>
  </div>
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex">
    <p className="file-details-label text-left">{label}</p>
    <p className="file-details-value text-left">{value}</p>
  </div>
);

interface FileDetailsProps {
  file: Doc<"file">;
  user: Doc<"user">;
}

export const FileDetails = ({ file, user }: FileDetailsProps) => {
  return (
    <>
      <ImageThumbnail {...file} />

      <div className="space-y-4 px-2 pt-2">
        <DetailRow label="Format: " value={file.extension ?? "other"} />
        <DetailRow label="Size: " value={convertFileSize(file.size ?? 0)} />
        <DetailRow label="Owner: " value={user.fullName} />
      </div>
    </>
  );
};

interface ShareInputProps {
  file: Doc<"file">;
  onInputChange: React.Dispatch<React.SetStateAction<string[]>>;
  onRemove: (email: string) => void;
}

export const ShareInput = ({
  file,
  onInputChange,
  onRemove,
}: ShareInputProps) => {
  const queries = useMemo(() => {
    return file.users.reduce<
      Record<
        string,
        { query: typeof api.users.getUserByClerkId; args: { clerkId: string } }
      >
    >((acc, clerkId) => {
      acc[clerkId] = {
        query: api.users.getUserByClerkId,
        args: { clerkId },
      };
      return acc;
    }, {});
  }, [file.users]);

  const sharedUsers: {
    [key: string]: Doc<"user">;
  } = useQueries(queries);

  return (
    <>
      <ImageThumbnail {...file} />
      <div className="share-wrapper">
        <p className="subtitle-2 pl-1 text-light-100">
          Share file with other users
        </p>
        <Input
          type="email"
          placeholder="Enter email address"
          onChange={(e) => onInputChange(e.target.value.trim().split(","))}
          className="share-input-field"
        />
        <div className="pt-4">
          <div className="flex justify-between">
            <p className="subtitle-2 text-light-100">Shared with</p>
            <p className="subtitle-2 text-light-200">
              {file.users.length} users
            </p>
          </div>

          <ul className="pt-2">
            {Object?.entries(sharedUsers)?.map(([userId, result]) => (
              <li
                key={userId}
                className="flex items-center justify-between gap-2"
              >
                <p className="subtitle-2">{result?.email}</p>
                <Button
                  onClick={() => onRemove(result?.accountId)}
                  className="share-remove-user"
                >
                  <Image
                    src={"/assets/icons/remove.svg"}
                    alt="remove"
                    width={24}
                    height={24}
                    className="remove-icon"
                  />
                </Button>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </>
  );
};
