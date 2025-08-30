'use client'
import { SignIn } from '@clerk/nextjs'

export default function Page() {
  // Clerk無効時でもビルドを通すためのフォールバック
  if (process.env.NEXT_PUBLIC_DISABLE_CLERK === '1') {
    return (
      <main className="mx-auto max-w-md p-6">
        <h1 className="text-xl font-bold mb-2">ログイン（開発モード）</h1>
        <p>現在、Clerkは無効化されています（NEXT_PUBLIC_DISABLE_CLERK=1）。</p>
      </main>
    )
  }
  return <SignIn routing="hash" />
}
