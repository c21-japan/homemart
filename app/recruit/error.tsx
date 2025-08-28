'use client';

import React from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">エラーが発生しました</h2>
        <p className="text-gray-600 mb-6">
          申し訳ございません。ページの読み込み中にエラーが発生しました。
        </p>
        <button
          onClick={reset}
          className="bg-primary text-white px-6 py-3 rounded-lg font-bold hover:bg-green-600 transition-colors"
        >
          再試行
        </button>
        <div className="mt-4">
          <Link href="/" className="text-primary hover:underline">
            ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  );
}

