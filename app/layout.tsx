import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SiteHeader } from '@/components/site-header'
import { CursorSparkle } from '@/components/cursor-sparkle'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'You Don\'t Need This - Premium Tech Boutique',
  description: 'Curated premium tech for those who appreciate the extraordinary. 100+ exclusive items that redefine luxury gadgetry.',
    generator: 'v0.app'
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <CursorSparkle />
        <SiteHeader />
        <div className="pt-16">{children}</div>
      </body>
    </html>
  )
}
