'use client'

import Image from 'next/image'
import { useEffect, useState, type RefObject } from 'react'

type MusicPlayerProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  onTogglePlay: () => void
}

export function MusicPlayer({ audioRef, onTogglePlay }: MusicPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const sync = () => setIsPlaying(!audio.paused)
    audio.addEventListener('play', sync)
    audio.addEventListener('pause', sync)
    audio.addEventListener('ended', sync)
    sync()
    return () => {
      audio.removeEventListener('play', sync)
      audio.removeEventListener('pause', sync)
      audio.removeEventListener('ended', sync)
    }
  }, [audioRef])

  return (
    <div className="fixed right-4 top-4 z-[70]">
      <button
        type="button"
        onClick={onTogglePlay}
        aria-label={isPlaying ? 'Tạm dừng nhạc' : 'Phát nhạc'}
        className="group relative flex size-12 sm:size-14 items-center justify-center rounded-full bg-black/40 p-1 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-md transition-transform duration-300 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#d9777a] cursor-pointer"
      >
        {/* Vinyl Disc Image */}
        <div
          className={`relative size-full transition-all duration-300 ${
            isPlaying ? 'animate-spin-vinyl' : 'opacity-85'
          }`}
        >
          <Image
            src="/images/vintage/cd-disc.png"
            alt="Đĩa than phát nhạc"
            fill
            sizes="56px"
            className="object-contain drop-shadow"
            priority
          />
        </div>

        {/* Center needle/pause badge */}
        {!isPlaying && (
          <span className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 backdrop-blur-[1px]">
            <span className="size-2 rounded-full bg-cream/90 shadow-sm" />
          </span>
        )}
      </button>
    </div>
  )
}
export default MusicPlayer
