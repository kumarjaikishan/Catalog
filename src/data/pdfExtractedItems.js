import { generatedCatalogSeed } from './pdfExtractedCatalog'

export const extractedPdfItems = generatedCatalogSeed.flatMap((category) =>
  category.items.map((item) => ({
    category: category.name,
    name: item.name,
    modelNumber: item.modelNumber,
    description: item.description,
    variants: item.variants,
  })),
)
