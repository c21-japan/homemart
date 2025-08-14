export const productionConfig = {
  // メール設定
  mailjet: {
    apiKey: process.env.MAILJET_API_KEY || '',
    apiSecret: process.env.MAILJET_SECRET_KEY || '',
    fromEmail: process.env.MAILJET_FROM_EMAIL || 'noreply@example.com'
  },

  // 管理者設定
  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@example.com'
  },

  // サイト設定
  site: {
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
    name: 'ホームマート統合システム',
    description: '不動産・リフォーム統合営業・業務管理システム'
  },

  // 外部API設定
  externalApis: {
    century21: {
      apiUrl: process.env.CENTURY21_API_URL || 'https://api.century21.co.jp',
      apiKey: process.env.CENTURY21_API_KEY || '',
      companyId: process.env.CENTURY21_COMPANY_ID || '',
      branchId: process.env.CENTURY21_BRANCH_ID || ''
    },

    line: {
      channelAccessToken: process.env.LINE_CHANNEL_ACCESS_TOKEN || '',
      channelSecret: process.env.LINE_CHANNEL_SECRET || '',
      webhookUrl: process.env.LINE_WEBHOOK_URL || 'http://localhost:3000/api/integrations/line'
    },

    plaud: {
      apiKey: process.env.PLAUD_API_KEY || '',
      apiUrl: process.env.PLAUD_API_URL || 'https://api.plaud.ai'
    },

    openai: {
      apiKey: process.env.OPENAI_API_KEY || ''
    }
  },

  // 認証設定
  auth: {
    nextAuthUrl: process.env.NEXTAUTH_URL || 'http://localhost:3000',
    jwtSecret: process.env.JWT_SECRET || 'your-jwt-secret-key'
  },

  // データベース設定
  database: {
    url: process.env.DATABASE_URL || '',
    supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '',
    supabaseServiceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  },

  // セキュリティ設定
  security: {
    cronSecret: process.env.CRON_SECRET || 'your-cron-secret-key',
    allowedOrigins: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000']
  }
}
