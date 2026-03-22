import { useEffect, useMemo, useRef, useState } from 'react'
import html2canvas from 'html2canvas'
import { jsPDF } from 'jspdf'
import { pdfThemes } from './themeRegistry'

const ui = {
  btn: 'cursor-pointer rounded-xl border border-[#d7c4ab] bg-white px-3.5 py-2 text-sm text-[#1f2937] transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(28,24,19,0.1)] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none',
  btnSmall:
    'cursor-pointer rounded-lg border border-[#d7c4ab] bg-white px-2.5 py-1.5 text-xs text-[#1f2937] transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(28,24,19,0.1)] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none',
  btnPrimary:
    'cursor-pointer rounded-xl border border-[#7c2d12] bg-gradient-to-br from-amber-700 to-[#7c2d12] px-3.5 py-2 text-sm text-white transition hover:-translate-y-px hover:shadow-[0_8px_20px_rgba(28,24,19,0.1)] disabled:cursor-not-allowed disabled:opacity-70 disabled:shadow-none',
}

const IMAGE_WIDTH_CACHE = new Map()

const getItemImageSource = (item) =>
  item.imageData || item.variants?.find((variant) => variant.imageData)?.imageData || ''

const getPageUnitLimit = (themeId) => {
  if (themeId === 'theme2') {
    return 9.5
  }

  if (themeId === 'theme3') {
    return 10.5
  }

  if (themeId === 'theme4') {
    return 16
  }

  return 10
}

const getItemUnits = (item, themeId) => {
  const variantCount = Math.max(1, item.variants?.length || 1)

  if (themeId === 'theme4') {
    return 1
  }

  if (themeId === 'theme2') {
    return Math.max(1.4, variantCount * 1.8)
  }

  if (themeId === 'theme3') {
    return Math.max(1.3, variantCount * 1.6)
  }

  return Math.max(1.4, variantCount * 1.7)
}

const paginateCatalogForTheme = (catalog, themeId) => {
  const pages = []
  const pageLimit = getPageUnitLimit(themeId)
  let currentPage = []
  let currentUnits = 0

  const flushPage = () => {
    if (!currentPage.length) {
      return
    }

    pages.push(currentPage)
    currentPage = []
    currentUnits = 0
  }

  catalog
    .filter((category) => category.items?.length)
    .forEach((category) => {
      let bufferedItems = []

      const flushBufferedCategory = () => {
        if (!bufferedItems.length) {
          return
        }

        currentPage.push({
          ...category,
          id: `${category.id || category.name}-${pages.length}-${currentPage.length}`,
          items: bufferedItems,
        })
        bufferedItems = []
      }

      category.items.forEach((item) => {
        const itemUnits = getItemUnits(item, themeId)

        if (currentUnits + itemUnits > pageLimit) {
          flushBufferedCategory()
          flushPage()
        }

        if (itemUnits > pageLimit && currentUnits === 0) {
          pages.push([
            {
              ...category,
              id: `${category.id || category.name}-${pages.length}-single`,
              items: [item],
            },
          ])
          return
        }

        bufferedItems.push(item)
        currentUnits += itemUnits
      })

      flushBufferedCategory()
    })

  flushPage()
  return pages
}

const loadImage = (source) =>
  new Promise((resolve, reject) => {
    const image = new Image()

    if (source.startsWith('http://') || source.startsWith('https://')) {
      image.crossOrigin = 'anonymous'
    }

    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('Image load failed'))
    image.src = source
  })

const optimizeImageToWidth = async (source, width = 200, quality = 0.78) => {
  if (!source) {
    return ''
  }

  if (IMAGE_WIDTH_CACHE.has(source)) {
    return IMAGE_WIDTH_CACHE.get(source)
  }

  try {
    const image = await loadImage(source)
    const naturalWidth = image.naturalWidth || image.width || width
    const naturalHeight = image.naturalHeight || image.height || width
    const scale = Math.min(width / naturalWidth, 1)
    const targetWidth = Math.max(1, Math.round(naturalWidth * scale))
    const targetHeight = Math.max(1, Math.round(naturalHeight * scale))

    const canvas = document.createElement('canvas')
    canvas.width = targetWidth
    canvas.height = targetHeight

    const ctx = canvas.getContext('2d')

    if (!ctx) {
      IMAGE_WIDTH_CACHE.set(source, source)
      return source
    }

    ctx.drawImage(image, 0, 0, targetWidth, targetHeight)
    const optimized = canvas.toDataURL('image/jpeg', quality)
    IMAGE_WIDTH_CACHE.set(source, optimized)
    return optimized
  } catch {
    IMAGE_WIDTH_CACHE.set(source, source)
    return source
  }
}

const optimizeCatalogImageWidth = async (catalog, onProgress) => {
  const sources = Array.from(
    new Set(
      catalog
        .flatMap((category) => category.items || [])
        .map((item) => getItemImageSource(item))
        .filter(Boolean),
    ),
  )

  if (!sources.length) {
    onProgress?.({ step: 'No images to optimize', loaded: 0, total: 0 })
    return catalog
  }

  let done = 0
  const optimizedMap = new Map()
  onProgress?.({ step: 'Optimizing image width', loaded: done, total: sources.length })

  for (const source of sources) {
    const optimized = await optimizeImageToWidth(source, 200, 0.78)
    optimizedMap.set(source, optimized)
    done += 1
    onProgress?.({ step: 'Optimizing image width', loaded: done, total: sources.length })
  }

  return catalog.map((category) => ({
    ...category,
    items: (category.items || []).map((item) => {
      const itemSource = getItemImageSource(item)
      const optimizedItemImage = optimizedMap.get(itemSource) || item.imageData || ''

      return {
        ...item,
        imageData: optimizedItemImage,
        variants: (item.variants || []).map((variant) => ({
          ...variant,
          imageData: optimizedMap.get(variant.imageData) || optimizedItemImage || '',
        })),
      }
    }),
  }))
}

const waitForImages = async (container, onProgress) => {
  if (!container) {
    return
  }

  const images = Array.from(container.querySelectorAll('img'))
  if (!images.length) {
    onProgress?.({ step: 'Ready', loaded: 0, total: 0 })
    return
  }

  let loaded = 0
  onProgress?.({ step: 'Loading images', loaded, total: images.length })

  await Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          const done = () => {
            loaded += 1
            onProgress?.({ step: 'Loading images', loaded, total: images.length })
            resolve()
          }

          if (img.complete) {
            done()
            return
          }

          img.onload = done
          img.onerror = done
        }),
    ),
  )
}

const PdfThemeExportFlow = ({ catalog, onClose }) => {
  const [selectedThemeId, setSelectedThemeId] = useState('theme1')
  const [isGenerating, setIsGenerating] = useState(false)
  const [progress, setProgress] = useState({ step: '', loaded: 0, total: 0 })
  const [selectedCategoryIds, setSelectedCategoryIds] = useState([])
  const [exportCatalogOverride, setExportCatalogOverride] = useState(null)
  const previewPagesRef = useRef(null)

  const themes = Object.values(pdfThemes)
  const selectedTheme = pdfThemes[selectedThemeId] || themes[0]
  const ThemeComponent = selectedTheme?.Component

  const availableCategories = useMemo(
    () => catalog.filter((category) => category.items?.length),
    [catalog],
  )

  useEffect(() => {
    setSelectedCategoryIds(availableCategories.map((category) => category.id))
  }, [availableCategories])

  const filteredCatalog = useMemo(() => {
    if (!selectedCategoryIds.length) {
      return []
    }

    const selectedIdSet = new Set(selectedCategoryIds)
    return availableCategories.filter((category) => selectedIdSet.has(category.id))
  }, [availableCategories, selectedCategoryIds])

  const displayCatalog = exportCatalogOverride || filteredCatalog

  const fullCatalogPages = useMemo(
    () => paginateCatalogForTheme(displayCatalog, selectedThemeId),
    [displayCatalog, selectedThemeId],
  )

  const handleCategoryToggle = (categoryId) => {
    setSelectedCategoryIds((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId],
    )
  }

  const handleGenerate = async () => {
    if (!ThemeComponent || !previewPagesRef.current || !filteredCatalog.length) {
      return
    }

    try {
      setIsGenerating(true)
      setProgress({ step: 'Preparing pages', loaded: 0, total: 0 })
      const optimizedCatalog = await optimizeCatalogImageWidth(filteredCatalog, setProgress)
      setExportCatalogOverride(optimizedCatalog)
      await new Promise((resolve) => setTimeout(resolve, 80))
      const root = previewPagesRef.current
      await waitForImages(root, setProgress)

      const pages = Array.from(root.querySelectorAll('.pdf-page-render'))

      if (!pages.length) {
        throw new Error('No pages available for export.')
      }

      const pdf = new jsPDF('p', 'mm', 'a4')

      for (let i = 0; i < pages.length; i += 1) {
        setProgress({ step: `Rendering page ${i + 1}/${pages.length}`, loaded: i + 1, total: pages.length })

        const canvas = await html2canvas(pages[i], {
          scale: 1.35,
          useCORS: true,
          backgroundColor: '#ffffff',
          logging: false,
        })

        const imgData = canvas.toDataURL('image/jpeg', 0.8)

        if (i !== 0) {
          pdf.addPage()
        }

        pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297)
      }

      pdf.save(`catalog-${selectedTheme.id}.pdf`)
    } catch (error) {
      console.error(error)
      alert('PDF generation failed. Please try again.')
    } finally {
      setIsGenerating(false)
      setProgress({ step: '', loaded: 0, total: 0 })
      setExportCatalogOverride(null)
    }
  }

  return (
    <>
      <div className="mx-auto min-h-screen max-w-[1240px] px-4 pb-8 pt-6">
        <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#e8dccb] bg-[#fffdf7] p-4 shadow-[0_10px_25px_rgba(54,32,12,0.08)]">
          <div>
            <h1 className="text-2xl font-semibold text-[#1f2937]">PDF Export Page</h1>
            <p className="text-sm text-slate-600">Full real-data preview and export</p>
          </div>
          <button type="button" className={ui.btn} onClick={onClose} disabled={isGenerating}>
            Back To Home
          </button>
        </header>

        <section className="mt-4 grid gap-4 xl:grid-cols-[320px_1fr]">
          <aside className="rounded-2xl  h-fit border border-[#e8dccb] bg-[#fffdf7] p-4 shadow-[0_10px_25px_rgba(54,32,12,0.08)]">
            <h2 className="text-lg font-semibold text-[#1f2937]">Export Controls</h2>

            <div className="mt-3 grid gap-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Theme</p>
              {themes.map((theme) => (
                <button
                  key={theme.id}
                  type="button"
                  className={`cursor-pointer rounded-xl border px-3 py-2 text-sm transition ${selectedThemeId === theme.id
                    ? 'border-[#7c2d12] bg-[#fff3e8] text-[#7c2d12]'
                    : 'border-[#d7c4ab] bg-white text-[#1f2937]'
                    }`}
                  onClick={() => setSelectedThemeId(theme.id)}
                  disabled={isGenerating}
                >
                  {theme.label}
                </button>
              ))}
            </div>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                  Categories
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    className={ui.btnSmall}
                    onClick={() =>
                      setSelectedCategoryIds(
                        availableCategories.map((category) => category.id)
                      )
                    }
                    disabled={isGenerating}
                  >
                    Select All
                  </button>

                  <button
                    type="button"
                    className={ui.btnSmall}
                    onClick={() => setSelectedCategoryIds([])}
                    disabled={isGenerating}
                  >
                    Deselect All
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-left rounded-xl border border-[#eadbc8] bg-white p-3">
                {availableCategories.map((category) => (
                  <label
                    key={category.id}
                    className="grid grid-cols-[auto_1fr_auto] items-center gap-3 w-full cursor-pointer rounded-lg px-3 py-2 border border-transparent hover:border-[#eadbc8] hover:bg-amber-50 transition"
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-amber-600 cursor-pointer"
                      checked={selectedCategoryIds.includes(category.id)}
                      onChange={() => handleCategoryToggle(category.id)}
                      disabled={isGenerating}
                    />

                    {/* Category Name */}
                    <span className="text-sm text-[#1f2937] truncate">
                      {category.name}
                    </span>

                    {/* Count */}
                    <span className="text-xs text-gray-500 tabular-nums">
                      ({category.items.length})
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-5 grid gap-2.5">
              <button
                type="button"
                className={ui.btnPrimary}
                onClick={handleGenerate}
                disabled={isGenerating || !selectedCategoryIds.length}
              >
                {isGenerating ? 'Generating...' : 'Generate PDF'}
              </button>
              <p className="text-xs text-slate-500">Exports rendered pages with image width optimized to 200px.</p>
            </div>
          </aside>

          <main className="rounded-2xl border border-[#e8dccb] bg-[#fffdf7] p-4 shadow-[0_10px_25px_rgba(54,32,12,0.08)]">
            <h2 className="mb-3 text-lg font-semibold text-[#1f2937]">Rendered Pages Preview</h2>
            <div className="rounded-xl border border-[#eadbc8] bg-white">
              {ThemeComponent && filteredCatalog.length ? (
                <div ref={previewPagesRef} className="mx-auto grid w-[794px] gap-3 bg-[#f8fafc] p-3">
                  {fullCatalogPages.map((pageCatalog, index) => (
                    <div className="pdf-page-render h-[1123px] w-[794px] overflow-hidden bg-white shadow-sm" key={`preview-page-${index + 1}`}>
                      <ThemeComponent catalog={pageCatalog} />
                    </div>
                  ))}
                </div>
              ) : (
                <p className="p-4 text-sm text-slate-500">Select at least one category to preview.</p>
              )}
            </div>
          </main>
        </section>
      </div>

      {isGenerating ? (
        <div className="fixed inset-0 z-[70] grid place-items-center bg-slate-900/22 backdrop-blur-[3px]">
          <div className="w-[min(360px,92vw)] rounded-2xl border border-[#e6d6c3] bg-white p-4 text-center shadow-[0_16px_40px_rgba(15,23,42,0.25)]">
            <div className="mx-auto h-[34px] w-[34px] animate-spin rounded-full border-[3px] border-slate-200 border-t-[#7c2d12]" />
            <h3 className="my-2 text-lg">Generating PDF</h3>
            <p className="text-slate-700">
              {progress.total > 0 ? `${progress.loaded}/${progress.total}` : 'Preparing...'}
            </p>
            <small className="text-slate-500">{progress.step}</small>
          </div>
        </div>
      ) : null}
    </>
  )
}

export default PdfThemeExportFlow
