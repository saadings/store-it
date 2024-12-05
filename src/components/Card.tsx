import type { Doc } from "@/convex/_generated/dataModel";
import Link from "next/link";
import Thumbnail from "./Thumbnail";
import { convertFileSize } from "@/lib/utils";
import FormattedDateTime from "./FormattedDateTime";
import { fetchQuery } from "convex/nextjs";
import { api } from "@/convex/_generated/api";
import ActionDropDown from "./ActionDropDown";

const Card = async (file: Doc<"file">) => {
  const { name, size, _creationTime, owner, url, type, extension } = file;
  const user = await fetchQuery(api.users.getUserById, { userId: owner });

  return (
    <Link href={url} target="_blank" className="file-card">
      <div className="flex justify-between">
        <Thumbnail
          url={url}
          type={type}
          extension={extension}
          className="!size-20"
          imageClassName="!size-11"
        />
        <div className="flex flex-col items-end justify-between">
          <ActionDropDown file={file} user={user} />
          <p className="body-1">{convertFileSize(size ?? 0)}</p>
        </div>
      </div>

      <div className="file-card-details">
        <p className="subtitle-2 line-clamp-1">{name}</p>
        <FormattedDateTime date={_creationTime.toString()} />
        <p className="caption line-clamp-1 text-light-200">
          By: {user.fullName}
        </p>
      </div>
    </Link>
  );
};

export default Card;
