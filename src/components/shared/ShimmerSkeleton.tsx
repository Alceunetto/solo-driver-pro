import { cn } from "@/lib/utils";

interface ShimmerSkeletonProps {
  className?: string;
}

export function ShimmerSkeleton({ className }: ShimmerSkeletonProps) {
  return <div className={cn("rounded-xl shimmer", className)} />;
}
