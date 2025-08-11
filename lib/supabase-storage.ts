import { supabase } from './supabase'

// Storage バケットの作成（初回のみ実行）
export async function createMediaBucket() {
  const { data, error } = await supabase.storage.createBucket('media', {
    public: true,
    allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    fileSizeLimit: 10485760 // 10MB
  })
  
  if (error && error.message !== 'The resource already exists') {
    console.error('Error creating bucket:', error)
    return false
  }
  
  return true
}

// 画像URLを取得
export function getMediaUrl(path: string): string {
  const { data } = supabase.storage.from('media').getPublicUrl(path)
  return data.publicUrl
}

// カテゴリー別に画像を取得
export async function getMediaByCategory(category: string) {
  try {
    const { data, error } = await supabase.storage
      .from('media')
      .list(category, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })
    
    if (error) {
      console.error('Error fetching media:', error)
      return []
    }
    
    // ファイルが存在しない場合は空配列を返す
    if (!data || data.length === 0) {
      return []
    }
    
    return data.map(file => ({
      name: file.name,
      url: getMediaUrl(`${category}/${file.name}`),
      createdAt: file.created_at
    }))
  } catch (error) {
    console.error('Error in getMediaByCategory:', error)
    return []
  }
}

// 特定の画像を取得
export async function getMediaByName(category: string, fileName: string) {
  try {
    const url = getMediaUrl(`${category}/${fileName}`)
    return url
  } catch (error) {
    console.error('Error getting media by name:', error)
    return null
  }
}

// 画像を削除
export async function deleteMedia(category: string, fileName: string) {
  try {
    const { error } = await supabase.storage
      .from('media')
      .remove([`${category}/${fileName}`])
    
    if (error) {
      console.error('Error deleting media:', error)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Error in deleteMedia:', error)
    return false
  }
}

// 画像をアップロード
export async function uploadMedia(category: string, file: File) {
  try {
    const timestamp = Date.now()
    const fileName = `${timestamp}_${file.name}`
    const filePath = `${category}/${fileName}`
    
    const { data, error } = await supabase.storage
      .from('media')
      .upload(filePath, file)
    
    if (error) {
      console.error('Error uploading media:', error)
      return null
    }
    
    return getMediaUrl(filePath)
  } catch (error) {
    console.error('Error in uploadMedia:', error)
    return null
  }
}
