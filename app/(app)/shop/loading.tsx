function CardSkeleton() {
  return (
    <div className="flex w-40 flex-col overflow-hidden rounded-xl border border-border bg-card sm:w-48 md:w-56">
      {/* Header */}
      <div className="px-2 pt-2 sm:px-3 sm:pt-3">
        <div className="flex items-center justify-between gap-1">
          <div className="h-3.5 w-20 animate-pulse rounded bg-muted sm:h-4" />
          <div className="h-3.5 w-8 animate-pulse rounded bg-muted sm:h-4" />
        </div>
      </div>

      {/* Visual area */}
      <div className="flex min-h-28 flex-1 items-center justify-center px-2 pb-2 sm:min-h-0 sm:px-3 sm:pb-3">
        <div className="h-20 w-20 animate-pulse rounded-lg bg-muted sm:h-24 sm:w-24 md:h-32 md:w-32" />
      </div>
    </div>
  );
}

export default function ShopLoading() {
  return (
    <div className="size-full p-4 pt-8 pb-24">
      <div className="mx-auto grid w-fit grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
        <CardSkeleton key="s1" />
        <CardSkeleton key="s2" />
        <CardSkeleton key="s3" />
        <CardSkeleton key="s4" />
      </div>
    </div>
  );
}
