import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Ephesis, Xanh_Mono } from 'next/font/google'
import './globals.css'

const ephesis = Ephesis({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-ephesis',
})

const xanhMono = Xanh_Mono({
  weight: '400',
  subsets: ['latin', 'vietnamese'],
  variable: '--font-xanh-mono',
})

export const metadata: Metadata = {
  title: 'Một lá thư cho bạn',
  description: 'Một lá thư cũ, tự gõ từng chữ dành riêng cho bạn.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'light',
  themeColor: '#FFDBB0',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="vi" className={`${ephesis.variable} ${xanhMono.variable} bg-peach`}>
      <body className="font-type antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
