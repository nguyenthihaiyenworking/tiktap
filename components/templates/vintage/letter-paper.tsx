'use client'

import Image from 'next/image'
import { X, Maximize2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import type { LetterBlock } from '@/lib/types'
import { PenScratchSound } from './pen-scratch-sound'

type LetterPaperProps = {
  blocks: LetterBlock[]
  photoUrl?: string | null
  audioCtxRef?: React.RefObject<AudioContext | null>
  onClose: () => void
}

export function LetterPaper({
  blocks,
  photoUrl,
  audioCtxRef,
  onClose,
}: LetterPaperProps) {
  const [revealedBlockIndex, setRevealedBlockIndex] = useState(0)
  const [revealedCharCount, setRevealedCharCount] = useState(0)
  const [isFinished, setIsFinished] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [lightboxOpen, setLightboxOpen] = useState(false)

  const contentRef = useRef<HTMLDivElement>(null)
  const penSoundRef = useRef<PenScratchSound | null>(null)

  // Khởi tạo âm thanh ngòi bút cọ trên giấy
  useEffect(() => {
    if (audioCtxRef?.current && !penSoundRef.current) {
      penSoundRef.current = new PenScratchSound(audioCtxRef.current)
    }
  }, [audioCtxRef])

  const currentBlock = blocks[revealedBlockIndex]
  const currentBlockLength = currentBlock ? Array.from(currentBlock.text).length : 0

  // Viết chữ từng ký tự với tốc độ tự nhiên và tiếng ngòi bút sột soạt
  useEffect(() => {
    if (isFinished || isClosing) return

    const char = currentBlock?.text?.[revealedCharCount] || ''
    // Nghỉ nhẹ ở dấu câu cho tự nhiên
    const delay = '.!?…'.includes(char) ? 140 : ',;:—'.includes(char) ? 90 : 55

    const timer = setTimeout(() => {
      // Phát tiếng ngòi bút cọ sột soạt nhẹ
      if (char.trim() && Math.random() < 0.6) {
        penSoundRef.current?.scratch()
      }

      setRevealedCharCount((prev) => {
        const next = prev + 1
        if (next >= currentBlockLength) {
          if (revealedBlockIndex + 1 < blocks.length) {
            setRevealedBlockIndex((b) => b + 1)
            return 0
          } else {
            setIsFinished(true)
            return currentBlockLength
          }
        }
        return next
      })

      // Tự động cuộn theo nét bút
      if (contentRef.current) {
        contentRef.current.scrollTop = contentRef.current.scrollHeight
      }
    }, delay)

    return () => clearTimeout(timer)
  }, [revealedBlockIndex, currentBlockLength, blocks.length, isFinished, isClosing, revealedCharCount, currentBlock])

  // Xử lý khi nhấn nút (X) -> Reverse quá trình gấp thư lại
  const handleCloseClick = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
    }, 450)
  }

  return (
    <>
      {/* TỜ THƯ CỐ ĐỊNH KÍCH THƯỚC (BUNG MỞ NẾP GẤP TỰ NHIÊN, KHÔNG DÀI RA) */}
      <div
        className={`relative w-[min(94vw,560px)] h-[80vh] max-h-[720px] transition-all duration-500 ease-in-out select-text ${
          isClosing
            ? 'scale-90 opacity-0 translate-y-12'
            : 'animate-unfold opacity-100 scale-100 translate-y-0'
        }`}
      >
        {/* Nút đóng X ở góc trên để gấp thư lại */}
        <button
          type="button"
          onClick={handleCloseClick}
          aria-label="Đóng thư và gấp lại phong bì"
          className="absolute -right-2 -top-3 z-30 flex size-9 items-center justify-center rounded-full bg-[#4a2e26] text-cream shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          <X className="size-4" />
        </button>

        {/* Thân bức thư kraft với kích thước cố định hoàn toàn */}
        <article className="paper-sheet flex flex-col h-full rounded-sm p-6 sm:p-10 shadow-[0_30px_70px_rgba(74,46,38,0.55)] border border-[#e8d5b5]">
          {/* VÙNG NỘI DUNG CUỘN LÊN XUỐNG MƯỢT MÀ */}
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
                    {/* Bút lông vũ lướt ngay sau nét chữ */}
                    {isCurrent && (
                      <span className="inline-block relative -top-3 ml-1 size-8 sm:size-10 pointer-events-none align-middle animate-bounce-soft">
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
                    {/* Bút lông vũ lướt ngay sau nét chữ */}
                    {isCurrent && (
                      <span className="inline-block relative -top-2 ml-1 size-8 sm:size-10 pointer-events-none align-middle animate-bounce-soft">
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
                      <span className="inline-block relative -top-2 ml-1 size-8 sm:size-10 pointer-events-none align-middle animate-bounce-soft">
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
                      <span className="inline-block relative -top-2 ml-1 size-8 sm:size-10 pointer-events-none align-middle animate-bounce-soft">
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

            {/* Khung ảnh Polaroid của khách ở cuối thư (tự ôm theo tỉ lệ thật) */}
            {photoUrl && (
              <div className="mt-8 flex justify-center pb-4">
                <div
                  onClick={() => setLightboxOpen(true)}
                  className="group relative cursor-pointer rounded-sm bg-white p-2.5 sm:p-3 shadow-[0_10px_25px_rgba(74,46,38,0.25)] transition-transform duration-300 hover:scale-105 hover:-rotate-1"
                >
                  {/* Băng dính washi dán góc */}
                  <span
                    aria-hidden="true"
                    className="absolute -top-2 left-1/2 -translate-x-1/2 h-4 w-12 rounded-[1px] bg-[#f0ebd9]/90 shadow-sm border border-black/5 -rotate-2"
                  />

                  {/* Ảnh kỷ niệm giữ trọn 100% tỉ lệ thật */}
                  <div className="relative max-w-[200px] sm:max-w-[240px] overflow-hidden rounded-[2px]">
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

      {/* Lightbox phóng to ảnh khi chạm vào */}
      {lightboxOpen && photoUrl && (
        <div
          onClick={() => setLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm animate-unfold cursor-zoom-out"
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
    </>
  )
}
export default LetterPaper
