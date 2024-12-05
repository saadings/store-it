import Image from "next/image";
import Link from "next/link";

import { Chart } from "@/components/Chart";
import FormattedDateTime from "@/components/FormattedDateTime";
import { Separator } from "@/components/ui/separator";
// import { getFiles, getTotalSpaceUsed } from "@/lib/actions/file.actions";
import { api } from "@/convex/_generated/api";
import { convertFileSize, getUsageSummary } from "@/lib/utils";
import { currentUser } from "@clerk/nextjs/server";
import { fetchQuery } from "convex/nextjs";
import Thumbnail from "@/components/Thumbnail";
import ActionDropDown from "@/components/ActionDropDown";

const Dashboard = async () => {
  const user = await currentUser();
  const convexUser = await fetchQuery(api.users.getUserByClerkId, {
    clerkId: user?.id ?? "",
  });

  const [files, totalSpace] = await Promise.all([
    fetchQuery(api.file.getFiles, {
      accountId: user?.id ?? "",
      type: "",
      searchText: "",
    }),
    fetchQuery(api.file.getTotalSpace, {
      clerkId: user?.id ?? "",
    }),
  ]);

  const usageSummary = getUsageSummary(totalSpace);

  return (
    <div className="dashboard-container">
      <section>
        <Chart used={totalSpace.used} />

        {/* Uploaded file type summaries */}
        <ul className="dashboard-summary-list">
          {usageSummary.map((summary) => (
            <Link
              href={summary.url}
              key={summary.title}
              className="dashboard-summary-card"
            >
              <div className="space-y-4">
                <div className="flex justify-between gap-3">
                  <Image
                    src={summary.icon}
                    width={100}
                    height={100}
                    alt="uploaded image"
                    className="summary-type-icon"
                  />
                  <h4 className="summary-type-size">
                    {convertFileSize(summary.size) || 0}
                  </h4>
                </div>

                <h5 className="summary-type-title">{summary.title}</h5>
                <Separator className="bg-light-400" />
                <FormattedDateTime
                  date={summary.latestDate}
                  className="text-center"
                />
              </div>
            </Link>
          ))}
        </ul>
      </section>

      <section className="dashboard-recent-files">
        <h2 className="h3 xl:h2 text-light-100">Recent files uploaded</h2>
        {files.length > 0 ? (
          <ul className="mt-5 flex flex-col gap-5">
            {files.map((file) => (
              <Link
                href={file.url}
                target="_blank"
                className="flex items-center gap-3"
                key={file._id}
              >
                <Thumbnail
                  type={file.type}
                  extension={file.extension}
                  url={file.url}
                />

                <div className="recent-file-details">
                  <div className="flex flex-col gap-1">
                    <p className="recent-file-name">{file.name}</p>
                    <FormattedDateTime
                      date={file._creationTime.toString()}
                      className="caption"
                    />
                  </div>
                  <ActionDropDown file={file} user={convexUser} />
                </div>
              </Link>
            ))}
          </ul>
        ) : (
          <p className="empty-list">No files uploaded</p>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
