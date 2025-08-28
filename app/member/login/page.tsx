'use client'

export const dynamic = 'force-dynamic'

import { SignIn } from '@clerk/nextjs'
import Link from 'next/link'

export default function MemberLogin() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">ホームマート</h1>
          <h2 className="mt-6 text-2xl font-bold text-gray-900">社員ログイン</h2>
          <p className="mt-2 text-sm text-gray-600">
            社員アカウントでログインできます
          </p>
        </div>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-orange-600 hover:bg-orange-700 text-white',
                footerActionLink: 'text-orange-600 hover:text-orange-500'
              }
            }}
            routing="path"
            path="/member/login"
            signUpUrl="/member/register"
            afterSignInUrl="/admin"
            redirectUrl="/admin"
          />
          
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">または</span>
              </div>
            </div>

            <div className="mt-6">
              <Link
                href="/"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
              >
                ゲストとして物件を探す
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
