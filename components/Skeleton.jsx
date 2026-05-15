export function SkeletonBox({ className = "" }) {
  return <div className={`animate-pulse rounded-md bg-[#EAE4D8] ${className}`} />;
}

export function SkeletonRow({ cols = 4 }) {
  return (
    <tr className="border-b border-[#EAE4D8]">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="py-3 px-4">
          <SkeletonBox className={`h-4 ${i === 0 ? "w-32" : i === 1 ? "w-24" : "w-16"}`} />
        </td>
      ))}
    </tr>
  );
}

export function SkeletonTable({ rows = 5, cols = 4 }) {
  return (
    <div className="card-soft overflow-hidden">
      <div className="divide-y divide-[#EAE4D8]">
        {Array.from({ length: rows }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 px-5 py-4">
            {Array.from({ length: cols }).map((_, j) => (
              <SkeletonBox key={j} className={`h-4 ${j === 0 ? "w-1/3" : "w-1/6"}`} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonCards({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="card-soft p-5 space-y-3">
          <div className="flex justify-between">
            <SkeletonBox className="h-3 w-20" />
            <SkeletonBox className="h-5 w-5 rounded" />
          </div>
          <SkeletonBox className="h-8 w-28" />
        </div>
      ))}
    </div>
  );
}
