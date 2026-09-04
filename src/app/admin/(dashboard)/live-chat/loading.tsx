import { SkeletonPageHeader, SkeletonListCard, Skeleton } from "@/components/admin/admin-ui";

export default function LiveChatLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-40" descriptionWidth="w-64" />
      <SkeletonListCard rows={5} renderRow={() => (
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-5 w-20" />
        </div>
      )} />
    </div>
  );
}