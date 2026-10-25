import type { GiftData } from './types'

// Dữ liệu mẫu (mock) để test tức thì các đường link
const MOCK_GIFTS: Record<string, GiftData> = {
  'demo-vintage': {
    id: 'demo-vintage',
    templateId: 'vintage',
    recipientName: 'Người thương',
    senderName: 'Người gửi thư',
    message:
      'Có những điều khó nói thành lời, nên mình gói vào từng nét mực gửi đến bạn.\n\nCảm ơn vì đã luôn ở đây, cùng đi qua những ngày nắng êm và cả những khoảnh khắc bình dị nhất.',
    photoUrl: '/images/zootopia.jpg',
    songUrl: '/audio/song.mp3',
  },
  'demo-love': {
    id: 'demo-love',
    templateId: 'love',
    recipientName: 'Bé Yêu',
    senderName: 'Anh người yêu',
    message:
      'Chúc em một ngày 20/10 ngập tràn nụ cười và hạnh phúc.\n\nCảm ơn em vì đã đến và làm cho mỗi ngày của anh đều trở nên đặc biệt hơn.',
    photoUrl: '/images/photo.png',
    songUrl: '/audio/song.mp3',
  },
  'demo-cipher': {
    id: 'demo-cipher',
    templateId: 'cipher',
    recipientName: 'Người Thương',
    senderName: 'Thám tử tình yêu',
    message:
      'Có những điều giấu kín trong tim chỉ có thể giải mã bằng sự chân thành.\n\nChúc bạn ngày 20/10 thật rạng rỡ!',
    photoUrl: '/images/photo.png',
    songUrl: '/audio/song.mp3',
  },
}

export async function getGiftById(id: string): Promise<GiftData | null> {
  // 1. Kiểm tra ID mẫu trước (để bạn test không cần mở Supabase)
  if (MOCK_GIFTS[id]) {
    return MOCK_GIFTS[id]
  }

  // 2. Query Supabase khi có biến môi trường
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (supabaseUrl && supabaseKey) {
    try {
      const res = await fetch(
        `${supabaseUrl}/rest/v1/gifts?id=eq.${id}&select=*`,
        {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          next: { revalidate: 60 },
        } as any
      )

      if (!res.ok) return null
      const rows = await res.json()
      if (Array.isArray(rows) && rows.length > 0) {
        const row = rows[0]
        return {
          id: row.id,
          templateId: row.template_id || 'vintage',
          recipientName: row.recipient_name || '',
          senderName: row.sender_name || '',
          message: row.message || '',
          photoUrl: row.photo_url || null,
          songUrl: row.song_url || null,
        }
      }
    } catch (err) {
      console.error('Error fetching gift from Supabase:', err)
    }
  }

  return null
}
