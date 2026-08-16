import { Skeleton, SkeletonPageHeader, SkeletonListCard } from "@/components/admin/admin-ui";

export default function HeroLoading() {
  return (
    <div>
      <SkeletonPageHeader titleWidth="w-64" descriptionWidth="w-96" actionWidth="w-28" />

      <SkeletonListCard
        rows={4}
        renderRow={() => (
          <>
            <Skeleton className="h-4 w-5" />
            <Skeleton className="h-14 w-14 shrink-0 rounded-full" />
            <Skeleton className="h-4 flex-1" />
            <div className="flex items-center gap-1">
              {Array.from({ length: 4 }).map((_, j) => (
                <Skeleton key={j} className="h-8 w-8" />
              ))}
            </div>
          </>
        )}
      />
    </div>
  );
}
