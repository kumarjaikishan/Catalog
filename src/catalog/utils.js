import { generatedCatalogSeed } from '../data/pdfExtractedCatalog'

export const STORAGE_KEY = 'rukhi_catalog_v3'

export const uid = () => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID()
  }

  return `${Date.now()}-${Math.random().toString(16).slice(2)}`
}

export const emptyVariant = () => ({
  id: uid(),
  name: '',
  price: '',
  description: '',
  imageData: '',
  imageName: '',
})

export const emptyItemForm = () => ({
  id: null,
  categoryId: '',
  name: '',
  modelNumber: '',
  description: '',
  imageData: '',
  imageName: '',
  variants: [emptyVariant()],
})

export const seedCatalog = generatedCatalogSeed.map((category) => ({
  id: uid(),
  name: category.name,
  items: category.items.map((item) => ({
    id: uid(),
    name: item.name,
    modelNumber: item.modelNumber,
    description: item.description,
    imageData: item.imageData || item.variants?.[0]?.imageData || '',
    imageName: item.imageName || item.variants?.[0]?.imageName || '',
    variants:
      item.variants?.map((variant) => ({
        id: uid(),
        name: variant.name,
        price: variant.price,
        description: variant.description,
        imageData: variant.imageData || '',
        imageName: variant.imageName || '',
      })) || [],
  })),
}))

export const sanitizeVariants = (variants) =>
  variants
    .map((variant) => ({
      ...variant,
      name: variant.name.trim(),
      price: variant.price.trim(),
      description: variant.description.trim(),
    }))
    .filter(
      (variant) =>
        variant.name || variant.price || variant.description || variant.imageData,
    )
