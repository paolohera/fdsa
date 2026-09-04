import { SkeletonPageHeader, SkeletonListCard, Skeleton } from "@/components/admin/admin-ui";

export default function MessagesLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-40" descriptionWidth="w-64" />
      <SkeletonListCard rows={5} renderRow={() => (
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-20" />
            </div>
            <Skeleton className="mt-2 h-4 w-48" />
            <Skeleton className="mt-2 h-10 w-full" />
            <Skeleton className="mt-2 h-3 w-32" />
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
      )} />
    </div>
  );
}