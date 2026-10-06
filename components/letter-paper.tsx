'use client'

import { memo, useEffect, useRef } from 'react'
import type { LetterBlock } from '@/lib/letter'

type LetterPaperProps = {
  blocks: LetterBlock[]
  visibleCount: number
  showCaret: boolean
}

function inkVariation(index: number) {
  const seed = Math.sin(index * 12.9898) * 43758.5453
  const r = seed - Math.floor(seed)
  return { opacity: 0.74 + r * 0.26, offset: (r - 0.5) * 0.9 }
}

const TypedText = memo(function TypedText({
  text,
  count,
  startIndex,
}: {
  text: string
  count: number
  startIndex: number
}) {
  const chars = Array.from(text.slice(0, count))
  return (
    <>
      {chars.map((char, i) => {
        const { opacity, offset } = inkVariation(startIndex + i)
        return (
          <span
            key={i}
            style={{ opacity, display: 'inline', position: 'relative', top: `${offset}px` }}
          >
            {char}
          </span>
        )
      })}
    </>
  )
})

const blockStyles: Record<LetterBlock['kind'], string> = {
  greeting: 'font-script text-4xl sm:text-5xl leading-tight mb-6',
  paragraph: 'text-base sm:text-lg leading-[1.9] mb-5 indent-8',
  closing: 'text-base sm:text-lg mt-8',
  signature: 'font-script text-4xl sm:text-5xl leading-tight mt-1 text-right pr-4',
}

export function LetterPaper({ blocks, visibleCount, showCaret }: LetterPaperProps) {
  const caretRef = useRef<HTMLSpanElement>(null)
  const scrollBucket = Math.floor(visibleCount / 24)

  useEffect(() => {
    caretRef.current?.scrollIntoView({ block: 'nearest', behavior: 'smooth' })
  }, [scrollBucket])

  let offset = 0
  let caretPlaced = false
  const fullText = blocks.map((b) => b.text).join('\n\n')

  return (
    <article
      className="relative w-[min(92vw,680px)] animate-unfold drop-shadow-[0_35px_45px_rgb(74_46_38/0.45)]"
      aria-label="Lá thư"
    >
      <div className="paper-sheet ink min-h-[min(82vh,940px)] px-8 py-12 sm:px-16 sm:py-16">
        <p className="sr-only">{fullText}</p>
        <div aria-hidden="true">
          {blocks.map((block, i) => {
            const start = offset
            const length = Array.from(block.text).length
            offset += length
            const count = Math.max(0, Math.min(length, visibleCount - start))
            const hasCaret = !caretPlaced && visibleCount <= start + length
            if (hasCaret) caretPlaced = true
            if (count === 0 && !hasCaret) return null

            return (
              <p key={i} className={`whitespace-pre-wrap ${blockStyles[block.kind]}`}>
                <TypedText text={block.text} count={count} startIndex={start} />
                {showCaret && hasCaret && (
                  <span
                    ref={caretRef}
                    className="animate-caret ml-px inline-block h-[1.05em] w-[0.5ch] translate-y-[0.18em] bg-ink/70 [scroll-margin-bottom:220px]"
                  />
                )}
              </p>
            )
          })}
        </div>
      </div>
    </article>
  )
}
