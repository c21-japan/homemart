'use client'

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8">
        ホームマート管理画面
      </h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">
          ログイン成功！
        </h2>
        <p>これで管理画面にアクセスできました。</p>
        
        <button 
          onClick={() => {
            localStorage.clear()
            window.location.href = '/login'
          }}
          className="mt-4 bg-red-500 text-white px-4 py-2 rounded"
        >
          ログアウト
        </button>
      </div>
    </div>
  )
}
