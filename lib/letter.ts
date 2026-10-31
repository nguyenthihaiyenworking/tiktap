export type LetterBlock = {
  kind: 'greeting' | 'paragraph' | 'closing' | 'signature'
  text: string
}

// Replace these blocks with your own letter. Greeting and signature use the
// Ephesis script font; paragraphs and closing use the typewriter font.
export const letter: LetterBlock[] = [
  { kind: 'greeting', text: 'Gửi người thương,' },
  {
    kind: 'paragraph',
    text: 'Có những điều khó nói thành lời, nên mình gói vào từng nét mực gửi đến bạn.',
  },
  {
    kind: 'paragraph',
    text: 'Cảm ơn vì đã luôn ở đây, cùng đi qua những ngày nắng êm và cả những khoảnh khắc bình dị nhất.',
  },
  { kind: 'closing', text: 'Thương,' },
  { kind: 'signature', text: 'Người gửi thư' },
]

// Swap the song by replacing the file in /public/audio and updating these fields.
export const song = {
  src: '/audio/song.mp3',
  title: 'Gymnopédie No. 1',
  artist: 'Erik Satie',
}

// Default photo when customer does not provide one
export const photo = {
  src: '/images/zootopia.jpg',
  alt: 'Khoảnh khắc kỷ niệm',
}
