'use client'

import type { GiftData } from '@/lib/types'

type LoveTemplateProps = {
  data?: GiftData | null
}

export function LoveTemplate({ data }: LoveTemplateProps) {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-gradient-to-b from-rose-50 to-pink-100 text-rose-950 p-6 text-center">
      <div className="w-full max-w-md rounded-3xl bg-white/80 p-8 shadow-xl backdrop-blur-md border border-rose-200/60">
        <div className="text-4xl mb-4">💌</div>
        <h1 className="font-script text-4xl text-rose-700 mb-4">
          Gửi {data?.recipientName || 'người thương'}
        </h1>
        <p className="text-base sm:text-lg leading-relaxed text-gray-700 italic mb-6 whitespace-pre-line">
          "{data?.message || 'Có một người luôn nhớ về bạn mỗi ngày...'}"
        </p>
        <div className="text-sm font-medium text-rose-600">
          — {data?.senderName || 'Người viết thư'}
        </div>
        <div className="mt-8 rounded-full bg-rose-100 py-1.5 px-4 text-xs font-mono text-rose-600 inline-block">
          Template Love (LoveLoom theme) đang được chuẩn bị
        </div>
      </div>
    </main>
  )
}
export default LoveTemplate
