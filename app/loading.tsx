export default function RootLoading() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      {/* breadcrumb */}
      <div className="mb-8 h-4 w-24 animate-pulse rounded bg-muted-surface" />

      {/* title */}
      <div className="mb-6 h-9 w-3/4 animate-pulse rounded bg-muted-surface sm:w-1/2" />

      {/* card rows */}
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card p-5">
            <div className="mb-3 h-5 w-2/3 animate-pulse rounded bg-muted-surface" />
            <div className="mb-2 h-3 w-full animate-pulse rounded bg-muted-surface" />
            <div className="mb-2 h-3 w-5/6 animate-pulse rounded bg-muted-surface" />
            <div className="h-3 w-1/3 animate-pulse rounded bg-muted-surface" />
          </div>
        ))}
      </div>
    </div>
  );
}
