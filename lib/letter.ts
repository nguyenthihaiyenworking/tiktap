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
    text: 'Đây là chỗ dành cho lá thư của bạn. Mỗi chữ sẽ được gõ ra thật chậm, như thể ai đó đang ngồi bên chiếc máy đánh chữ cũ, thỉnh thoảng dừng lại một chút để nghĩ xem nên viết gì tiếp theo...',
  },
  {
    kind: 'paragraph',
    text: 'Có những điều khó nói thành lời, nên mình viết ra đây. Cảm ơn vì đã ở đây, vì những buổi chiều nắng nhạt, những tách trà nguội dần, và cả những câu chuyện chẳng đầu chẳng cuối.',
  },
  {
    kind: 'paragraph',
    text: 'Khi nào bạn gửi nội dung thật, mình sẽ thay đoạn này. Còn bây giờ, cứ nghe nhạc và đọc chậm thôi nhé.',
  },
  { kind: 'closing', text: 'Thương,' },
  { kind: 'signature', text: 'Người viết thư' },
]

// Swap the song by replacing the file in /public/audio and updating these fields.
export const song = {
  src: '/audio/song.mp3',
  title: 'Gymnopédie No. 1',
  artist: 'Erik Satie',
}
