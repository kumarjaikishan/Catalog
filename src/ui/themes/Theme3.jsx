import { getItemImage, getWsPrice, safeText } from './shared'

export const Theme3 = ({ catalog }) => {
  return (
    <div className="space-y-8 bg-[#ffffff] p-6">
      {catalog.map((category) => (
        <section key={category.id || category.name}>
          <h2 className="mb-4 border-b border-[#d1d5db] pb-2 text-lg font-semibold text-[#111827]">{safeText(category.name)}</h2>

          <div className="space-y-3">
            {category.items.map((item) => (
              <article
                key={item.id || `${item.name}-${item.modelNumber}`}
                className="flex gap-4 border-b border-[#e5e7eb] py-3"
              >
                {getItemImage(item) ? (
                  <img
                    src={getItemImage(item)}
                    alt={safeText(item.name)}
                    className="h-24 w-24 shrink-0 rounded border border-[#e5e7eb] object-contain"
                  />
                ) : (
                  <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded border border-[#d1d5db] text-[10px] text-[#6b7280]">
                    NO IMAGE
                  </div>
                )}

                <div className="min-w-0 flex-1">
                  <h3 className="break-words text-sm font-bold text-[#111827]">{safeText(item.name)}</h3>
                  <p className="mt-1 break-words text-xs text-[#6b7280]">{safeText(item.description)}</p>

                  <div className="mt-2 space-y-1">
                    {(item.variants?.length
                      ? item.variants
                      : [{ id: `${item.id}-fallback`, name: item.modelNumber, price: '-', description: '' }]
                    ).map((variant, index) => (
                      <div
                        key={variant.id || `${item.id || item.name}-${index}`}
                        className="grid grid-cols-[1fr_auto_auto] gap-2 text-xs text-[#111827]"
                      >
                        <span className="break-words">{safeText(variant.name || item.modelNumber)}</span>
                        <span className="break-words text-sm font-bold">{safeText(variant.price)}</span>
                        <span className="break-words text-sm font-bold">{getWsPrice(variant.description)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
