import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoriesPanel from '../components/catalog/CategoriesPanel'
import HeroPanel from '../components/catalog/HeroPanel'
import ItemModal from '../components/catalog/ItemModal'
import ItemsPanel from '../components/catalog/ItemsPanel'
import Toolbar from '../components/catalog/Toolbar'
import { ui } from '../components/catalog/ui'
import { emptyItemForm, emptyVariant, sanitizeVariants, uid } from '../catalog/utils'
import { processImage } from '../utils/imageUtils'
import Slideshow from '../components/Slideshow'


import { db, auth } from '../lib/firebase'
import { doc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore'
import { signInWithEmailAndPassword, signOut, GoogleAuthProvider, signInWithPopup } from 'firebase/auth'


const CatalogPage = ({ catalog, user, slides }) => {
  const isAdmin = user?.email === 'kumar.jaikishan4880@gmail.com'
  const navigate = useNavigate()

  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)
  const [selectedCategoryId, setSelectedCategoryId] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')

  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginEmail, setLoginEmail] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  
  const [isSlidesModalOpen, setIsSlidesModalOpen] = useState(false)
  const [editingSlides, setEditingSlides] = useState(slides.join('\n'))


 
   const totalItems = useMemo(

    () => catalog.reduce((acc, category) => acc + category.items.length, 0),
    [catalog],
  )

  const totalVariants = useMemo(
    () =>
      catalog.reduce(
        (acc, category) =>
          acc +
          category.items.reduce(
            (itemAcc, item) => itemAcc + (item.variants?.length || 0),
            0,
          ),
        0,
      ),
    [catalog],
  )

  const addCategory = async (event) => {
    event.preventDefault()

    if (!user) return

    const trimmedName = categoryName.trim()

    if (!trimmedName) {
      return
    }

    const hasDuplicate = catalog.some(
      (category) => category.name.toLowerCase() === trimmedName.toLowerCase(),
    )

    if (hasDuplicate) {
      alert('Category already exists.')
      return
    }

    const id = uid()
    try {
      await setDoc(doc(db, 'categories', id), {
        name: trimmedName,
      })
      setCategoryName('')
    } catch (err) {
      console.error("Add category error:", err)
    }
  }


  const saveCategoryEdit = async (categoryId) => {
    if (!user) return
    const nextName = editingCategoryName.trim()

    if (!nextName) {
      return
    }

    try {
      await updateDoc(doc(db, 'categories', categoryId), { name: nextName })
      setEditingCategoryId(null)
      setEditingCategoryName('')
    } catch (err) {
      console.error("Update category error:", err)
    }
  }


  const deleteCategory = async (categoryId) => {
    if (!user) return
    const category = catalog.find((entry) => entry.id === categoryId)

    if (!category) {
      return
    }

    const ok = window.confirm(
      `Delete category "${category.name}" and all its items?`,
    )

    if (!ok) {
      return
    }

    try {
      // Delete all items in this category first
      const itemsToDelete = category.items || []
      for (const item of itemsToDelete) {
        await deleteDoc(doc(db, 'items', item.id))
      }
      await deleteDoc(doc(db, 'categories', categoryId))
      
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null)
      }

      if (itemForm.categoryId === categoryId) {
        setItemForm(emptyItemForm())
      }
    } catch (err) {
      console.error("Delete category error:", err)
    }
  }


  const setItemField = (field, value) => {
    setItemForm((prev) => ({ ...prev, [field]: value }))
  }

  const setVariantField = (variantIndex, field, value) => {
    setItemForm((prev) => ({
      ...prev,
      variants: prev.variants.map((variant, index) =>
        index === variantIndex ? { ...variant, [field]: value } : variant,
      ),
    }))
  }

  const addVariant = () => {
    setItemForm((prev) => ({ ...prev, variants: [...prev.variants, emptyVariant()] }))
  }

  const removeVariant = (variantIndex) => {
    setItemForm((prev) => {
      if (prev.variants.length === 1) {
        return prev
      }

      return {
        ...prev,
        variants: prev.variants.filter((_, index) => index !== variantIndex),
      }
    })
  }

   const handleItemImageUpload = async (file) => {
     if (!file) {
       setItemForm((prev) => ({
         ...prev,
         imageData: '',
         imageName: '',
       }))
       return
     }
 
     try {
       const processed = await processImage(file)
       setItemForm((prev) => ({
         ...prev,
         imageData: processed.base64,
         imageName: processed.name,
       }))
     } catch (err) {
       console.error('Image processing failed:', err)
       alert('Failed to process image.')
     }
   }


  const resetItemForm = () => {
    setItemForm((prev) => ({ ...emptyItemForm(), categoryId: prev.categoryId }))
  }

  const openNewItemModal = (categoryId = '') => {
    setItemForm({ ...emptyItemForm(), categoryId })
    setIsItemModalOpen(true)
  }

  const closeItemModal = () => {
    setIsItemModalOpen(false)
    setItemForm(emptyItemForm())
  }

  const submitItem = async (event) => {
    event.preventDefault()

    if (!user) return

    const name = itemForm.name.trim()
    const modelNumber = itemForm.modelNumber.trim()
    const description = itemForm.description.trim()
    const variants = sanitizeVariants(itemForm.variants)

    if (!itemForm.categoryId || !name || !modelNumber) {
      alert('Category, item name, and model number are required.')
      return
    }

    const nextItem = {
      id: itemForm.id || uid(),
      categoryId: itemForm.categoryId,
      name,
      modelNumber,
      description,
      imageData: itemForm.imageData || '',
      imageName: itemForm.imageName || '',
      variants: variants.map((variant) => ({
        ...variant,
      })),
    }

    try {
      await setDoc(doc(db, 'items', nextItem.id), nextItem)
      closeItemModal()
    } catch (err) {
      console.error("Submit item error:", err)
    }
  }


  const editItem = (categoryId, item) => {
    setItemForm({
      id: item.id,
      categoryId,
      name: item.name,
      modelNumber: item.modelNumber,
      description: item.description,
      imageData: item.imageData || '',
      imageName: item.imageName || '',
      variants:
        item.variants?.length > 0
          ? item.variants.map((variant) => ({ ...variant }))
          : [emptyVariant()],
    })
    setIsItemModalOpen(true)
  }

  const deleteItem = async (categoryId, itemId) => {
    if (!user) return

    const ok = window.confirm('Delete this item and all variants?')

    if (!ok) {
      return
    }

    try {
      await deleteDoc(doc(db, 'items', itemId))
      if (itemForm.id === itemId) {
        closeItemModal()
      }
    } catch (err) {
      console.error("Delete item error:", err)
    }
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error("Logout error:", err)
    }
  }

  const handleLogin = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, loginEmail, loginPassword)
      setIsLoginModalOpen(false)
      setLoginEmail('')
      setLoginPassword('')
    } catch (err) {
      alert('Login failed. Check your credentials.')
    }
  }

  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider()
    try {
      await signInWithPopup(auth, provider)
      setIsLoginModalOpen(false)
    } catch (err) {
      console.error("Google Login error:", err)
      alert("Google Login failed.")
    }
  }


  const saveSlides = async () => {
    const urls = editingSlides.split('\n').map(s => s.trim()).filter(Boolean)
    try {
      await setDoc(doc(db, 'settings', 'slideshow'), { urls })
      setIsSlidesModalOpen(false)
    } catch (err) {
      console.error("Save slides error:", err)
      alert("Failed to save slides.")
    }
  }



  const goToExportPage = () => {
    const totalCatalogItems = catalog.reduce(
      (acc, category) => acc + category.items.length,
      0,
    )

    if (!catalog.length || !totalCatalogItems) {
      alert('Please add at least one item before exporting.')
      return
    }

    navigate('/export')
  }

  const normalizedSearch = searchQuery.trim().toLowerCase()

  const categoriesAfterCategoryFilter = useMemo(() => {
    if (!selectedCategoryId) {
      return catalog
    }

    return catalog.filter((category) => category.id === selectedCategoryId)
  }, [catalog, selectedCategoryId])

  const filteredCategories = useMemo(() => {
    if (!normalizedSearch) {
      return categoriesAfterCategoryFilter
    }

    return categoriesAfterCategoryFilter
      .map((category) => ({
        ...category,
        items: category.items.filter((item) => {
          const variantText = (item.variants || [])
            .map((variant) => `${variant.name || ''} ${variant.description || ''}`)
            .join(' ')
            .toLowerCase()

          const text = `${item.name || ''} ${item.modelNumber || ''} ${item.description || ''} ${variantText}`.toLowerCase()
          return text.includes(normalizedSearch)
        }),
      }))
      .filter((category) => category.items.length > 0)
  }, [categoriesAfterCategoryFilter, normalizedSearch])

  return (
    <div className={ui.shell}>
      <Slideshow images={slides} />
      <HeroPanel
        categoryCount={catalog.length}
        totalItems={totalItems}
        totalVariants={totalVariants}
        user={user}
        onLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        onEditSlides={isAdmin ? () => {
          setEditingSlides(slides.join('\n'))
          setIsSlidesModalOpen(true)
        } : null}
      />

      <Toolbar
        ui={ui}
        onAddItem={() => openNewItemModal()}
        onGeneratePdf={goToExportPage}
        user={isAdmin ? user : null}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <CategoriesPanel
          ui={ui}
          catalog={catalog}
          selectedCategoryId={selectedCategoryId}
          onSelectCategory={(categoryId) =>
            setSelectedCategoryId((prev) => (prev === categoryId ? null : categoryId))
          }
          onSelectAllCategories={() => setSelectedCategoryId(null)}
          categoryName={categoryName}
          setCategoryName={setCategoryName}
          addCategory={addCategory}
          editingCategoryId={editingCategoryId}
          editingCategoryName={editingCategoryName}
          setEditingCategoryName={setEditingCategoryName}
          saveCategoryEdit={saveCategoryEdit}
          startCategoryEdit={(category) => {
            setEditingCategoryId(category.id)
            setEditingCategoryName(category.name)
          }}
          deleteCategory={deleteCategory}
          user={isAdmin ? user : null}
        />

        <ItemsPanel
          ui={ui}
          categoriesToDisplay={filteredCategories}
          searchQuery={searchQuery}
          onSearchQueryChange={setSearchQuery}
          selectedCategoryId={selectedCategoryId}
          onClearCategoryFilter={() => setSelectedCategoryId(null)}
          openNewItemModal={openNewItemModal}
          editItem={editItem}
          deleteItem={deleteItem}
          user={isAdmin ? user : null}
        />
      </section>




       {isItemModalOpen ? (
         <ItemModal
           ui={ui}
           catalog={catalog}
           itemForm={itemForm}
           setItemField={setItemField}
           handleItemImageUpload={handleItemImageUpload}
           addVariant={addVariant}
           removeVariant={removeVariant}
           setVariantField={setVariantField}
           submitItem={submitItem}
           resetItemForm={resetItemForm}
           closeItemModal={closeItemModal}
         />
       ) : null}
  
       {isLoginModalOpen ? (
         <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
           <div className="w-full max-w-md rounded-3xl bg-[#1e293b] border border-white/10 p-8 shadow-2xl">
             <h2 className="text-2xl font-bold text-white mb-6">Administrative Access</h2>
             <form onSubmit={handleLogin} className="space-y-4">
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                 <input
                   type="email"
                   required
                   value={loginEmail}
                   onChange={(e) => setLoginEmail(e.target.value)}
                   className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="admin@techforce.com"
                 />
               </div>
               <div>
                 <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                 <input
                   type="password"
                   required
                   value={loginPassword}
                   onChange={(e) => setLoginPassword(e.target.value)}
                   className="w-full rounded-xl bg-slate-900/50 border border-slate-700 p-3 text-white placeholder:text-slate-500 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all"
                   placeholder="••••••••"
                 />
               </div>

               <div className="pt-4 flex flex-col gap-3">
                 <div className="flex gap-3">
                   <button
                     type="button"
                     onClick={() => setIsLoginModalOpen(false)}
                     className="flex-1 px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-semibold transition-all"
                   >
                     Cancel
                   </button>
                   <button
                     type="submit"
                     className="flex-1 px-6 py-3 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-lg shadow-orange-900/20"
                   >
                     Login
                   </button>
                 </div>
                 
                 <div className="relative my-2">
                   <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                   <div className="relative flex justify-center text-xs uppercase"><span className="bg-[#1e293b] px-2 text-slate-500">Or continue with</span></div>
                 </div>

                 <button
                   type="button"
                   onClick={handleGoogleLogin}
                   className="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl bg-white text-[#1e293b] font-bold hover:bg-slate-100 transition-all border border-white/10 shadow-lg shadow-white/5"
                 >
                   <svg className="w-5 h-5" viewBox="0 0 24 24">
                     <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                     <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                     <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                     <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                   </svg>
                   Sign in with Google
                 </button>
               </div>
             </form>
           </div>
         </div>
       ) : null}

        {isSlidesModalOpen ? (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <div className="w-full max-w-2xl rounded-3xl bg-[#0f172a] border border-white/20 p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
              <h2 className="text-3xl font-black text-white mb-2 underline decoration-orange-500 decoration-4 underline-offset-8">Manage Home Slideshow</h2>
              <p className="text-slate-400 text-sm mb-8 mt-4 font-medium">Add one image URL per line. These will rotate automatically on the home page.</p>
              
              <div className="space-y-4">
                <label className="block text-sm font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 w-fit px-3 py-1 rounded-md border border-orange-500/20">Image URLs (one per line)</label>
                <textarea
                  value={editingSlides}
                  onChange={(e) => setEditingSlides(e.target.value)}
                  className="w-full h-80 rounded-2xl bg-slate-900/80 border border-slate-700 p-6 text-slate-100 font-mono text-sm focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all resize-none shadow-inner"
                  placeholder="https://images.unsplash.com/photo-1550751827-4bd374c3f58b&#10;https://images.unsplash.com/photo-1518770660439-4636190af475"
                />
              </div>

              <div className="pt-10 flex gap-4">
                <button
                  onClick={() => setIsSlidesModalOpen(false)}
                  className="flex-1 px-8 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold transition-all border border-white/10"
                >
                  Cancel
                </button>
                <button
                  onClick={saveSlides}
                  className="flex-1 px-8 py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black uppercase tracking-wider transition-all shadow-2xl shadow-orange-900/50 transform active:scale-95"
                >
                  Update Slideshow
                </button>
              </div>
            </div>
          </div>
        ) : null}
     </div>

    )
  }


export default CatalogPage
