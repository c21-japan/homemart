import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/lib/providers/QueryProvider'
import { Header } from '@/components/Header'
import Footer from '@/components/Footer'
import Providers from './providers'

export const metadata: Metadata = {
  title: 'センチュリー21 ホームマート',
  description: '奈良県・南大阪の不動産・リフォーム総合サービス',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-sans">
        <Providers>
          <QueryProvider>
            <div className="min-h-screen flex flex-col">
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </div>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  )
}
