import { clerkConfig } from '@clerk/nextjs'

export default clerkConfig({
  // 多要素認証を無効化
  multiFactor: {
    enabled: false,
  },
  // セッション設定
  session: {
    singleFactor: true,
  },
  // 認証フロー設定
  signIn: {
    redirectUrl: '/admin',
  },
  signUp: {
    redirectUrl: '/admin',
  },
})
