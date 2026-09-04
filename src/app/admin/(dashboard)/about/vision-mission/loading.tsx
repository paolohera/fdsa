import { SkeletonPageHeader, SkeletonListCard, Skeleton } from "@/components/admin/admin-ui";

export default function VisionMissionLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-64" descriptionWidth="w-80" />
      <SkeletonListCard rows={2} renderRow={() => (
        <div className="grid max-w-2xl grid-cols-1 gap-6 sm:grid-cols-3">
          <div className="sm:col-span-2">
            <Skeleton className="h-20 w-full" />
          </div>
          <div className="sm:col-span-1">
            <Skeleton className="h-20 w-full" />
          </div>
        </div>
      )} />
    </div>
  );
}