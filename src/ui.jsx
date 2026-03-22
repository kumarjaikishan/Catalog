import { useMemo, useState } from 'react'
import PdfThemeExportFlow from './ui/PdfThemeExportFlow'
import { generatedCatalogSeed } from './data/pdfExtractedCatalog'

const normalizeCatalog = (catalog) =>
  catalog.map((category, categoryIndex) => ({
    id: category.id || `cat-${categoryIndex + 1}`,
    name: category.name,
    items: (category.items || []).map((item, itemIndex) => ({
      id: item.id || `item-${categoryIndex + 1}-${itemIndex + 1}`,
      name: item.name,
      modelNumber: item.modelNumber,
      description: item.description,
      imageData: item.imageData || '',
      variants: (item.variants || []).map((variant, variantIndex) => ({
        id: variant.id || `variant-${categoryIndex + 1}-${itemIndex + 1}-${variantIndex + 1}`,
        name: variant.name,
        price: variant.price,
        description: variant.description,
      })),
    })),
  }))

const Ui = () => {
  const [isPdfFlowOpen, setIsPdfFlowOpen] = useState(false)
  const catalog = useMemo(() => normalizeCatalog(generatedCatalogSeed), [])

  const totalItems = useMemo(
    () => catalog.reduce((count, category) => count + category.items.length, 0),
    [catalog],
  )

  const totalVariants = useMemo(
    () =>
      catalog.reduce(
        (count, category) =>
          count + category.items.reduce((itemCount, item) => itemCount + (item.variants?.length || 0), 0),
        0,
      ),
    [catalog],
  )

  return (
    <div className="app-shell p-4">
      <header className="hero-panel">
        <div>
          <p className="eyebrow">Theme PDF Exporter</p>
          <h1>Choose Theme, Preview, Then Export</h1>
          <p className="hero-copy">
            Select any available UI theme, preview the first 10 items, and only then generate the full PDF.
          </p>
        </div>

        <div className="stats-grid">
          <article>
            <span>Categories</span>
            <strong>{catalog.length}</strong>
          </article>
          <article>
            <span>Items</span>
            <strong>{totalItems}</strong>
          </article>
          <article>
            <span>Variants</span>
            <strong>{totalVariants}</strong>
          </article>
        </div>
      </header>

      <section className="toolbar">
        <button type="button" className="btn btn-primary" onClick={() => setIsPdfFlowOpen(true)}>
          Generate PDF
        </button>
      </section>

      {isPdfFlowOpen ? (
        <PdfThemeExportFlow catalog={catalog} onClose={() => setIsPdfFlowOpen(false)} />
      ) : null}
    </div>
  )
}

export default Ui
