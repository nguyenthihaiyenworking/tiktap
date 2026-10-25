import { notFound } from 'next/navigation'
import { getGiftById } from '@/lib/gift-service'
import { VintageTemplate } from '@/components/templates/vintage'
import { LoveTemplate } from '@/components/templates/love'
import { CipherTemplate } from '@/components/templates/cipher'

type PageProps = {
  params: Promise<{ id: string }>
}

export default async function GiftPage({ params }: PageProps) {
  const { id } = await params
  const gift = await getGiftById(id)

  if (!gift) {
    notFound()
  }

  switch (gift.templateId) {
    case 'love':
      return <LoveTemplate data={gift} />
    case 'cipher':
      return <CipherTemplate data={gift} />
    case 'vintage':
    default:
      return <VintageTemplate data={gift} />
  }
}
