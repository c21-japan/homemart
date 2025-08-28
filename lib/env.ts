import { z } from 'zod'

// 環境変数を直接チェック（parseする前に）
const isClerkDisabled = process.env.DISABLE_CLERK === '1'

const envSchema = z.object({
  // Clerkが無効な場合は空文字列でもOK
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z.string().default(''),
  CLERK_SECRET_KEY: z.string().default(''),
  DISABLE_CLERK: z.string().default('0'),
  DATABASE_URL: z.string().optional(),
  NEXT_PUBLIC_APP_URL: z.string().optional(),
})

// 環境変数をパース（undefinedの場合は空文字列に）
export const env = envSchema.parse({
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || '',
  CLERK_SECRET_KEY: process.env.CLERK_SECRET_KEY || '',
  DISABLE_CLERK: process.env.DISABLE_CLERK || '0',
  DATABASE_URL: process.env.DATABASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
})

// Clerkが無効かどうかを判定する関数
export const isClerkEnabled = () => {
  return env.DISABLE_CLERK !== '1' && 
         env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY !== '' && 
         env.CLERK_SECRET_KEY !== ''
}
