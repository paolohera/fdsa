import { SkeletonPageHeader, SkeletonListCard, Skeleton } from "@/components/admin/admin-ui";

export default function TimelineLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-64" descriptionWidth="w-80" actionWidth="w-32" />
      <SkeletonListCard rows={5} renderRow={() => (
        <div className="flex items-start gap-4 p-4">
          <Skeleton className="h-6 w-16 shrink-0" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
        </div>
      )} />
    </div>
  );
}