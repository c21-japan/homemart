import type { Metadata } from 'next'
import './globals.css'
import QueryProvider from '@/lib/providers/QueryProvider'
import PublicShell from '@/components/PublicShell'
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
            <PublicShell>{children}</PublicShell>
          </QueryProvider>
        </Providers>
      </body>
    </html>
  )
}
