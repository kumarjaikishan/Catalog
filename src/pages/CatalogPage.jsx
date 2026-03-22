import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import CategoriesPanel from '../components/catalog/CategoriesPanel'
import HeroPanel from '../components/catalog/HeroPanel'
import ItemModal from '../components/catalog/ItemModal'
import ItemsPanel from '../components/catalog/ItemsPanel'
import Toolbar from '../components/catalog/Toolbar'
import { ui } from '../components/catalog/ui'
import { emptyItemForm, emptyVariant, sanitizeVariants, uid } from '../catalog/utils'

const CatalogPage = ({ catalog, setCatalog }) => {
  const navigate = useNavigate()
  const [categoryName, setCategoryName] = useState('')
  const [editingCategoryId, setEditingCategoryId] = useState(null)
  const [editingCategoryName, setEditingCategoryName] = useState('')
  const [itemForm, setItemForm] = useState(emptyItemForm)
  const [isItemModalOpen, setIsItemModalOpen] = useState(false)

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

  const addCategory = (event) => {
    event.preventDefault()

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

    setCatalog((prev) => [
      ...prev,
      {
        id: uid(),
        name: trimmedName,
        items: [],
      },
    ])
    setCategoryName('')
  }

  const saveCategoryEdit = (categoryId) => {
    const nextName = editingCategoryName.trim()

    if (!nextName) {
      return
    }

    setCatalog((prev) =>
      prev.map((category) =>
        category.id === categoryId ? { ...category, name: nextName } : category,
      ),
    )

    setEditingCategoryId(null)
    setEditingCategoryName('')
  }

  const deleteCategory = (categoryId) => {
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

    setCatalog((prev) => prev.filter((entry) => entry.id !== categoryId))

    if (itemForm.categoryId === categoryId) {
      setItemForm(emptyItemForm())
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

    const reader = new FileReader()

    reader.onload = () => {
      const base64 = typeof reader.result === 'string' ? reader.result : ''
      setItemForm((prev) => ({
        ...prev,
        imageData: base64,
        imageName: file.name,
      }))
    }

    reader.readAsDataURL(file)
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

  const submitItem = (event) => {
    event.preventDefault()

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
      name,
      modelNumber,
      description,
      imageData: itemForm.imageData || '',
      imageName: itemForm.imageName || '',
      variants: variants.map((variant) => ({
        ...variant,
        imageData: itemForm.imageData || '',
        imageName: itemForm.imageName || '',
      })),
    }

    setCatalog((prev) =>
      prev.map((category) => {
        if (category.id !== itemForm.categoryId) {
          return category
        }

        const exists = category.items.some((item) => item.id === nextItem.id)

        if (exists) {
          return {
            ...category,
            items: category.items.map((item) =>
              item.id === nextItem.id ? nextItem : item,
            ),
          }
        }

        return { ...category, items: [...category.items, nextItem] }
      }),
    )

    closeItemModal()
  }

  const editItem = (categoryId, item) => {
    setItemForm({
      id: item.id,
      categoryId,
      name: item.name,
      modelNumber: item.modelNumber,
      description: item.description,
      imageData: item.imageData || item.variants?.[0]?.imageData || '',
      imageName: item.imageName || item.variants?.[0]?.imageName || '',
      variants:
        item.variants?.length > 0
          ? item.variants.map((variant) => ({ ...variant }))
          : [emptyVariant()],
    })
    setIsItemModalOpen(true)
  }

  const deleteItem = (categoryId, itemId) => {
    const ok = window.confirm('Delete this item and all variants?')

    if (!ok) {
      return
    }

    setCatalog((prev) =>
      prev.map((category) =>
        category.id === categoryId
          ? {
              ...category,
              items: category.items.filter((item) => item.id !== itemId),
            }
          : category,
      ),
    )

    if (itemForm.id === itemId) {
      closeItemModal()
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

  return (
    <div className={ui.shell}>
      <HeroPanel
        categoryCount={catalog.length}
        totalItems={totalItems}
        totalVariants={totalVariants}
      />
      <Toolbar
        ui={ui}
        onAddItem={() => openNewItemModal()}
        onGeneratePdf={goToExportPage}
      />

      <section className="grid gap-4 lg:grid-cols-[minmax(280px,1fr)_2fr]">
        <CategoriesPanel
          ui={ui}
          catalog={catalog}
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
        />

        <ItemsPanel
          ui={ui}
          catalog={catalog}
          openNewItemModal={openNewItemModal}
          editItem={editItem}
          deleteItem={deleteItem}
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
    </div>
  )
}

export default CatalogPage
