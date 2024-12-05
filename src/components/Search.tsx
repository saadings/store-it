"use client";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useQuery } from "convex/react";
import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Input } from "./ui/input";
import Thumbnail from "./Thumbnail";
import FormattedDateTime from "./FormattedDateTime";
import type { Doc } from "@/convex/_generated/dataModel";
import { useDebounce } from "use-debounce";

const Search = () => {
  const user = useUser();
  const router = useRouter();
  const path = usePathname();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("query") || "";
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(true);

  const [debouncedQuery] = useDebounce(query, 300);

  const queryArgs = useMemo(
    () => ({
      searchText: debouncedQuery,
      accountId: user.user?.id || "",
      type: "",
    }),
    [debouncedQuery, user.user?.id],
  );

  const searchFiles = useQuery(api.file.getFiles, queryArgs);

  useEffect(() => {
    if (!searchQuery) {
      setQuery("");
    }
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedQuery.trim() !== "") {
      setOpen(true);
    } else {
      setOpen(false);
      router.push(path.replace(searchParams.toString(), ""));
    }
  }, [debouncedQuery, searchParams, path, router]);

  const handleClickItem = (file: Doc<"file">) => {
    setOpen(false);

    router.push(
      `/${file.type === "video" || file.type === "audio" ? "media" : file.type + "s"}?query=${debouncedQuery}`,
    );
  };

  return (
    <div className="search">
      <div className="search-input-wrapper">
        <Image
          src="/assets/icons/search.svg"
          alt="search"
          width={24}
          height={24}
        />
        <Input
          value={query}
          placeholder="Search"
          className="search-input"
          onChange={(e) => setQuery(e.target.value)}
        />

        {open && (
          <ul className="search-result">
            {searchFiles && searchFiles.length > 0 ? (
              searchFiles.map((file) => (
                <li
                  key={file._id}
                  className="flex items-center justify-between"
                  onClick={() => handleClickItem(file)}
                >
                  <div className="flex cursor-pointer items-center gap-4">
                    <Thumbnail
                      url={file.url}
                      type={file.type}
                      extension={file.extension}
                      className="!size-9 !min-w-9"
                    />
                    <p className="subtitle-2 line-clamp-1 text-light-100">
                      {file.name}
                    </p>
                  </div>

                  <FormattedDateTime
                    date={file._creationTime.toString()}
                    className="caption line-clamp-1"
                  />
                </li>
              ))
            ) : (
              <p className="empty-result">No files found</p>
            )}
          </ul>
        )}
      </div>
    </div>
  );
};

export default Search;
