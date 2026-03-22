const ItemModal = ({
  ui,
  catalog,
  itemForm,
  setItemField,
  handleItemImageUpload,
  addVariant,
  removeVariant,
  setVariantField,
  submitItem,
  resetItemForm,
  closeItemModal,
}) => {
  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/45 p-4" onClick={closeItemModal}>
      <div className="max-h-[92vh] w-[min(900px,96vw)] overflow-auto rounded-2xl border border-[#e6d6c3] bg-white p-4 shadow-[0_18px_40px_rgba(30,41,59,0.35)]" onClick={(event) => event.stopPropagation()}>
        <div className="mb-2.5 flex items-center justify-between">
          <h2 className="text-xl">{itemForm.id ? 'Update Item' : 'Add New Item'}</h2>
          <button type="button" className={ui.btnSmall} onClick={closeItemModal}>
            Close
          </button>
        </div>

        <form onSubmit={submitItem} className="grid gap-2.5">
          <select
            className={ui.input}
            value={itemForm.categoryId}
            onChange={(event) => setItemField('categoryId', event.target.value)}
            required
          >
            <option value="">Select category</option>
            {catalog.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>

          <input
            className={ui.input}
            value={itemForm.name}
            onChange={(event) => setItemField('name', event.target.value)}
            placeholder="Item name"
            required
          />

          <input
            className={ui.input}
            value={itemForm.modelNumber}
            onChange={(event) => setItemField('modelNumber', event.target.value)}
            placeholder="Model number"
            required
          />

          <textarea
            className={ui.textarea}
            value={itemForm.description}
            onChange={(event) => setItemField('description', event.target.value)}
            placeholder="Item description"
            rows={3}
          />

          <div className="grid gap-2 rounded-xl border border-dashed border-[#d6bea3] bg-[#fffcf7] p-2.5">
            <label className="text-sm text-slate-600">Item Image (one image used for all variants)</label>
            <input
              className={ui.input}
              type="file"
              accept="image/*"
              onChange={(event) => handleItemImageUpload(event.target.files?.[0] || null)}
            />
            {itemForm.imageData ? (
              <img
                className="h-[90px] w-[120px] rounded-lg border border-[#d8c5af] object-cover"
                src={itemForm.imageData}
                alt={itemForm.imageName || 'Item image'}
              />
            ) : null}
          </div>

          <div className="mt-0.5 flex items-center justify-between">
            <h3 className="text-base">Variants</h3>
            <button type="button" className={ui.btnSmall} onClick={addVariant}>
              + Add Variant
            </button>
          </div>

          <div className="grid gap-2.5">
            {itemForm.variants.map((variant, index) => (
              <article className="grid gap-2 rounded-xl border border-dashed border-[#d6bea3] bg-[#fffcf7] p-2.5" key={variant.id}>
                <div className="flex items-center justify-between">
                  <strong>Variant {index + 1}</strong>
                  <button
                    type="button"
                    className={ui.btnDanger}
                    onClick={() => removeVariant(index)}
                    disabled={itemForm.variants.length === 1}
                  >
                    Remove
                  </button>
                </div>

                <input
                  className={ui.input}
                  value={variant.name}
                  onChange={(event) =>
                    setVariantField(index, 'name', event.target.value)
                  }
                  placeholder="Variant name / model"
                />
                <input
                  className={ui.input}
                  value={variant.price}
                  onChange={(event) =>
                    setVariantField(index, 'price', event.target.value)
                  }
                  placeholder="Price (Qty)"
                />
                <textarea
                  className={ui.textarea}
                  value={variant.description}
                  onChange={(event) =>
                    setVariantField(index, 'description', event.target.value)
                  }
                  placeholder="Variant description (example: WS Price: INR 75)"
                  rows={2}
                />
              </article>
            ))}
          </div>

          <div className="flex gap-2.5">
            <button type="submit" className={ui.btnPrimary}>
              {itemForm.id ? 'Update Item' : 'Save Item'}
            </button>
            <button type="button" className={ui.btn} onClick={resetItemForm}>
              Reset
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ItemModal
