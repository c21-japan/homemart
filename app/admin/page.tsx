'use client'
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'

export default function Admin() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const router = useRouter()

  // パスワードチェック
  const checkPassword = () => {
    // ここにあなたのパスワードを設定
    const correctPassword = 'homemart2024'
    
    if (password === correctPassword) {
      setIsAuthenticated(true)
      // パスワードをブラウザに保存（30日間有効）
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
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('properties').insert({
      name: formData.get('name'),
      price: Number(formData.get('price')),
      address: formData.get('address'),
      description: formData.get('description'),
      image_url: formData.get('image_url'),
      featured: formData.get('featured') === 'on'
    })
    
    setMessage('✅ 物件を登録しました！')
    e.currentTarget.reset()
    
    // 3秒後にメッセージを消す
    setTimeout(() => setMessage(''), 3000)
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
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
            {message}
          </div>
        )}
        
        {/* 物件登録フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold mb-6">新規物件登録</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                物件名 <span className="text-red-500">*</span>
              </label>
              <input
                name="name"
                required
                placeholder="例：奈良市学園前の新築戸建て"
                className="w-full p-3 border rounded-lg"
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
                className="w-full p-3 border rounded-lg"
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
                className="w-full p-3 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                物件説明
              </label>
              <textarea
                name="description"
                placeholder="物件の特徴、アピールポイントなど"
                className="w-full p-3 border rounded-lg"
                rows={4}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">
                画像URL（一時的）
              </label>
              <input
                name="image_url"
                type="url"
                placeholder="https://... （後で画像アップロード機能を追加します）"
                className="w-full p-3 border rounded-lg"
              />
              <p className="text-xs text-gray-500 mt-1">
                ※次のステップで画像を直接アップロードできるようにします
              </p>
            </div>
            
            <div className="flex items-center">
              <input
                type="checkbox"
                name="featured"
                id="featured"
                className="mr-2"
              />
              <label htmlFor="featured">
                おすすめ物件として表示する
              </label>
            </div>
            
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold"
            >
              物件を登録
            </button>
          </form>
        </div>

        {/* 使い方説明 */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-bold mb-2">📝 使い方</h3>
          <ul className="space-y-1 text-sm">
            <li>• 物件情報を入力して「物件を登録」をクリック</li>
            <li>• 登録した物件はすぐにトップページに表示されます</li>
            <li>• おすすめ物件にチェックを入れると上位に表示されます</li>
            <li>• パスワードは30日間保存されます</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
