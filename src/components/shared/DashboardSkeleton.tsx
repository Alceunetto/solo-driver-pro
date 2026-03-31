import { ShimmerSkeleton } from "@/components/shared/ShimmerSkeleton";

export function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <header className="glass-header sticky top-0 z-50">
        <div className="container flex items-center justify-between py-3">
          <div className="flex items-center gap-3">
            <ShimmerSkeleton className="w-10 h-10 rounded-2xl" />
            <div className="space-y-1.5">
              <ShimmerSkeleton className="h-5 w-24" />
              <ShimmerSkeleton className="h-3 w-32" />
            </div>
          </div>
          <div className="flex gap-2">
            <ShimmerSkeleton className="w-9 h-9 rounded-xl" />
            <ShimmerSkeleton className="w-9 h-9 rounded-xl" />
          </div>
        </div>
      </header>

      <main className="container py-5 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="glass-card p-4 space-y-3">
              <div className="flex items-center gap-2">
                <ShimmerSkeleton className="w-8 h-8 rounded-xl" />
                <ShimmerSkeleton className="h-3 w-16" />
              </div>
              <ShimmerSkeleton className="h-8 w-24" />
              <ShimmerSkeleton className="h-3 w-32" />
            </div>
          ))}
        </div>

        <div className="glass-card p-4">
          <ShimmerSkeleton className="h-4 w-48 mb-4" />
          <ShimmerSkeleton className="h-[180px] w-full rounded-xl" />
        </div>

        <div className="glass-card p-4 space-y-3">
          <ShimmerSkeleton className="h-4 w-32" />
          {Array.from({ length: 3 }).map((_, i) => (
            <ShimmerSkeleton key={i} className="h-20 w-full rounded-xl" />
          ))}
        </div>
      </main>
    </div>
  );
}
