export const productionConfig = {
  // Supabase設定
  supabase: {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://your-project.supabase.co',
    anonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },

  // メール送信設定
  email: {
    provider: 'mailjet',
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_API_SECRET || '',
    fromEmail: process.env.MAILJET_FROM_EMAIL || 'noreply@homemart.co.jp'
  },

  // 管理者設定
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@homemart.co.jp'
  },

  // サイト設定
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://homemart.co.jp',
    name: 'ホームマート',
    description: '不動産・リフォーム統合営業・業務管理システム'
  },

  // センチュリー21システム連携
  century21: {
    apiUrl: process.env.CENTURY21_API_URL || 'https://api.century21.co.jp',
    apiKey: process.env.CENTURY21_API_KEY || '',
    companyId: process.env.CENTURY21_COMPANY_ID || '',
    branchId: process.env.CENTURY21_BRANCH_ID || ''
  },

  // LINE公式アカウント連携
  line: {
    channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
    channelSecret: process.env.LINE_CHANNEL_SECRET || '',
    webhookUrl: process.env.LINE_WEBHOOK_URL || 'https://homemart.co.jp/api/integrations/line'
  },

  // PLAUD note AI連携
  plaud: {
    apiKey: process.env.PLAUD_API_KEY || '',
    apiUrl: process.env.PLAUD_API_URL || 'https://api.plaud.ai'
  },

  // OpenAI API
  openai: {
    apiKey: process.env.OPENAI_API_KEY || ''
  },

  // Vercel Cron
  cron: {
    secret: process.env.CRON_SECRET || ''
  },

  // その他の外部API
  external: {
    suumo: process.env.SUUMO_API_KEY || '',
    homes: process.env.HOMES_API_KEY || '',
    gamma: process.env.GAMMA_API_KEY || '',
    upsider: process.env.UPSIDER_API_KEY || ''
  },

  // セキュリティ設定
  security: {
    nextAuthSecret: process.env.NEXTAUTH_SECRET || '',
    nextAuthUrl: process.env.NEXTAUTH_URL || 'https://homemart.co.jp'
  }
}
