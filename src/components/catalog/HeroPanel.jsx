const HeroPanel = ({ categoryCount, totalItems, totalVariants }) => {
  return (
    <header className="grid gap-6 rounded-[18px] bg-[linear-gradient(135deg,#7c2d12_0%,#c2410c_45%,#0f4c81_100%)] p-6 text-white shadow-[0_18px_30px_rgba(49,21,5,0.25)] md:grid-cols-[1fr_auto] md:items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.08em] opacity-85">Catalog Builder</p>
        <h1 className="mt-1.5 text-3xl leading-tight">Manage Categories, Items, and Variants</h1>
        <p className="mt-2 max-w-[650px] opacity-90">
          Build and maintain your product list with images, then export a clean
          grouped PDF in one click.
        </p>
      </div>
      <div className="grid w-full grid-cols-3 gap-2 md:min-w-[290px]">
        <article className="rounded-xl border border-white/30 bg-white/15 p-2.5 text-center">
          <span className="block text-xs opacity-80">Categories</span>
          <strong className="text-2xl">{categoryCount}</strong>
        </article>
        <article className="rounded-xl border border-white/30 bg-white/15 p-2.5 text-center">
          <span className="block text-xs opacity-80">Items</span>
          <strong className="text-2xl">{totalItems}</strong>
        </article>
        <article className="rounded-xl border border-white/30 bg-white/15 p-2.5 text-center">
          <span className="block text-xs opacity-80">Variants</span>
          <strong className="text-2xl">{totalVariants}</strong>
        </article>
      </div>
    </header>
  )
}

export default HeroPanel
