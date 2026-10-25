import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-peach/20 px-6 text-center text-ink">
      <div className="w-full max-w-sm rounded-2xl border border-cream/80 bg-cream/90 p-8 shadow-lg backdrop-blur-sm">
        <span className="text-4xl">🧸</span>
        <h1 className="mt-4 font-script text-3xl font-semibold">Không tìm thấy món quà</h1>
        <p className="mt-2 text-sm opacity-75">
          Đường link này có thể chưa được kích hoạt hoặc mã quà tặng không chính xác.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block rounded-full bg-rose px-5 py-2 text-xs uppercase tracking-widest text-ink transition-transform hover:scale-105"
        >
          Trang chủ TikTap
        </Link>
      </div>
    </main>
  )
}
