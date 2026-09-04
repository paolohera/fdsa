import { SkeletonPageHeader, SkeletonListCard, Skeleton } from "@/components/admin/admin-ui";

export default function CoreValuesLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-56" descriptionWidth="w-72" />
      <SkeletonListCard rows={4} renderRow={() => (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Skeleton className="h-28 w-full" />
          <Skeleton className="h-28 w-full" />
        </div>
      )} />
    </div>
  );
}