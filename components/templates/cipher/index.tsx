'use client'

import type { GiftData } from '@/lib/types'

type CipherTemplateProps = {
  data?: GiftData | null
}

export function CipherTemplate({ data }: CipherTemplateProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[#f7f9f4] text-[#2d4a22] p-6 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white/90 p-8 shadow-xl border border-green-200/80">
        <div className="text-4xl mb-4">🌱</div>
        <h1 className="text-2xl font-bold tracking-wide text-green-800 mb-4">
          {data?.recipientName ? `Gửi ${data.recipientName}` : 'Hành Trình Yêu Nhau'}
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-gray-700 italic mb-6 whitespace-pre-line">
          "{data?.message || 'Bức thư mật mã giải mã bằng kính lúp...'}"
        </p>
        <div className="text-sm font-medium text-green-700">
          — {data?.senderName || 'Người gửi bí ẩn'}
        </div>
        <div className="mt-8 rounded-full bg-green-100 py-1.5 px-4 text-xs font-mono text-green-800 inline-block">
          Template Cipher (Kính lúp giải mã mật mã) đang được chuẩn bị
        </div>
      </div>
    </main>
  )
}
export default CipherTemplate
