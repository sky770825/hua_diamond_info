import { Skeleton } from "@/components/ui/skeleton";

const MemberCardSkeleton = () => (
  <div className="rounded-xl overflow-hidden border border-border/50 bg-card/80 flex flex-col">
    <Skeleton className="w-full aspect-[4/3] shrink-0 rounded-none" />
    <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3">
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-3 w-12" />
        <Skeleton className="h-6 w-24" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-10 w-full ml-6" />
      </div>
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4 rounded" />
          <Skeleton className="h-4 w-16" />
        </div>
        <div className="space-y-1.5 ml-6">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-[85%]" />
          <Skeleton className="h-4 w-[60%]" />
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5 mt-auto pt-2">
        <Skeleton className="h-5 w-14 rounded-md" />
        <Skeleton className="h-5 w-16 rounded-md" />
        <Skeleton className="h-5 w-12 rounded-md" />
      </div>
    </div>
  </div>
);

export default MemberCardSkeleton;
