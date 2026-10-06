'use client'

import { FastForward, RotateCcw } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { letter, song } from '@/lib/letter'
import { TypewriterSound } from '@/lib/typewriter-sound'
import { Envelope } from './envelope'
import { LetterPaper } from './letter-paper'
import { MusicPlayer } from './music-player'

type Phase = 'sealed' | 'opening' | 'typing' | 'done'

function buildCharMap() {
  const chars: { char: string; blockStart: boolean }[] = []
  for (const block of letter) {
    Array.from(block.text).forEach((char, i) => chars.push({ char, blockStart: i === 0 }))
  }
  return chars
}

function delayFor(index: number, chars: ReturnType<typeof buildCharMap>) {
  if (index === 0) return 700
  const prev = chars[index - 1].char
  const r = Math.random()
  if (chars[index].blockStart) return 1100 + r * 700
  if ('.!?…'.includes(prev)) return 380 + r * 420
  if (',;:—'.includes(prev)) return 160 + r * 160
  if (prev === ' ' && r < 0.045) return 400 + Math.random() * 700
  return 38 + r * 62
}

export function LetterExperience() {
  const chars = useMemo(buildCharMap, [])
  const total = chars.length

  const [phase, setPhase] = useState<Phase>('sealed')
  const [count, setCount] = useState(0)
  const [analyser, setAnalyser] = useState<AnalyserNode | null>(null)

  const audioRef = useRef<HTMLAudioElement>(null)
  const ctxRef = useRef<AudioContext | null>(null)
  const soundRef = useRef<TypewriterSound | null>(null)

  const ensureAudio = useCallback(() => {
    if (!ctxRef.current && audioRef.current) {
      const ctx = new AudioContext()
      const source = ctx.createMediaElementSource(audioRef.current)
      const node = ctx.createAnalyser()
      node.fftSize = 512
      node.smoothingTimeConstant = 0.8
      source.connect(node).connect(ctx.destination)
      ctxRef.current = ctx
      soundRef.current = new TypewriterSound(ctx)
      setAnalyser(node)
    }
    void ctxRef.current?.resume()
  }, [])

  const togglePlay = useCallback(() => {
    ensureAudio()
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }, [ensureAudio])

  const open = () => {
    ensureAudio()
    if (audioRef.current) {
      audioRef.current.volume = 0.55
      void audioRef.current.play().catch(() => {})
    }
    setPhase('opening')
    window.setTimeout(() => setPhase('typing'), 650)
  }

  useEffect(() => {
    if (phase !== 'typing') return
    const id = window.setTimeout(() => {
      const { char } = chars[count]
      const sound = soundRef.current
      if (char === ' ') sound?.space()
      else if (char.trim()) sound?.key()

      const next = count + 1
      if (next >= total || chars[next]?.blockStart) sound?.carriageReturn(0.25)
      setCount(next)
      if (next >= total) setPhase('done')
    }, delayFor(count, chars))
    return () => window.clearTimeout(id)
  }, [phase, count, chars, total])

  const skip = () => {
    setCount(total)
    setPhase('done')
    soundRef.current?.carriageReturn()
  }

  const replay = () => {
    setCount(0)
    setPhase('typing')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isOpen = phase === 'typing' || phase === 'done'

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden">
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/photo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover blur-[1.5px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgb(74_46_38/0.45)_100%)]" />
        <div className="absolute inset-0 bg-peach/20 mix-blend-multiply" />
      </div>

      <div className="film-grain" aria-hidden="true" />

      <audio ref={audioRef} src={song.src} loop preload="auto" />

      {isOpen && (
        <button
          type="button"
          onClick={phase === 'done' ? replay : skip}
          className="fixed right-4 top-4 z-40 flex items-center gap-1.5 rounded-full border border-cream/60 bg-cream/75 px-3 py-1.5 text-xs uppercase tracking-[0.2em] text-ink shadow-[0_6px_20px_-8px_rgb(74_46_38/0.6)] backdrop-blur-md transition-colors hover:bg-blush focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {phase === 'done' ? (
            <>
              <RotateCcw className="size-3.5" aria-hidden="true" />
              Đọc lại
            </>
          ) : (
            <>
              <FastForward className="size-3.5" aria-hidden="true" />
              Bỏ qua
            </>
          )}
        </button>
      )}

      <div className="flex min-h-dvh items-center justify-center px-4 pb-48 pt-16">
        {isOpen ? (
          <LetterPaper blocks={letter} visibleCount={count} showCaret={phase === 'typing'} />
        ) : (
          <div className="pb-24">
            <Envelope leaving={phase === 'opening'} onOpen={open} />
          </div>
        )}
      </div>

      <MusicPlayer
        audioRef={audioRef}
        analyser={analyser}
        title={song.title}
        artist={song.artist}
        onTogglePlay={togglePlay}
      />
    </main>
  )
}
