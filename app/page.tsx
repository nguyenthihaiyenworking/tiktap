import { VintageTemplate } from '@/components/templates/vintage'
import { getGiftById } from '@/lib/gift-service'

export default async function Page() {
  const demoGift = await getGiftById('demo-vintage')
  return <VintageTemplate data={demoGift} />
}
