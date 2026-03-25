import { useEffect, useMemo, useState } from 'react'
import { Route, Routes } from 'react-router-dom'
import { STORAGE_KEY, seedCatalog } from './catalog/utils'
import CatalogPage from './pages/CatalogPage'
import ExportPage from './pages/ExportPage'
import NotFoundPage from './pages/NotFoundPage'
import { db, auth } from './lib/firebase'
import { collection, onSnapshot, query, orderBy, doc, setDoc } from 'firebase/firestore'

import { onAuthStateChanged } from 'firebase/auth'


function App() {
  const [categories, setCategories] = useState([])
  const [items, setItems] = useState([])
  const [slides, setSlides] = useState([
    'https://images.unsplash.com/photo-1519389950473-47ba0277781c?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=2070&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070&auto=format&fit=crop'
  ])
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [isMigrating, setIsMigrating] = useState(false)



  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
    })

    const qCats = query(collection(db, 'categories'), orderBy('name'))
    const unsubCats = onSnapshot(qCats, (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

    const qItems = query(collection(db, 'items'))
    const unsubItems = onSnapshot(qItems, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })))
    })

     const unsubSlides = onSnapshot(doc(db, 'settings', 'slideshow'), (docSnap) => {
       if (docSnap.exists() && docSnap.data().urls) {
         setSlides(docSnap.data().urls)
       }
       setLoading(false)
     })
 
     return () => {
       unsubAuth()
       unsubCats()
       unsubItems()
       unsubSlides()
     }
   }, [])
 
   useEffect(() => {
     if (!loading && user && categories.length === 0 && !isMigrating) {
       const migrate = async () => {
         setIsMigrating(true)
         console.log("Migrating seed data to Firestore...")
         try {
           for (const cat of seedCatalog) {
             const { items: catItems, ...catData } = cat
             await setDoc(doc(db, 'categories', cat.id), catData)
             for (const item of catItems) {
               await setDoc(doc(db, 'items', item.id), { ...item, categoryId: cat.id })
             }
           }
           console.log("Migration complete!")
         } catch (err) {
           console.error("Migration error:", err)
         } finally {
           setIsMigrating(false)
         }
       }
       migrate()
     }
   }, [loading, user, categories.length, isMigrating])



  const catalog = useMemo(() => {
    return categories.map(cat => ({
      ...cat,
      items: items.filter(item => item.categoryId === cat.id)
    }))
  }, [categories, items])



  if (loading) {
    return <div className="flex h-screen items-center justify-center bg-[#0f172a] text-white">Loading TechForce Catalog...</div>
  }

  return (
    <Routes>
      <Route path="/" element={<CatalogPage catalog={catalog} user={user} slides={slides} />} />

      <Route path="/export" element={<ExportPage catalog={catalog} />} />
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  )
}


export default App
