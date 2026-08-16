import { Skeleton, SkeletonPageHeader, SkeletonListCard } from "@/components/admin/admin-ui";

export default function NewsLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-40" descriptionWidth="w-64" actionWidth="w-28" />

      <SkeletonListCard
        rows={5}
        renderRow={() => (
          <>
            <Skeleton className="h-12 w-16 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-1/3" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-8 shrink-0" />
          </>
        )}
      />
    </div>
  );
}
