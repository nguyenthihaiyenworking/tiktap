'use client'

import Image from 'next/image'
import { useCallback, useMemo, useRef, useState } from 'react'
import { letter as defaultLetter, song as defaultSong } from '@/lib/letter'
import type { GiftData, LetterBlock } from '@/lib/types'
import { Envelope, type VintageStage } from './envelope'
import { MusicPlayer } from './music-player'

type VintageTemplateProps = {
  data?: GiftData | null
}

function convertGiftDataToBlocks(data: GiftData): LetterBlock[] {
  const blocks: LetterBlock[] = [
    {
      kind: 'greeting',
      text: data.recipientName ? `Gửi ${data.recipientName},` : 'Gửi người thương,',
    },
  ]

  const paragraphs = (data.message || '')
    .split(/\n\s*\n|\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  if (paragraphs.length > 0) {
    paragraphs.forEach((p) => {
      blocks.push({ kind: 'paragraph', text: p })
    })
  } else {
    blocks.push({
      kind: 'paragraph',
      text: 'Có những điều khó nói thành lời, nên mình viết ra đây. Cảm ơn vì đã luôn ở bên mình...',
    })
  }

  blocks.push({ kind: 'closing', text: 'Thương,' })
  blocks.push({
    kind: 'signature',
    text: data.senderName || 'Người gửi thư',
  })

  return blocks
}

export function VintageTemplate({ data }: VintageTemplateProps) {
  const activeBlocks = useMemo(() => {
    if (data) return convertGiftDataToBlocks(data)
    return defaultLetter
  }, [data])

  const songSrc = data?.songUrl || defaultSong.src
  const photoSrc = data?.photoUrl || null

  const [stage, setStage] = useState<VintageStage>('closed')

  const audioRef = useRef<HTMLAudioElement>(null)
  const audioCtxRef = useRef<AudioContext | null>(null)

  // Khởi động nhạc & AudioContext
  const initAudio = useCallback(() => {
    try {
      if (!audioCtxRef.current && typeof window !== 'undefined') {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
        if (AudioCtx) {
          audioCtxRef.current = new AudioCtx()
        }
      }
      void audioCtxRef.current?.resume()
    } catch {}

    if (audioRef.current) {
      audioRef.current.volume = 0.65
      void audioRef.current.play().catch(() => {})
    }
  }, [])

  // BƯỚC 1: Chạm con dấu sáp -> NẮP PHONG BÌ MỞ LÊN TRƯỚC -> THƯ MỚI TRƯỢT LÊN
  const handleOpenSeal = useCallback(() => {
    initAudio()

    // 1.1: Nắp mở lên trước (500ms)
    setStage('opening-flap')

    setTimeout(() => {
      // 1.2: Sau khi nắp đã mở hẳn, thư mới từ trong ruột phong bì trượt lên (600ms)
      setStage('sliding-out')

      setTimeout(() => {
        // 1.3: Đến trạng thái thư gập nhô lên nửa chừng, chờ vuốt / chạm
        setStage('halfway')
      }, 600)
    }, 500)
  }, [initAudio])

  // BƯỚC 2: Chạm vào thư / vuốt lên -> THƯ PHÓNG TO MỞ TRỌN VẸN
  const handleOpenFull = useCallback(() => {
    // 2.1: Thư phóng to mở trọn vẹn (500ms)
    setStage('unfolding')

    setTimeout(() => {
      // 2.2: Mở trọn vẹn, ngòi bút bắt đầu nắn nót viết chữ
      setStage('full')
    }, 500)
  }, [])

  // BƯỚC 3: Nhấn nút (X) -> REVERSE TOÀN BỘ QUÁ TRÌNH NGƯỢC LẠI
  const handleClose = useCallback(() => {
    // 3.1: Thư thu nhỏ lại về vị trí nhô lên nửa chừng (500ms)
    setStage('folding')

    setTimeout(() => {
      // 3.2: Thư trượt ngược lại chui sâu vào lòng phong bì (600ms)
      setStage('sliding-in')

      setTimeout(() => {
        // 3.3: Nắp phong bì gập ngược lại 180deg -> 0deg (500ms)
        setStage('closing-flap')

        setTimeout(() => {
          // 3.4: Trở về trạng thái phong bì đóng kín ban đầu, dấu sáp dán lại
          setStage('closed')
        }, 500)
      }, 600)
    }, 500)
  }, [])

  const togglePlay = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return
    if (audio.paused) void audio.play()
    else audio.pause()
  }, [])

  return (
    <main className="relative isolate min-h-dvh overflow-x-hidden flex flex-col justify-center items-center">
      {/* Background mờ vintage ấm áp */}
      <div className="fixed inset-0 -z-10">
        <Image
          src="/images/photo.png"
          alt=""
          fill
          priority
          sizes="100vw"
          className="scale-105 object-cover blur-[2px]"
        />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_30%,rgb(74_46_38/0.5)_100%)]" />
        <div className="absolute inset-0 bg-peach/25 mix-blend-multiply" />
      </div>

      {/* Hiệu ứng hạt phim nhựa hoài niệm */}
      <div className="film-grain" aria-hidden="true" />

      {/* Thẻ audio ẩn */}
      <audio ref={audioRef} src={songSrc} loop preload="auto" />

      {/* Đĩa than xoay phát nhạc ở góc phải */}
      <MusicPlayer audioRef={audioRef} onTogglePlay={togglePlay} />

      {/* Khung phong bì & Lá thư thống nhất nhịp nhàng */}
      <div className="w-full flex items-center justify-center px-4 py-8">
        <Envelope
          stage={stage}
          recipientName={data?.recipientName}
          photoUrl={photoSrc}
          blocks={activeBlocks}
          audioCtxRef={audioCtxRef}
          onOpenSeal={handleOpenSeal}
          onOpenFull={handleOpenFull}
          onCloseFull={handleClose}
        />
      </div>
    </main>
  )
}
export default VintageTemplate
