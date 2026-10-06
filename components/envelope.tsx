type EnvelopeProps = {
  leaving: boolean
  onOpen: () => void
}

export function Envelope({ leaving, onOpen }: EnvelopeProps) {
  return (
    <button
      type="button"
      onClick={onOpen}
      disabled={leaving}
      aria-label="Mở lá thư"
      className={`group relative aspect-[3/2] w-[min(88vw,460px)] -rotate-2 cursor-pointer rounded-sm bg-peach shadow-[0_30px_60px_-20px_rgb(74_46_38/0.55)] transition-transform duration-500 hover:-rotate-1 hover:scale-[1.02] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink ${
        leaving ? 'animate-envelope-away' : ''
      }`}
    >
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-sm bg-blush"
        style={{ clipPath: 'polygon(0 100%, 50% 48%, 100% 100%)' }}
      />
      <span
        aria-hidden="true"
        className="absolute inset-0 rounded-sm bg-[#ffe6c4] shadow-inner"
        style={{ clipPath: 'polygon(0 0, 100% 0, 50% 58%)' }}
      />
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[58%] flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#d9777a] font-script text-3xl text-cream shadow-[inset_0_-3px_6px_rgb(0_0_0/0.25),0_4px_10px_rgb(74_46_38/0.35)] transition-transform duration-300 group-hover:scale-110"
      >
        L
      </span>
      <span className="absolute inset-x-0 -bottom-24 flex flex-col items-center gap-1 text-ink">
        <span className="font-script text-4xl leading-none">Một lá thư cho bạn</span>
        <span className="text-xs uppercase tracking-[0.3em] opacity-70">chạm để mở</span>
      </span>
    </button>
  )
}
