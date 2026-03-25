import { getItemImage, getWsPrice, safeText } from './shared'

export const Theme1 = ({ catalog }) => {
  return (
    <div className="space-y-8 bg-[#f3f4f6] p-6">
      {catalog.map((category) => (
        <section key={category.id || category.name}>
          <div className="rounded-md bg-[#000000] py-2 text-center text-lg font-bold text-[#ffffff]">
            {safeText(category.name)}
          </div>

          <div className="mt-3 space-y-2">
            {category.items.map((item) => (
              <article
                key={item.id || `${item.name}-${item.modelNumber}`}
                className="overflow-hidden rounded-xl border border-[#e5e7eb] bg-[#ffffff] shadow-sm"
              >
                <div className="grid grid-cols-[44%_56%]">
                  <div className="border-r border-dotted border-[#d1d5db] p-2">
                    {/* <div className="mb-2 inline-block rounded bg-[#dc2626] px-2 py-[2px] text-[10px] text-[#ffffff]">
                      100% ORIGINAL
                    </div> */}

                    <div className="mb-3 flex justify-center">
                      {getItemImage(item) ? (
                        <img
                          src={getItemImage(item)}
                          alt={safeText(item.name)}
                          className="h-28 w-28 object-contain"
                        />
                      ) : (
                        <div className="flex h-28 w-28 items-center justify-center rounded border border-[#d1d5db] text-[10px] text-[#6b7280]">
                          NO IMAGE
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 text-center">
                      <h3 className="break-words text-sm font-bold uppercase">{safeText(item.name)}</h3>
                      <p className="mt-1 break-words text-xs text-[#6b7280]">{safeText(item.description)}</p>
                    </div>
                  </div>

                  <div>
                    <div className="grid grid-cols-3 bg-[#dc2626] text-xs font-semibold text-[#ffffff]">
                      <div className="border-r border-[#ffffff55] p-2 text-center">MODEL</div>
                      <div className="border-r border-[#ffffff55] p-2 text-center">PRICE (QTY)</div>
                      <div className="p-2 text-center">PRICE (WS)</div>
                    </div>

                    {(item.variants?.length ? item.variants : [{ id: 'fallback', name: item.modelNumber, price: '-', description: '' }]).map(
                      (variant, index, arr) => (
                        <div
                          key={variant.id || `${item.id || item.name}-${index}`}
                          className={`grid grid-cols-3 text-xs ${index !== arr.length - 1 ? 'border-b border-dotted border-[#d1d5db]' : ''}`}
                        >
                          <div className="break-words p-2 text-center text-lg">{safeText(variant.name || item.modelNumber)}</div>
                          <div className="break-words p-2 text-center text-lg font-bold">₹ {safeText(variant.price)}</div>
                          <div className="break-words p-2 text-center text-lg font-bold">{getWsPrice(variant.description)}</div>
                        </div>
                      ),
                    )}
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
