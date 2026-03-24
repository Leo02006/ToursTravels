import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import './globals.css'
import { CurrencyProvider } from '@/lib/CurrencyContext'
const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Leo\'s Tours and Travels',
  description: 'Premium Tours, Packages & Visa Services Management System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${outfit.variable} font-sans`}>
      <body className="min-h-screen flex flex-col" suppressHydrationWarning>
        <CurrencyProvider>
          <main className="flex-1">{children}</main>
        </CurrencyProvider>
      </body>
    </html>
  )
}
