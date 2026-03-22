const Toolbar = ({ ui, onAddItem, onGeneratePdf }) => {
  return (
    <section className="flex flex-col gap-2.5 md:flex-row md:justify-end">
      <button type="button" className={ui.btn} onClick={onAddItem}>
        Add New Item
      </button>
      <button type="button" className={ui.btnPrimary} onClick={onGeneratePdf}>
        Generate PDF
      </button>
    </section>
  )
}

export default Toolbar
