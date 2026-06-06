import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    default: 'MiCA License Tracker — EU Crypto Authorization Status',
    template: '%s | MiCA License Tracker',
  },
  description:
    'Track which crypto firms are authorized under the EU MiCA regulation. Live countdown to the 1 July 2026 deadline. Sourced from ESMA and national registers.',
  openGraph: {
    type: 'website',
    locale: 'en_EU',
    siteName: 'MiCA License Tracker',
  },
  twitter: {
    card: 'summary_large_image',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-950 text-zinc-100 antialiased`}>
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  )
}
