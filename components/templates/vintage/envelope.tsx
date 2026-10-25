'use client'

import Image from 'next/image'
import { ChevronUp, X, Maximize2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { LetterBlock } from '@/lib/types'
import { PenScratchSound } from './pen-scratch-sound'

export type VintageStage =
  | 'closed'
  | 'opening-flap'
  | 'sliding-out'
  | 'halfway'
  | 'unfolding'
  | 'full'
  | 'folding'
  | 'sliding-in'
  | 'closing-flap'

type EnvelopeProps = {
  stage: VintageStage
  recipientName?: string
  photoUrl?: string | null
  blocks: LetterBlock[]
  audioCtxRef: React.RefObject<AudioContext | null>
  onOpenSeal: () => void
  onOpenFull: () => void
  onCloseFull: () => void
}

export function Envelope({
  stage,
  recipientName,
  photoUrl,
  blocks,
  audioCtxRef,
  onOpenSeal,
  onOpenFull,
  onCloseFull,
}: EnvelopeProps) {
  const touchStartY = useRef<number | null>(null)

  // Trạng thái viết chữ cho lá thư khi mở trọn vẹn
  const [revealedBlockIndex, setRevealedBlockIndex] = useState(0)
  const [revealedCharCount, setRevealedCharCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const penSoundRef = useRef<PenScratchSound | null>(null)

  // Khởi tạo âm thanh ngòi bút
  useEffect(() => {
    if (audioCtxRef.current && !penSoundRef.current) {
      penSoundRef.current = new PenScratchSound(audioCtxRef.current)
    }
  }, [audioCtxRef])

  const fullStartedAtRef = useRef<number>(0)
  const isTypingRef = useRef<boolean>(false)

  // Đánh dấu thời điểm vào trạng thái đọc thư
  useEffect(() => {
    if (stage === 'full') {
      fullStartedAtRef.current = Date.now()
    }
  }, [stage])

  // Reset chữ khi phong bì đóng lại
  useEffect(() => {
    if (stage === 'closed' || stage === 'closing-flap' || stage === 'sliding-in') {
      setRevealedBlockIndex(0)
      setRevealedCharCount(0)
      setIsFinished(false)
      fullStartedAtRef.current = 0
    }
  }, [stage])

  // Tự động cuộn êm xuống để hiển thị trọn vẹn ảnh Polaroid khi viết xong
  useEffect(() => {
    if (isFinished && contentRef.current) {
      const scrollTimer = setTimeout(() => {
        contentRef.current?.scrollTo({
          top: contentRef.current.scrollHeight,
          behavior: 'smooth',
        })
      }, 200)
      return () => clearTimeout(scrollTimer)
    }
  }, [isFinished])

  // Bắt cử chỉ vuốt trượt ngón tay lên trên (Swipe Up)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (stage !== 'halfway') return
    touchStartY.current = e.touches[0].clientY
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartY.current === null || stage !== 'halfway') return
    const touchEndY = e.changedTouches[0].clientY
    const deltaY = touchStartY.current - touchEndY

    if (deltaY > 30) {
      onOpenFull()
    }
    touchStartY.current = null
  }

  // Chạm vào thư khi đang gõ để hiện nhanh toàn bộ nội dung (bảo vệ tránh click nhầm khi vừa mở thư)
  const handleSkipTyping = () => {
    if (stage === 'full' && !isFinished && Date.now() - fullStartedAtRef.current > 800) {
      setIsFinished(true)
      setRevealedBlockIndex(blocks.length - 1)
      setRevealedCharCount(blocks[blocks.length - 1]?.text?.length || 0)
    }
  }

  // Logic viết chữ tự nhiên bằng ngòi bút theo đúng TỐC ĐỘ ĐỌC của người xem
  const currentBlock = blocks[revealedBlockIndex]

  useEffect(() => {
    if (stage !== 'full' || isFinished) return

    const currentText = currentBlock?.text || ''
    const currentLength = Array.from(currentText).length

    // Khi đã viết xong hết ký tự của đoạn hiện tại
    if (revealedCharCount >= currentLength) {
      if (revealedBlockIndex + 1 < blocks.length) {
        // Nghỉ chuyển đoạn 600ms tự nhiên như người viết dừng tay lấy mực trước khi sang dòng mới
        const pauseTimer = setTimeout(() => {
          setRevealedBlockIndex((prev) => prev + 1)
          setRevealedCharCount(0)
        }, 600)
        return () => clearTimeout(pauseTimer)
      } else {
        setIsFinished(true)
        return
      }
    }

    // Xác định ký tự tiếp theo
    const char = Array.from(currentText)[revealedCharCount] || ''

    // Tốc độ điều chỉnh tự nhiên: vừa tầm tốc độ mắt người đọc lướt êm dịu
    // Chữ thường: 58ms; Dấu cách: 75ms; Dấu phẩy: 180ms; Dấu chấm câu: 320ms
    let delay = 58
    if (char === ' ') {
      delay = 75
    } else if (',;:—'.includes(char)) {
      delay = 180
    } else if ('.!?…'.includes(char)) {
      delay = 320
    }

    // Nếu là ký tự đầu tiên khi vừa mở thư, để người đọc ổn định mắt 350ms
    if (revealedBlockIndex === 0 && revealedCharCount === 0) {
      delay = 350
    }

    const timer = setTimeout(() => {
      if (char.trim() && Math.random() < 0.5) {
        penSoundRef.current?.scratch()
      }

      setRevealedCharCount((prev) => prev + 1)

      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [stage, isFinished, revealedBlockIndex, revealedCharCount, blocks, currentBlock])

  // Trạng thái nắp phong bì: MỞ khi đã lật mở nắp hoặc đang thao tác
  const isFlapOpen =
    stage === 'opening-flap' ||
    stage === 'sliding-out' ||
    stage === 'halfway' ||
    stage === 'unfolding' ||
    stage === 'full' ||
    stage === 'folding' ||
    stage === 'sliding-in'

  // Trạng thái thư đọc phóng to toàn màn hình
  const isReadingLetter = stage === 'unfolding' || stage === 'full'

  // Vị trí của lá thư khi nằm trong phong bì (tuyệt đối không thò ra dưới đáy)
  // Base: translateY(0%) nằm gọn hoàn toàn trong túi phong bì
  // Halfway: translateY(-62%) trồi lên miệng phong bì thanh thoát
  const getPocketLetterTransform = () => {
    if (stage === 'sliding-out' || stage === 'halfway' || stage === 'unfolding' || stage === 'full' || stage === 'folding') {
      return '-translate-y-[62%]'
    }
    // closed, opening-flap, sliding-in, closing-flap:
    return 'translate-y-0'
  }

  return (
    <div className="relative flex flex-col items-center justify-center min-h-[580px] py-6 w-full max-w-4xl select-none">
      
      {/* KHUNG PHONG BÌ TỰ NHIÊN CHÂN THỰC (VẪN LUÔN TỒN TẠI TRÊN BÀN GỖ) */}
      <div
        onClick={stage === 'closed' ? onOpenSeal : undefined}
        className={`perspective-1000 relative aspect-[578/432] w-[min(92vw,480px)] transition-all duration-600 ease-in-out ${
          stage === 'closed' ? 'cursor-pointer' : ''
        } ${
          isReadingLetter
            ? 'translate-y-28 scale-90 opacity-60 pointer-events-none'
            : 'translate-y-0 scale-100 opacity-100'
        }`}
      >
        {/* LỚP 0 (DƯỚI CÙNG): PHÍA SAU PHONG BÌ (Envelope Back - Z-0) */}
        <div className="absolute inset-0 z-0">
          <Image
            src="/images/vintage/envelope-back.png"
            alt="Lưng phong bì"
            fill
            priority
            sizes="480px"
            className="object-contain drop-shadow-[0_22px_45px_rgba(74,46,38,0.5)]"
          />
        </div>

        {/* LỚP 1: LÁ THƯ NẰM TRONG RUỘT PHONG BÌ (Z-10) */}
        {/* Vị trí ban đầu: left-12% top-16% w-76% h-68%, bottom ở 84% (nhỏ hơn đáy phong bì 89.6%) */}
        {/* Tuyệt đối không bao giờ thò ra dưới đáy phong bì! */}
        <div
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onClick={stage === 'halfway' ? onOpenFull : undefined}
          className={`absolute left-[12%] top-[16%] z-10 w-[76%] h-[68%] transition-transform duration-600 ease-in-out ${getPocketLetterTransform()} ${
            stage === 'halfway' ? 'cursor-pointer' : ''
          }`}
        >
          {/* Tờ giấy thư kraft gấp đôi liền mạch */}
          <div className="paper-sheet relative size-full rounded-sm border border-[#dec6a1] p-4 sm:p-5 flex flex-col justify-between overflow-hidden shadow-lg">
            {/* Nếp gấp chính giữa mờ nhẹ */}
            <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-[1px] bg-[#4a2e26]/15 shadow-sm" />

            {/* Ảnh kỷ niệm ghim ở góc trên phải */}
            {photoUrl && (
              <div className="absolute right-3 top-2.5 w-16 sm:w-20 rotate-6 rounded-[2px] bg-white p-1.5 shadow-[0_6px_16px_rgba(74,46,38,0.35)] transition-transform hover:scale-105">
                <div className="relative aspect-square w-full overflow-hidden rounded-[1px] bg-peach/30">
                  <Image
                    src={photoUrl}
                    alt="Kỷ niệm"
                    fill
                    sizes="80px"
                    className="object-cover"
                  />
                </div>
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 text-sm drop-shadow">
                  📎
                </span>
              </div>
            )}

            {/* Nửa trên: Tên người nhận */}
            <div className="pr-20 pt-1">
              <span className="font-script text-2xl sm:text-3xl text-ink/75 leading-none block">
                Thư gửi riêng cho
              </span>
              <h2 className="font-script text-4xl sm:text-5xl text-ink leading-tight mt-0.5">
                {recipientName ? `Gửi ${recipientName}` : 'Gửi người thương'}
              </h2>
            </div>

            {/* Nửa dưới: Gợi ý chạm mở thư với hiệu ứng gợn sóng mực hoài niệm (Ink Ripple Aura) */}
            <div className="relative flex flex-col items-center justify-center pb-2 pt-1">
              {/* Vòng gợn sóng mực lan tỏa êm ái */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <span className="animate-ink-ripple absolute size-14 rounded-full border border-[#8c5238]/30 bg-[#8c5238]/5" />
                <span className="animate-ink-ripple-delayed absolute size-14 rounded-full border border-[#8c5238]/20 bg-[#8c5238]/5" />
              </div>

              {/* Dòng chữ thư pháp Ephesis thở nhịp êm ái */}
              <div className="animate-breathe relative z-10 flex items-center justify-center text-ink/85">
                <span className="font-script text-2xl sm:text-3xl tracking-wide select-none">
                  ~ Chạm để mở thư ~
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* LỚP 2: MẶT TRƯỚC PHONG BÌ (Envelope Front / Pocket - Z-20 che chân lá thư) */}
        <div className="absolute inset-0 z-20 pointer-events-none">
          <Image
            src="/images/vintage/envelope-pocket.png"
            alt="Mặt trước phong bì"
            fill
            priority
            sizes="480px"
            className="object-contain"
          />
        </div>

        {/* LỚP 3: NẮP TAM GIÁC PHONG BÌ (Envelope Flap - Z-30 khi đóng, Z-5 khi lật mở) */}
        <div
          className="absolute inset-0 pointer-events-none transition-transform duration-500 ease-in-out"
          style={{
            transformOrigin: '50% 10.185%',
            transformStyle: 'preserve-3d',
            transform: isFlapOpen ? 'rotateX(180deg)' : 'rotateX(0deg)',
            zIndex: isFlapOpen ? 5 : 30,
          }}
        >
          {/* Mặt ngoài nắp (khi đóng) */}
          <div className="absolute inset-0 [backface-visibility:hidden]">
            <Image
              src="/images/vintage/envelope-flap.png"
              alt="Nắp phong bì"
              fill
              priority
              sizes="480px"
              className="object-contain"
            />
          </div>

          {/* Mặt trong nắp (khi lật 180 độ lên trên) */}
          <div
            className="absolute inset-0 [backface-visibility:hidden]"
            style={{ transform: 'rotateY(180deg)' }}
          >
            <Image
              src="/images/vintage/envelope-flap-inner.png"
              alt="Mặt trong nắp phong bì"
              fill
              sizes="480px"
              className="object-contain"
            />
          </div>
        </div>

        {/* LỚP 4: CON DẤU SÁP & BRAND TICTAP (Giai đoạn 1 khi phong bì đóng kín) */}
        <div
          className={`absolute inset-0 z-40 flex flex-col items-center justify-center pt-8 transition-opacity duration-300 ${
            stage === 'closed' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
          }`}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onOpenSeal()
            }}
            aria-label="Mở niêm phong sáp"
            className="group relative size-20 sm:size-24 cursor-pointer transition-transform duration-300 hover:scale-110 active:scale-95 focus-visible:outline-none"
          >
            <div className="animate-seal-pulse relative size-full">
              <Image
                src="/images/vintage/seal-stamp.png"
                alt="Dấu sáp niêm phong"
                fill
                sizes="96px"
                className="object-contain"
                priority
              />
            </div>
          </button>

          <div className="absolute bottom-6 sm:bottom-7 flex flex-col items-center pointer-events-none">
            <span className="font-script text-2xl sm:text-3xl text-ink tracking-wide leading-none drop-shadow-sm">
              tictap
            </span>
            <span className="font-script text-lg sm:text-xl text-ink/75 mt-0.5 animate-breathe">
              ~ Chạm dấu sáp để mở ~
            </span>
          </div>
        </div>
      </div>

      {/* GIAI ĐOẠN 3: LÁ THƯ PHÓNG TO MỞ TRỌN VẸN (1 TỜ LIỀN MẠCH, KHÔNG CẮT RỜI) */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 transition-all duration-500 ease-in-out ${
          isReadingLetter
            ? 'opacity-100 scale-100 pointer-events-auto'
            : 'opacity-0 scale-95 pointer-events-none'
        }`}
      >
        <div
          onClick={handleSkipTyping}
          className="relative w-[min(94vw,560px)] h-[min(84vh,700px)] flex flex-col select-text"
        >
          {/* NÚT (X) ĐÓNG THƯ & REVERSE TOÀN BỘ QUÁ TRÌNH */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              onCloseFull()
            }}
            aria-label="Đóng thư và gấp lại phong bì"
            className="absolute right-3 top-3 z-40 flex size-9 items-center justify-center rounded-full bg-[#4a2e26] text-cream shadow-2xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
          >
            <X className="size-4" />
          </button>

          {/* MỘT TỜ THƯ VINTAGE LIỀN MẠCH DUY NHẤT (Single sheet, no split halves) */}
          <article className="paper-sheet relative flex flex-col size-full rounded-sm border border-[#dec6a1] shadow-2xl overflow-hidden p-6 sm:p-9 text-ink">
            {/* Khung nội dung cuộn mượt mà */}
            <div
              ref={contentRef}
              className="ink flex-1 overflow-y-auto pr-2 sm:pr-4 scroll-smooth"
              style={{
                scrollbarWidth: 'thin',
                scrollbarColor: 'rgba(74, 46, 38, 0.25) transparent',
              }}
            >
              {blocks.map((block, idx) => {
                if (idx > revealedBlockIndex) return null

                const isCurrent = idx === revealedBlockIndex && !isFinished
                const displayText = isCurrent
                  ? Array.from(block.text).slice(0, revealedCharCount).join('')
                  : block.text

                if (block.kind === 'greeting') {
                  return (
                    <h1
                      key={idx}
                      className="font-script text-4xl sm:text-5xl text-ink leading-tight mb-5"
                    >
                      {displayText}
                      {isCurrent && (
                        <span className="inline-block relative -top-3 ml-1 size-8 sm:size-10 pointer-events-none align-baseline animate-pen-nib">
                          <Image
                            src="/images/vintage/inkpen.png"
                            alt="Bút lông"
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </span>
                      )}
                    </h1>
                  )
                }

                if (block.kind === 'paragraph') {
                  return (
                    <p
                      key={idx}
                      className="font-script text-2xl sm:text-3xl text-ink/90 leading-relaxed mb-4 indent-6"
                    >
                      {displayText}
                      {isCurrent && (
                        <span className="inline-block relative -top-2 ml-1 size-8 sm:size-10 pointer-events-none align-baseline animate-pen-nib">
                          <Image
                            src="/images/vintage/inkpen.png"
                            alt="Bút lông"
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </span>
                      )}
                    </p>
                  )
                }

                if (block.kind === 'closing') {
                  return (
                    <div
                      key={idx}
                      className="font-script text-3xl sm:text-4xl text-right text-ink/80 mt-6"
                    >
                      {displayText}
                      {isCurrent && (
                        <span className="inline-block relative -top-2 ml-1 size-8 sm:size-10 pointer-events-none align-baseline animate-pen-nib">
                          <Image
                            src="/images/vintage/inkpen.png"
                            alt="Bút lông"
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </span>
                      )}
                    </div>
                  )
                }

                if (block.kind === 'signature') {
                  return (
                    <div
                      key={idx}
                      className="font-script text-4xl sm:text-5xl text-right text-ink mt-1 pr-2"
                    >
                      {displayText}
                      {isCurrent && (
                        <span className="inline-block relative -top-2 ml-1 size-8 sm:size-10 pointer-events-none align-baseline animate-pen-nib">
                          <Image
                            src="/images/vintage/inkpen.png"
                            alt="Bút lông"
                            fill
                            sizes="40px"
                            className="object-contain"
                          />
                        </span>
                      )}
                    </div>
                  )
                }

                return null
              })}

              {/* Ảnh Polaroid của khách ở cuối thư - CHỈ HIỆN KHI VIẾT XONG HOẶC CHẠM BỎ QUA */}
              {/* Ảnh Polaroid của khách ở cuối thư - CHỈ HIỆN KHI VIẾT XONG ĐỂ CỐ ĐỊNH, KHÔNG BỊ DỊCH CHUYỂN */}
              {/* Dán lệch phải và hơi nghiêng nhẹ theo phong cách vintage */}
              {photoUrl && isFinished && (
                <div className="mt-8 flex justify-end pr-2 sm:pr-6 pb-6 animate-fade-in-up">
                  <div
                    onClick={(e) => {
                      e.stopPropagation()
                      setLightboxOpen(true)
                    }}
                    className="group relative cursor-pointer rounded-sm bg-white p-2.5 sm:p-3 shadow-[0_14px_30px_rgba(74,46,38,0.28)] rotate-2 sm:rotate-3 transition-transform duration-300 hover:scale-105 hover:rotate-1"
                  >
                    {/* Miếng băng dính washi tape vintage dán mép trên */}
                    <span
                      aria-hidden="true"
                      className="absolute -top-2.5 left-1/2 -translate-x-1/2 h-4 w-14 rounded-[1px] bg-[#f5ecce]/90 backdrop-blur-[1px] shadow-sm border border-[#c4a076]/30 -rotate-3"
                    />

                    <div className="relative max-w-[190px] sm:max-w-[230px] overflow-hidden rounded-[2px]">
                      <img
                        src={photoUrl}
                        alt="Ảnh kỷ niệm"
                        className="h-auto w-full object-contain"
                      />
                      <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-colors group-hover:bg-black/20">
                        <Maximize2 className="size-5 text-white opacity-0 transition-opacity group-hover:opacity-100 drop-shadow" />
                      </div>
                    </div>
                    <p className="mt-2 text-center font-script text-2xl text-ink/75">
                      Khoảnh khắc đẹp
                    </p>
                  </div>
                </div>
              )}
            </div>
          </article>
        </div>
      </div>

      {/* Lightbox phóng to ảnh khi chạm vào */}
      {lightboxOpen && photoUrl && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-60 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-unfold cursor-zoom-out"
        >
          <div className="relative max-h-[90vh] max-w-[92vw]">
            <img
              src={photoUrl}
              alt="Ảnh kỷ niệm phóng to"
              className="max-h-[85vh] max-w-[90vw] rounded-lg object-contain shadow-2xl"
            />
            <p className="mt-3 text-center font-script text-2xl text-white/80">
              Chạm bất kỳ đâu để đóng
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default Envelope
