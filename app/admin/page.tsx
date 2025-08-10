'use client'
import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { ImageUpload } from '@/components/ImageUpload'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const formRef = useRef<HTMLFormElement>(null)
  const router = useRouter()

  // パスワードチェック
  const checkPassword = () => {
    const correctPassword = 'homemart2024'
    
    if (password === correctPassword) {
      setIsAuthenticated(true)
      localStorage.setItem('adminAuth', 'true')
      localStorage.setItem('authExpiry', String(Date.now() + 30 * 24 * 60 * 60 * 1000))
    } else {
      alert('パスワードが違います')
    }
  }

  // ページ読み込み時に認証チェック
  useEffect(() => {
    const auth = localStorage.getItem('adminAuth')
    const expiry = localStorage.getItem('authExpiry')
    
    if (auth === 'true' && expiry && Date.now() < Number(expiry)) {
      setIsAuthenticated(true)
    }
  }, [])

  // ログアウト機能
  const logout = () => {
    localStorage.removeItem('adminAuth')
    localStorage.removeItem('authExpiry')
    setIsAuthenticated(false)
    router.push('/')
  }

  // 物件登録の処理
  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsSubmitting(true)
    
    const formData = new FormData(e.currentTarget)
    
    try {
      const { data, error } = await supabase.from('properties').insert({
        name: formData.get('name') as string,
        price: Number(formData.get('price')),
        address: formData.get('address') as string,
        description: formData.get('description') as string,
        image_url: imageUrl || null,
        featured: formData.get('featured') === 'on'
      }).select()
      
      if (error) throw error
      
      setMessage('✅ 物件を登録しました！')
      
      // フォームをリセット
      if (formRef.current) {
        formRef.current.reset()
      }
      setImageUrl('')
      
      // 3秒後にメッセージを消す
      setTimeout(() => setMessage(''), 3000)
    } catch (error) {
      console.error('Error:', error)
      setMessage('❌ 登録に失敗しました')
      setTimeout(() => setMessage(''), 3000)
    } finally {
      setIsSubmitting(false)
    }
  }

  // パスワード入力画面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white p-8 rounded-lg shadow-md w-96">
          <h1 className="text-2xl font-bold mb-6 text-center">管理画面ログイン</h1>
          
          <div className="space-y-4">
            <input
              type="password"
              placeholder="パスワードを入力"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && checkPassword()}
              className="w-full p-3 border rounded-lg"
            />
            
            <button
              onClick={checkPassword}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
            >
              ログイン
            </button>
            
            <p className="text-sm text-gray-500 text-center">
              パスワードが分からない場合は管理者にお問い合わせください
            </p>
          </div>
        </div>
      </div>
    )
  }

  // 管理画面（ログイン後）
  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <div className="bg-white shadow-sm mb-8">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">物件管理画面</h1>
          <div className="flex gap-4">
            <a href="/" className="text-blue-600 hover:underline">
              サイトを見る
            </a>
            <button
              onClick={logout}
              className="text-red-600 hover:underline"
            >
              ログアウト
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-4">
        {/* メッセージ表示 */}
        {message && (
          <div className={`px-4 py-3 rounded mb-6 ${
            message.includes('✅') 
              ? 'bg-green-100 border border-green-400 text-green-700' 
              : 'bg-red-100 border border-red-400 text-red-700'
          }`}>
            {message}
          </div>
        )}
        
        {/* 物件登録フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">新規物件登録</h2>
          
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">
            {/* 画像アップロード */}
            <div>
              <label className="block text-sm font-medium mb-2">
                物件画像
              </label>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
              />
              <p className="text-xs text-gray-500 mt-2">
                ドラッグ&ドロップまたはクリックで画像を選択
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                物件名 <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="例：奈良市学園前の新築戸建て"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                価格（円） <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                required
                placeholder="例：35000000"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                住所 <span className="text-red-500">*</span>
              </label>
              <input
                name="address"
                required
                placeholder="例：奈良県奈良市学園北1丁目"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                物件説明
              </label>
              <textarea
                name="description"
                placeholder="物件の特徴、アピールポイントなど"
                className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                className="mr-2 w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
              />
              <label htmlFor="featured" className="text-sm">
                おすすめ物件として表示する（トップページ上部に表示されます）
              </label>
            </div>
            
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? '登録中...' : '物件を登録'}
            </button>
          </form>
        </div>

        {/* 使い方説明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold mb-2">📝 使い方</h3>
          <ul className="space-y-1 text-sm">
            <li>• 画像をドラッグ&ドロップまたはクリックで選択</li>
            <li>• 物件情報を入力して「物件を登録」をクリック</li>
            <li>• 登録した物件はすぐにトップページに表示されます</li>
            <li>• おすすめ物件にチェックを入れると上位に表示されます</li>
            <li>• パスワードは30日間保存されます</li>
          </ul>
        </div>

        {/* 登録済み物件の確認リンク */}
        <div className="mt-4 text-center">
          <a 
            href="/" 
            target="_blank" 
            className="text-blue-600 hover:underline inline-flex items-center gap-2"
          >
            <span>登録した物件を確認する</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  )
}
