import type { Metadata } from 'next'
import './recruit.css'

export const metadata: Metadata = {
  title: '採用情報 | センチュリー21ホームマート',
  description: '"怖い営業"から"楽しい営業"へ。センチュリー21ホームマートの3ヶ月研修で未経験から成長。助け合いと自社施工の力で営業力を伸ばす。',
}

export default function RecruitLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ja">
      <body className="font-jp">
        {children}
      </body>
    </html>
  )
}
