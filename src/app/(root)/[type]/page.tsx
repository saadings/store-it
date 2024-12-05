import Card from "@/components/Card";
import Sort from "@/components/Sort";
import { api } from "@/convex/_generated/api";
import { convertFileSize } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";

const TypePage = async ({
  params,
  searchParams,
}: {
  params: Promise<{
    type?: string;
  }>;
  searchParams: Promise<{
    query?: string;
    sort?: "asc" | "desc";
  }>;
}) => {
  const type = ((await params)?.type as string) || "";
  const searchText = ((await searchParams)?.query as string) || "";

  const user = await currentUser();

  const files = await fetchQuery(api.file.getFiles, {
    accountId: user?.id ?? "",
    type,
    searchText,
  });

  const totalSize = convertFileSize(
    files.reduce((acc, file) => acc + (file.size ?? 0), 0),
  );

  return (
    <div className="page-container">
      <section className="w-full">
        <h1 className="h1 capitalize">{type}</h1>

        <div className="total-size-section">
          <p className="body-1">
            Total: <span className="h-5">{totalSize}</span>
          </p>

          <div className="sort-container">
            <p className="body-1 hidden text-light-200 sm:block">Sort by:</p>

            <Sort />
          </div>
        </div>
      </section>

      {files.length > 0 ? (
        <section className="file-list">
          {files.map((file) => (
            <Card key={file._id} {...file} />
          ))}
        </section>
      ) : (
        <p className="empty-list">No files uploaded</p>
      )}
    </div>
  );
};

export default TypePage;
