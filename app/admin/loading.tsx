export default function AdminLoading() {
  return (
    <div>
      {/* title */}
      <div className="mb-4 h-9 w-48 animate-pulse rounded bg-muted-surface" />

      {/* filter tabs */}
      <div className="mb-5 flex flex-wrap gap-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="h-9 w-20 animate-pulse rounded-full bg-muted-surface"
          />
        ))}
      </div>

      {/* card rows */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-4">
            <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-muted-surface" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted-surface" />
            <div className="mb-2 h-3 w-4/5 animate-pulse rounded bg-muted-surface" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
