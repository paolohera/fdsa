import { SkeletonPageHeader, SkeletonListCard, Skeleton } from "@/components/admin/admin-ui";

export default function EnrollmentLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-64" descriptionWidth="w-80" actionWidth="w-40" />
      <SkeletonListCard rows={5} renderRow={() => (
        <div className="flex items-center gap-4 p-4">
          <Skeleton className="h-5 w-48" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-28" />
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-5 w-16" />
        </div>
      )} />
    </div>
  );
}