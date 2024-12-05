import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-[50px] w-[200px] rounded-lg" />
        <Skeleton className="h-[25px] w-[100px] rounded-lg" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        <Skeleton className="h-[210px] w-full rounded-2xl" />
        <Skeleton className="h-[210px] w-full rounded-2xl" />
        <Skeleton className="h-[210px] w-full rounded-2xl" />
        <Skeleton className="h-[210px] w-full rounded-2xl" />
      </div>
    </div>
  );
}
