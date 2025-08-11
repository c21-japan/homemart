import { supabase } from '@/lib/supabase'

// エリアごとの物件数を取得する関数
export async function getPropertyCountsByArea() {
  try {
    // 公開中の物件を全て取得
    const { data: properties, error } = await supabase
      .from('properties')
      .select('prefecture, city')
      .eq('status', 'published')

    if (error) throw error

    // エリアごとに集計
    const counts: { [key: string]: number } = {}
    
    if (properties) {
      properties.forEach((property) => {
        const key = `${property.prefecture}_${property.city}`
        counts[key] = (counts[key] || 0) + 1
      })
    }

    return counts
  } catch (error) {
    console.error('Error fetching property counts:', error)
    return {}
  }
}

// 特定エリアの物件を取得する関数
export async function getPropertiesByArea(prefecture: string, city: string) {
  try {
    const { data, error } = await supabase
      .from('properties')
      .select('*')
      .eq('status', 'published')
      .eq('prefecture', prefecture)
      .eq('city', city)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data || []
  } catch (error) {
    console.error('Error fetching properties by area:', error)
    return []
  }
}
