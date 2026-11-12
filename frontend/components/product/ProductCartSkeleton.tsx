export default function ProductCardSkeleton() {
  return (
    <div className="card h-full flex flex-col overflow-hidden">
      <div className="skeleton aspect-square" />
      <div className="p-4 flex flex-col gap-2 flex-1">
        <div className="skeleton h-3 w-1/3" />
        <div className="skeleton h-4 w-full" />
        <div className="skeleton h-4 w-2/3" />
        <div className="mt-auto space-y-2">
          <div className="skeleton h-6 w-1/2" />
          <div className="skeleton h-9 w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}