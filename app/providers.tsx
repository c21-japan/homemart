'use client'
import React from 'react'

// Clerkを完全に無効化
export default function Providers({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
