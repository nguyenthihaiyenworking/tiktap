export type LetterBlock = {
  kind: 'greeting' | 'paragraph' | 'closing' | 'signature'
  text: string
}

export type TemplateId = 'vintage' | 'love' | 'cipher'

export type GiftData = {
  id: string
  templateId: TemplateId
  recipientName: string
  senderName: string
  message: string
  photoUrl?: string | null
  songUrl?: string | null
}
