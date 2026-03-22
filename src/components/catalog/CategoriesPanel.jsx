const CategoriesPanel = ({
  ui,
  catalog,
  selectedCategoryId,
  onSelectCategory,
  onSelectAllCategories,
  categoryName,
  setCategoryName,
  addCategory,
  editingCategoryId,
  editingCategoryName,
  setEditingCategoryName,
  saveCategoryEdit,
  startCategoryEdit,
  deleteCategory,
}) => {
  return (
    <aside className={`${ui.card} h-fit`}>
      <h2 className="mb-3 text-xl">Categories</h2>
      <form onSubmit={addCategory} className="grid gap-2.5">
        <input
          className={ui.input}
          value={categoryName}
          onChange={(event) => setCategoryName(event.target.value)}
          placeholder="Add category name"
        />
        <button type="submit" className={ui.btnPrimary}>
          Add Category
        </button>
      </form>

      <div className="mt-3.5 grid gap-2">
        <button
          type="button"
          className={`w-full rounded-xl border p-2.5 text-left text-sm font-semibold transition ${
            selectedCategoryId === null
              ? 'border-[#7c2d12] bg-[#fff3e8] text-[#7c2d12]'
              : 'border-[#eadbc8] bg-white text-[#1f2937]'
          }`}
          onClick={onSelectAllCategories}
        >
          All Categories
        </button>

        {catalog.map((category) => (
          <div
            className={`grid grid-cols-[1fr_auto] items-center gap-2.5 rounded-xl border p-2.5 ${
              selectedCategoryId === category.id
                ? 'border-[#7c2d12] bg-[#fff3e8]'
                : 'border-[#eadbc8]'
            }`}
            key={category.id}
            role="button"
            tabIndex={0}
            onClick={() => onSelectCategory(category.id)}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onSelectCategory(category.id)
              }
            }}
          >
            {editingCategoryId === category.id ? (
              <>
                <input
                  className={ui.input}
                  value={editingCategoryName}
                  onChange={(event) => setEditingCategoryName(event.target.value)}
                />
                <button
                  type="button"
                  className={ui.btnSmall}
                  onClick={() => saveCategoryEdit(category.id)}
                >
                  Save
                </button>
              </>
            ) : (
              <>
                <div>
                  <strong>{category.name}</strong>
                  <p className="text-xs text-[#64748b]">{category.items.length} item(s)</p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={ui.btnSmall}
                    onClick={(event) => {
                      event.stopPropagation()
                      startCategoryEdit(category)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={ui.btnDanger}
                    onClick={(event) => {
                      event.stopPropagation()
                      deleteCategory(category.id)
                    }}
                  >
                    Delete
                  </button>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default CategoriesPanel
