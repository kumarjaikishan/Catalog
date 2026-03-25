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
  user,
}) => {
  return (
    <aside className={`${ui.card} h-fit`}>
      <h2 className="mb-3 text-xl font-bold text-slate-800">Categories</h2>

      {user && (
        <form onSubmit={addCategory} className="grid gap-2.5 mb-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 shadow-sm transition-all">
          <input
            className={ui.input}
            value={categoryName}
            onChange={(event) => setCategoryName(event.target.value)}
            placeholder="Add category name"
          />
          <button type="submit" className={ui.btnPrimary + " shadow-lg shadow-orange-900/10"}>
            Add Category
          </button>
        </form>
      )}


      {/* Mobile Category Dropdown / Edit Form */}
      <div className="lg:hidden mt-4 space-y-3">
        {editingCategoryId ? (
          <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 shadow-sm">
            <label className="block text-xs font-bold text-amber-800 uppercase tracking-widest mb-2">Editing Category</label>
            <div className="flex gap-2">
              <input
                className={ui.input}
                value={editingCategoryName}
                onChange={(event) => setEditingCategoryName(event.target.value)}
                autoFocus
              />
              <button
                type="button"
                className={ui.btnPrimary}
                onClick={() => saveCategoryEdit(editingCategoryId)}
              >
                Save
              </button>
            </div>
          </div>
        ) : (
          <div className="relative group">
            <select
              className={`${ui.input} appearance-none pr-10 bg-white/50 backdrop-blur-sm cursor-pointer hover:border-amber-500 transition-colors font-medium`}
              value={selectedCategoryId || ''}
              onChange={(e) => {
                const val = e.target.value
                if (val === '') onSelectAllCategories()
                else onSelectCategory(val)
              }}
            >
              <option value="">All Categories</option>
              {catalog.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name} ({category.items.length})
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 group-hover:text-amber-600 transition-colors">
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        )}

        {/* Selected Category Admin Controls for Mobile */}
        {user && selectedCategoryId && !editingCategoryId && (
          <div className="flex items-center justify-between gap-3 p-2 bg-orange-50/50 rounded-xl border border-orange-100/50">
            {(() => {
              const category = catalog.find((c) => c.id === selectedCategoryId)
              if (!category) return null
              return (
                <>
                  <span className="text-xs font-bold text-orange-800 uppercase tracking-wider truncate">
                    Manage {category.name}:
                  </span>
                  <div className="flex gap-2 shrink-0">
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
              )
            })()}
          </div>
        )}
      </div>

      {/* Desktop Category Sidebar */}
      <div className="mt-3.5 hidden lg:grid gap-2">
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
                {user && (
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
                )}
              </>
            )}
          </div>
        ))}
      </div>
    </aside>
  )
}

export default CategoriesPanel
