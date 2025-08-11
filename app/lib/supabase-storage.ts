import { supabase } from '@/lib/supabase'

/**
 * Supabase Storageのバケット作成と管理
 */

// バケット名の定義
const BUCKET_NAME = 'property-images'

/**
 * メディアバケットを作成（初回のみ）
 */
export async function createMediaBucket() {
  try {
    const { data: buckets, error: listError } = await supabase
      .storage
      .listBuckets()

    if (listError) {
      console.error('バケット一覧取得エラー:', listError)
      return { error: listError }
    }

    // 既存のバケットをチェック
    const bucketExists = buckets?.some(bucket => bucket.name === BUCKET_NAME)

    if (!bucketExists) {
      const { data, error } = await supabase
        .storage
        .createBucket(BUCKET_NAME, {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 5242880 // 5MB
        })

      if (error) {
        console.error('バケット作成エラー:', error)
        return { error }
      }

      console.log('バケット作成成功:', data)
      return { data }
    }

    console.log('バケットは既に存在します')
    return { data: { message: 'Bucket already exists' } }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return { error }
  }
}

/**
 * 画像をアップロード
 */
export async function uploadImage(file: File, path?: string) {
  try {
    // ファイル名を生成
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`
    const filePath = path ? `${path}/${fileName}` : fileName

    // アップロード
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('アップロードエラー:', error)
      return { error }
    }

    // 公開URLを取得
    const { data: { publicUrl } } = supabase
      .storage
      .from(BUCKET_NAME)
      .getPublicUrl(filePath)

    return { 
      data: {
        path: filePath,
        url: publicUrl
      }
    }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return { error }
  }
}

/**
 * 画像を削除
 */
export async function deleteImage(path: string) {
  try {
    const { error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .remove([path])

    if (error) {
      console.error('削除エラー:', error)
      return { error }
    }

    return { data: { message: 'Image deleted successfully' } }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return { error }
  }
}

/**
 * 複数の画像を一括アップロード
 */
export async function uploadMultipleImages(files: File[], path?: string) {
  try {
    const uploadPromises = files.map(file => uploadImage(file, path))
    const results = await Promise.all(uploadPromises)
    
    const successful = results.filter(r => !r.error)
    const failed = results.filter(r => r.error)
    
    return {
      successful,
      failed,
      totalUploaded: successful.length,
      totalFailed: failed.length
    }
  } catch (error) {
    console.error('一括アップロードエラー:', error)
    return { error }
  }
}

/**
 * 画像URLを取得
 */
export function getImageUrl(path: string): string {
  const { data: { publicUrl } } = supabase
    .storage
    .from(BUCKET_NAME)
    .getPublicUrl(path)
  
  return publicUrl
}

/**
 * フォルダ内の画像一覧を取得
 */
export async function listImages(folder: string = '') {
  try {
    const { data, error } = await supabase
      .storage
      .from(BUCKET_NAME)
      .list(folder, {
        limit: 100,
        offset: 0,
        sortBy: { column: 'created_at', order: 'desc' }
      })

    if (error) {
      console.error('一覧取得エラー:', error)
      return { error }
    }

    // 各ファイルの公開URLを追加
    const filesWithUrls = data?.map(file => ({
      ...file,
      url: getImageUrl(`${folder}/${file.name}`)
    }))

    return { data: filesWithUrls }
  } catch (error) {
    console.error('予期しないエラー:', error)
    return { error }
  }
}
