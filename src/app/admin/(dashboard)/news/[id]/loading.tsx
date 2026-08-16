import { AdminCard, Skeleton } from "@/components/admin/admin-ui";

export default function EditPostLoading() {
  return (
    <div>
      <Skeleton className="mb-6 h-4 w-24" />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <AdminCard className="p-6">
            <Skeleton className="h-8 w-2/3 border-b border-ink/10 pb-3" />
            <Skeleton className="mt-4 h-5 w-1/3" />
            <div className="mt-5 space-y-2 border-t border-ink/10 pt-5">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-5/6" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </AdminCard>
        </div>

        <div className="space-y-6 lg:col-span-1">
          <AdminCard className="p-5">
            <Skeleton className="h-5 w-24 border-b border-ink/10 pb-3" />
            <Skeleton className="mt-4 h-6 w-full" />
            <Skeleton className="mt-5 h-10 w-full" />
          </AdminCard>

          <AdminCard className="p-5">
            <Skeleton className="h-5 w-32 border-b border-ink/10 pb-3" />
            <Skeleton className="mt-4 aspect-[4/3] w-full" />
          </AdminCard>
        </div>
      </div>
    </div>
  );
}
