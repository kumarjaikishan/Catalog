export const getItemImage = (item) =>
  item.imageData || item.variants?.find((variant) => variant.imageData)?.imageData || ''

export const getWsPrice = (description = '') => {
  const match = description.match(/WS\s*Price\s*:\s*INR\s*([\d,.]+)/i)
  return match?.[1] || '-'
}

export const safeText = (value) => (value ? String(value) : '-')
