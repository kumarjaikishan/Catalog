import { getItemImage, getWsPrice, safeText } from './shared'

export const Theme4 = ({ catalog }) => {
  return (
    <div className="space-y-8 bg-[#f3f4f6] p-6">
      {catalog.map((category) => (
        <section key={category.id || category.name}>
          <h2 className="mb-4 text-xl font-bold text-[#111827]">{safeText(category.name)}</h2>

          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {category.items.map((item) => (
              <article key={item.id || `${item.name}-${item.modelNumber}`} className="rounded-lg border border-[#e5e7eb] bg-[#ffffff] p-3 shadow-sm">
                {getItemImage(item) ? <img src={getItemImage(item)} alt={safeText(item.name)} className="mb-2 h-28 w-full object-contain" /> : <div className="mb-2 flex h-28 w-full items-center justify-center border border-[#d1d5db] text-[10px] text-[#6b7280]">NO IMAGE</div>}

                <h3 className="break-words text-sm font-semibold text-[#111827]">{safeText(item.name)}</h3>

                <div className="mt-2 space-y-1 text-xs text-[#374151]">
                  {(item.variants?.length
                    ? item.variants
                    : [{ id: `${item.id}-fallback`, name: item.modelNumber, price: '-', description: '' }]
                  )
                    .slice(0, 3)
                    .map((variant, index) => (
                      <div key={variant.id || `${item.id || item.name}-${index}`} className="break-words">
                        {safeText(variant.name || item.modelNumber)} | <span className="text-sm font-bold">{safeText(variant.price)}</span> | WS: <span className="text-sm font-bold">{getWsPrice(variant.description)}</span>
                      </div>
                    ))}

                  {item.variants?.length > 3 ? (
                    <div className="text-[10px] text-[#6b7280]">+{item.variants.length - 3} more variants</div>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
