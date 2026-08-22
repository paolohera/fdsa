import { AdminCard, Skeleton, SkeletonPageHeader } from "@/components/admin/admin-ui";

export default function HeroLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-64" descriptionWidth="w-96" />

      <AdminCard className="max-w-2xl p-6">
        <Skeleton className="aspect-[16/7] w-full" />
        <Skeleton className="mt-5 h-10 w-full" />
      </AdminCard>
    </div>
  );
}