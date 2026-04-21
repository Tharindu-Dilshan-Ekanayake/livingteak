type ProductCardProps = {
  name: string
  price: number
  description?: string
  imageUrl?: string
  active?: boolean
  currencyLabel?: string
}

export default function ProductCard({
  name,
  price,
  description,
  imageUrl,
  active = true,
  currencyLabel = 'LKR',
}: ProductCardProps) {
  return (
    <article className="group flex h-full min-h-55 flex-col overflow-hidden rounded-xl border border-white/10 bg-white/5 text-white transition hover:border-emerald-500/40">
      <div className="relative h-28 w-full overflow-hidden bg-black/40 sm:h-36">
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs uppercase tracking-[0.3em] text-white/40">
            No Image
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold leading-tight text-white sm:text-base">{name}</h3>
          {active ? (
            <span className="rounded-full border border-emerald-400/40 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-emerald-300">
              Active
            </span>
          ) : (
            <span className="rounded-full border border-white/20 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] text-white/50">
              Inactive
            </span>
          )}
        </div>

        <p className="text-xs text-white/80 sm:text-sm">
          <span className="text-[10px] font-semibold text-emerald-300 sm:text-xs">{currencyLabel} </span>
          {price.toFixed(2)}
        </p>

        {description ? (
          <p className="text-xs text-white/70 line-clamp-2 sm:text-sm">{description}</p>
        ) : null}

        <button
          type="button"
          className="mt-auto inline-flex w-full items-center justify-center rounded-lg border border-emerald-500/40 px-3 py-2 text-xs font-semibold text-emerald-300 transition hover:border-emerald-400/70 hover:text-emerald-200"
        >
          Add to cart
        </button>
      </div>
    </article>
  )
}
