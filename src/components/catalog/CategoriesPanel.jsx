const CategoriesPanel = ({
  ui,
  catalog,
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
    <aside className={ui.card}>
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
        {catalog.map((category) => (
          <div
            className="grid grid-cols-[1fr_auto] items-center gap-2.5 rounded-xl border border-[#eadbc8] p-2.5"
            key={category.id}
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
                    onClick={() => startCategoryEdit(category)}
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    className={ui.btnDanger}
                    onClick={() => deleteCategory(category.id)}
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
