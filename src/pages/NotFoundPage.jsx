import { Link } from 'react-router-dom'

const NotFoundPage = () => {
  return (
    <div className="mx-auto grid min-h-screen max-w-[900px] place-items-center px-4">
      <div className="w-full rounded-2xl border border-[#e8dccb] bg-[#fffdf7] p-8 text-center shadow-[0_10px_25px_rgba(54,32,12,0.08)]">
        <p className="text-sm font-semibold uppercase tracking-[0.08em] text-slate-500">Error 404</p>
        <h1 className="mt-2 text-4xl font-bold text-[#1f2937]">Page Not Found</h1>
        <p className="mt-3 text-slate-600">The page you are looking for does not exist.</p>
        <Link
          to="/"
          className="mt-6 inline-block rounded-xl border border-[#7c2d12] bg-gradient-to-br from-amber-700 to-[#7c2d12] px-4 py-2 text-sm text-white"
        >
          Go To Home
        </Link>
      </div>
    </div>
  )
}

export default NotFoundPage
