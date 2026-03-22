import { getItemImage, getWsPrice, safeText } from './shared'

export const Theme2 = ({ catalog }) => {
  return (
    <div className="space-y-8 bg-[#ffffff] p-6">
      {catalog.map((category) => (
        <section key={category.id || category.name}>
          <h2 className="bg-[#000000] py-2 text-center text-lg font-bold text-[#ffffff]">{safeText(category.name)}</h2>

          <table className="mt-1 w-full table-fixed border border-[#000000] text-[11px]">
            <thead className="bg-[#dc2626] text-[#ffffff]">
              <tr>
                <th className="w-[34%] border border-[#000000] p-2">DESCRIPTION</th>
                <th className="w-[22%] border border-[#000000] p-2">PICTURE</th>
                <th className="w-[14%] border border-[#000000] p-2">MODEL</th>
                <th className="w-[14%] border border-[#000000] p-2">PRICE (QTY)</th>
                <th className="w-[16%] border border-[#000000] p-2">PRICE (WS)</th>
              </tr>
            </thead>

            <tbody>
              {category.items.map((item) => {
                const variants = item.variants?.length
                  ? item.variants
                  : [{ id: `${item.id}-fallback`, name: item.modelNumber, price: '-', description: '' }]

                return variants.map((variant, index) => (
                  <tr key={variant.id || `${item.id || item.name}-${index}`}>
                    {index === 0 ? (
                      <td rowSpan={variants.length} className="border border-[#000000] p-2 align-top">
                        <div className="mb-2 inline-block bg-[#dc2626] px-1 text-[10px] text-[#ffffff]">100% ORIGINAL</div>
                        <div className="break-words text-center font-bold uppercase">{safeText(item.name)}</div>
                        <div className="mt-1 break-words text-center text-[10px] text-[#4b5563]">{safeText(item.description)}</div>
                      </td>
                    ) : null}

                    {index === 0 ? (
                      <td rowSpan={variants.length} className="border border-[#000000] p-2 align-middle text-center">
                        {getItemImage(item) ? (
                          <img
                            src={getItemImage(item)}
                            alt={safeText(item.name)}
                            className="mx-auto h-20 w-20 object-contain"
                          />
                        ) : (
                          <div className="mx-auto flex h-20 w-20 items-center justify-center border border-[#d1d5db] text-[10px] text-[#6b7280]">
                            NO IMAGE
                          </div>
                        )}
                      </td>
                    ) : null}

                    <td className="break-words border border-[#000000] p-2 text-center">{safeText(variant.name || item.modelNumber)}</td>
                    <td className="break-words border border-[#000000] p-2 text-center text-sm font-bold">{safeText(variant.price)}</td>
                    <td className="break-words border border-[#000000] p-2 text-center text-sm font-bold">{getWsPrice(variant.description)}</td>
                  </tr>
                ))
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
