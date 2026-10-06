'use client'

import { Pause, Play } from 'lucide-react'
import { useEffect, useState, type RefObject } from 'react'
import { AudioVisualizer } from './audio-visualizer'

type MusicPlayerProps = {
  audioRef: RefObject<HTMLAudioElement | null>
  analyser: AnalyserNode | null
  title: string
  artist: string
  onTogglePlay: () => void
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return '0:00'
  const m = Math.floor(seconds / 60)
  const s = Math.floor(seconds % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

export function MusicPlayer({ audioRef, analyser, title, artist, onTogglePlay }: MusicPlayerProps) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [duration, setDuration] = useState(0)

  useEffect(() => {
    const audio = audioRef.current
    if (!audio) return
    const sync = () => {
      setPlaying(!audio.paused)
      setCurrent(audio.currentTime)
      setDuration(audio.duration || 0)
    }
    const events = ['play', 'pause', 'timeupdate', 'loadedmetadata', 'ended'] as const
    events.forEach((e) => audio.addEventListener(e, sync))
    sync()
    return () => events.forEach((e) => audio.removeEventListener(e, sync))
  }, [audioRef])

  const progress = duration ? (current / duration) * 100 : 0

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center">
      <div className="pointer-events-auto mb-2 flex w-[min(92vw,420px)] items-center gap-3 rounded-full border border-cream/60 bg-cream/75 py-2 pl-2 pr-5 text-ink shadow-[0_10px_30px_-10px_rgb(74_46_38/0.5)] backdrop-blur-md">
        <button
          type="button"
          onClick={onTogglePlay}
          aria-label={playing ? 'Tạm dừng nhạc' : 'Phát nhạc'}
          className="flex size-10 shrink-0 items-center justify-center rounded-full bg-rose text-ink transition-transform hover:scale-105 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          {playing ? <Pause className="size-4 fill-current" /> : <Play className="size-4 translate-x-px fill-current" />}
        </button>
        <div className="min-w-0 flex-1">
          <div className="flex items-baseline justify-between gap-2">
            <p className="truncate font-script text-2xl leading-none">{title}</p>
            <p className="shrink-0 text-[11px] tabular-nums opacity-70">
              {formatTime(current)} / {formatTime(duration)}
            </p>
          </div>
          <p className="truncate text-[11px] uppercase tracking-[0.2em] opacity-70">{artist}</p>
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={current}
            aria-label="Tua bài hát"
            onChange={(e) => {
              if (audioRef.current) audioRef.current.currentTime = Number(e.target.value)
            }}
            className="mt-1 h-1 w-full cursor-pointer appearance-none rounded-full accent-[#d9777a]"
            style={{
              background: `linear-gradient(to right, #d9777a ${progress}%, rgb(74 46 38 / 0.18) ${progress}%)`,
            }}
          />
        </div>
      </div>
      <AudioVisualizer analyser={analyser} playing={playing} />
    </div>
  )
}
