import { useEffect, useState } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { STORAGE_KEY, seedCatalog } from './catalog/utils'
import CatalogPage from './pages/CatalogPage'
import ExportPage from './pages/ExportPage'

function App() {
  const [catalog, setCatalog] = useState(() => {
    if (typeof window === 'undefined') {
      return seedCatalog
    }

    const raw = localStorage.getItem(STORAGE_KEY)

    if (!raw) {
      return seedCatalog
    }

    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : seedCatalog
    } catch {
      return seedCatalog
    }
  })

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog))
  }, [catalog])
  // useEffect(() => {
  //   // localStorage.setItem(STORAGE_KEY, JSON.stringify(catalog))
  //   localStorage.clear()
  // }, [])

  return (
    <Routes>
      <Route path="/" element={<CatalogPage catalog={catalog} setCatalog={setCatalog} />} />
      <Route path="/export" element={<ExportPage catalog={catalog} />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
