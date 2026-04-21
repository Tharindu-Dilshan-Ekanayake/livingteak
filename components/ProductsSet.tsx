import ProductCard from '@/components/ProductCard'

export type ProductCardItem = {
  id: string
  name: string
  price: number
  description?: string
  imageUrl?: string
  active?: boolean
}

type ProductsSetProps = {
  title?: string
  items: ProductCardItem[]
  emptyMessage?: string
}

export default function ProductsSet({
  title = 'Products',
  items,
  emptyMessage = 'No products found.',
}: ProductsSetProps) {
  return (
    <section className="flex flex-col gap-6">
      <header className="flex items-center justify-between">
       
       
      </header>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 px-6 py-10 text-center text-sm text-white/60">
          {emptyMessage}
        </div>
      ) : (
        <div className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {items.map((item) => (
            <ProductCard
              key={item.id}
              id={item.id}
              name={item.name}
              price={item.price}
              description={item.description}
              imageUrl={item.imageUrl}
              active={item.active}
            />
          ))}
        </div>
      )}
    </section>
  )
}
