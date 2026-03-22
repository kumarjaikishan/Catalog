const ItemsPanel = ({
  ui,
  categoriesToDisplay,
  searchQuery,
  onSearchQueryChange,
  selectedCategoryId,
  onClearCategoryFilter,
  openNewItemModal,
  editItem,
  deleteItem,
}) => {
  return (
    <main className={ui.card}>
      <div className="mb-2.5 flex items-center justify-between">
        <h2 className="text-xl">Items</h2>
        <button type="button" className={ui.btnSmall} onClick={() => openNewItemModal()}>
          + Add Item
        </button>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-[1fr_auto] sm:items-center">
        <input
          className={ui.input}
          value={searchQuery}
          onChange={(event) => onSearchQueryChange(event.target.value)}
          placeholder="Search by item name, model, description, or variant"
        />
        {selectedCategoryId ? (
          <button type="button" className={ui.btnSmall} onClick={onClearCategoryFilter}>
            Show All Categories
          </button>
        ) : null}
      </div>

      {!categoriesToDisplay.some((category) => category.items.length) ? (
        <p className="text-[#64748b]">No items available.</p>
      ) : (
        <div className="grid gap-3">
          {categoriesToDisplay.map((category) =>
            category.items.length ? (
              <article key={category.id} className="overflow-hidden rounded-xl border border-[#eadbc8]">
                <h3 className="border-b border-[#eadbc8] bg-[#f7ede1] px-2.5 py-2 text-sm">{category.name}</h3>
                {category.items.map((item) => (
                  <div
                    className="flex flex-col justify-between gap-2.5 border-b border-[#f2e7da] p-2.5 last:border-b-0 sm:flex-row sm:items-center"
                    key={item.id}
                  >
                    <div className=" flex gap-2">
                      <div className="shadow-2xl">
                        <img
                          className=" w-20 h-20 rounded-xl object-cover"
                          src={item?.variants?.[0]?.imageData} alt="" />
                      </div>
                      <div>
                        <strong>{item.name}</strong>
                        <p className="text-xs text-[#64748b]">
                          Model: {item.modelNumber} | Variants: {item.variants?.length || 0}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        className={ui.btnSmall}
                        onClick={() => editItem(category.id, item)}
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        className={ui.btnDanger}
                        onClick={() => deleteItem(category.id, item.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </article>
            ) : null,
          )}
        </div>
      )}
    </main>
  )
}

export default ItemsPanel
