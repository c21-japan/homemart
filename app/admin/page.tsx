'use client'
import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function Admin() {
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    
    await supabase.from('properties').insert({
      name: formData.get('name'),
      price: Number(formData.get('price')),
      address: formData.get('address'),
      description: formData.get('description'),
      image_url: formData.get('image_url')
    })
    
    setMessage('✅ 登録完了！')
    e.currentTarget.reset()
  }

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">物件登録</h1>
      
      {message && (
        <div className="bg-green-100 p-4 mb-4 rounded">
          {message}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          name="name"
          placeholder="物件名"
          required
          className="w-full p-2 border rounded"
        />
        
        <input
          name="price"
          type="number"
          placeholder="価格（円）"
          required
          className="w-full p-2 border rounded"
        />
        
        <input
          name="address"
          placeholder="住所"
          required
          className="w-full p-2 border rounded"
        />
        
        <textarea
          name="description"
          placeholder="説明"
          className="w-full p-2 border rounded"
          rows={4}
        />
        
        <input
          name="image_url"
          placeholder="画像URL（省略可）"
          className="w-full p-2 border rounded"
        />
        
        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 rounded"
        >
          登録する
        </button>
      </form>
    </div>
  )
}