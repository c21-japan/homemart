'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState, ReactNode } from 'react'
import dynamic from 'next/dynamic'

// React Query Devtoolsを動的インポート（クライアントサイドのみ）
const ReactQueryDevtools = dynamic(
  () => import('@tanstack/react-query-devtools').then(mod => mod.ReactQueryDevtools),
  { ssr: false }
)

export default function QueryProvider({ children }: { children: ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // データの新鮮さを5分間保持
            staleTime: 5 * 60 * 1000,
            // キャッシュを10分間保持
            gcTime: 10 * 60 * 1000,
            // エラー時の再試行回数
            retry: 2,
            // フォーカス時の再取得を無効化（パフォーマンス向上）
            refetchOnWindowFocus: false,
            // ネットワーク再接続時の再取得を無効化
            refetchOnReconnect: false,
          },
          mutations: {
            // ミューテーションの再試行回数
            retry: 1,
          },
        },
      })
  )

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      {/* 開発環境でのみReact Query Devtoolsを表示 */}
      {process.env.NODE_ENV === 'development' && <ReactQueryDevtools />}
    </QueryClientProvider>
  )
}
