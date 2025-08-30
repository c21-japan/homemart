'use client'
import React from 'react'
import { ClerkProvider } from '@clerk/nextjs'

// NEXT_PUBLIC_DISABLE_CLERK=1 のときはダミーProviderとして素通し
export default function Providers({ children }: { children: React.ReactNode }) {
  const disabled = process.env.NEXT_PUBLIC_DISABLE_CLERK === '1'
  if (disabled) return <>{children}</>
  return <ClerkProvider>{children}</ClerkProvider>
}
