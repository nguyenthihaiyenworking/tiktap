'use client'

import { useEffect, useRef } from 'react'

const COLORS = ['#FFFAD3', '#FFDBB0', '#FFCCB8', '#FFB1B1']

type AudioVisualizerProps = {
  analyser: AnalyserNode | null
  playing: boolean
}

export function AudioVisualizer({ analyser, playing }: AudioVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const playingRef = useRef(playing)
  playingRef.current = playing

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let frame = 0
    let heights: number[] = []
    const data = analyser ? new Uint8Array(analyser.frequencyBinCount) : null

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      canvas.width = canvas.clientWidth * dpr
      canvas.height = canvas.clientHeight * dpr
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }
    resize()
    const observer = new ResizeObserver(resize)
    observer.observe(canvas)

    const draw = (time: number) => {
      const width = canvas.clientWidth
      const height = canvas.clientHeight
      const barWidth = 4
      const gap = 3
      const count = Math.max(8, Math.floor(width / (barWidth + gap)))
      if (heights.length !== count) heights = new Array(count).fill(0)

      if (analyser && data) analyser.getByteFrequencyData(data)

      ctx.clearRect(0, 0, width, height)
      const gradient = ctx.createLinearGradient(0, 0, width, 0)
      COLORS.forEach((c, i) => gradient.addColorStop(i / (COLORS.length - 1), c))
      gradient.addColorStop(1, COLORS[0])
      ctx.fillStyle = gradient

      const half = Math.ceil(count / 2)
      for (let i = 0; i < count; i++) {
        const mirrored = i < half ? half - 1 - i : i - half
        const t = mirrored / half
        let target = 0.04 + 0.03 * Math.sin(time / 700 + i * 0.35)
        if (data && playingRef.current) {
          const bin = Math.floor(Math.pow(t, 1.6) * data.length * 0.55)
          target = Math.max(target, (data[bin] / 255) ** 1.4)
        }
        heights[i] += (target - heights[i]) * 0.22
        const h = Math.max(2, heights[i] * height)
        const x = i * (barWidth + gap) + (width - count * (barWidth + gap)) / 2
        ctx.beginPath()
        ctx.roundRect(x, height - h, barWidth, h, [2, 2, 0, 0])
        ctx.fill()
      }
      frame = requestAnimationFrame(draw)
    }
    frame = requestAnimationFrame(draw)

    return () => {
      cancelAnimationFrame(frame)
      observer.disconnect()
    }
  }, [analyser])

  return <canvas ref={canvasRef} aria-hidden="true" className="block h-16 w-full opacity-90" />
}
