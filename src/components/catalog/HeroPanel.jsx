const HeroPanel = ({ categoryCount, totalItems, totalVariants, user, onLogin, onLogout, onEditSlides }) => {

  return (
    <header className="relative col-span-full grid gap-6 overflow-hidden rounded-[24px] bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#1e293b] p-8 text-white shadow-2xl md:grid-cols-[1fr_auto] md:items-center">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,#3b82f633,transparent)] pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3">
          <div className="h-1 w-12 bg-orange-500 rounded-full"></div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-400">TechForce Ecosystem</p>
        </div>
        <h1 className="mt-3 text-5xl font-black tracking-tight text-white drop-shadow-md">
          TechForce <span className="text-orange-500 italic">Catalog</span>
        </h1>
        <p className="mt-4 max-w-[600px] text-lg leading-relaxed text-slate-300">
          Advanced product management and high-fidelity PDF orchestration for modern enterprises.
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
           {user ? (
            <>
              <button onClick={onLogout} className="px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 rounded-full text-sm font-semibold text-red-400 transition-all backdrop-blur-md">
                Logout
              </button>
              <button onClick={onEditSlides} className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/30 rounded-full text-sm font-semibold text-white transition-all backdrop-blur-md">
                Manage Slideshow
              </button>
            </>
          ) : (
            <button onClick={onLogin} className="px-6 py-2.5 bg-orange-600 hover:bg-orange-500 border border-orange-400/50 rounded-full text-sm font-black uppercase tracking-wider transition-all shadow-lg shadow-orange-900/40">
              Admin Gateway
            </button>
          )}
        </div>

      </div>

      <div className="relative z-10 grid w-full grid-cols-3 gap-4 md:min-w-[340px]">
        <article className="group rounded-2xl border border-white/5 bg-white/5 p-4 text-center transition-all hover:bg-white/10 hover:border-white/20">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-orange-400 transition-colors">Categories</span>
          <strong className="mt-1 block text-3xl font-black text-white">{categoryCount}</strong>
        </article>
        <article className="group rounded-2xl border border-white/5 bg-white/5 p-4 text-center transition-all hover:bg-white/10 hover:border-white/20">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-orange-400 transition-colors">Items</span>
          <strong className="mt-1 block text-3xl font-black text-white">{totalItems}</strong>
        </article>
        <article className="group rounded-2xl border border-white/5 bg-white/5 p-4 text-center transition-all hover:bg-white/10 hover:border-white/20">
          <span className="block text-[10px] font-bold uppercase tracking-widest text-slate-400 group-hover:text-orange-400 transition-colors">Variants</span>
          <strong className="mt-1 block text-3xl font-black text-white">{totalVariants}</strong>
        </article>
      </div>
    </header>
  )
}

export default HeroPanel
