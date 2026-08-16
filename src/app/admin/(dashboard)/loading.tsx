import { AdminCard, Skeleton, SkeletonPageHeader } from "@/components/admin/admin-ui";

export default function DashboardLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-48" descriptionWidth="w-full max-w-md" />

      <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <AdminCard key={i} className="p-6">
            <div className="mb-8 flex items-start justify-between">
              <Skeleton className="h-3 w-20" />
              <Skeleton className="h-8 w-8" />
            </div>
            <Skeleton className="h-10 w-16" />
          </AdminCard>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <AdminCard className="h-full p-6">
            <Skeleton className="mb-6 h-6 w-32 border-b border-ink/10 pb-4" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          </AdminCard>
        </div>

        <div className="lg:col-span-2">
          <AdminCard className="h-full p-6">
            <Skeleton className="mb-6 h-6 w-36 border-b border-ink/10 pb-4" />
            <div className="space-y-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4">
                  <Skeleton className="h-8 w-8 shrink-0" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-4 w-56" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
