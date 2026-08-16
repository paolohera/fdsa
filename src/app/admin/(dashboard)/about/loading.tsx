import { AdminCard, Skeleton, SkeletonPageHeader } from "@/components/admin/admin-ui";

export default function AboutLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-72" descriptionWidth="w-full" />

      <AdminCard className="max-w-sm p-4">
        <Skeleton className="aspect-[4/3] w-full" />
        <div className="mt-4 flex items-center gap-2">
          <Skeleton className="h-9 flex-1" />
          <Skeleton className="h-9 w-24" />
        </div>
      </AdminCard>
    </div>
  );
}
