import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'リフォーム | CENTURY 21 ホームマート - 自社職人による確かな施工',
  description: 'CENTURY 21ホームマートのリフォームサービス。自社職人による水回り4点セット（風呂・キッチン・トイレ・洗面台）から全面改装まで、中間マージンカットで適正価格を実現。確かな技術と充実の保証でお客様をサポート。',
  keywords: [
    'リフォーム',
    '水回り',
    'キッチン',
    '風呂',
    'トイレ',
    '洗面台',
    '自社職人',
    '奈良',
    '大阪',
    'CENTURY21',
    'ホームマート'
  ]
}

export default function ReformLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
