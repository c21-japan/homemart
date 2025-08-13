import { useQuery, useQueries, UseQueryOptions, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'

// 物件データの型定義
interface Property {
  id: string
  name: string
  price: number
  property_type: string
  status: string
  created_at: string
  staff_comment?: string
  featured?: boolean
}

// お問い合わせデータの型定義
interface Inquiry {
  id: string
  name: string
  email: string
  property_name?: string
  status: string
  created_at: string
}

// リフォーム施工実績の型定義
interface ReformProject {
  id: string
  title: string
  before_image_url: string
  after_image_url: string
  description?: string
  created_at: string
}

// 統計データの型定義
interface DashboardStats {
  totalProperties: number
  publishedProperties: number
  newInquiries: number
  featuredProperties: number
  totalReformProjects: number
  totalLeads: number
  newLeads: number
}

// 物件データを取得するフック
export function useProperties(limit: number = 5) {
  return useQuery({
    queryKey: ['properties', limit],
    queryFn: async (): Promise<Property[]> => {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    },
    staleTime: 2 * 60 * 1000, // 2分間は新鮮
    gcTime: 5 * 60 * 1000,    // 5分間キャッシュ
  })
}

// お問い合わせデータを取得するフック
export function useInquiries(limit: number = 5) {
  return useQuery({
    queryKey: ['inquiries', limit],
    queryFn: async (): Promise<Inquiry[]> => {
      const { data, error } = await supabase
        .from('inquiries')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    },
    staleTime: 2 * 60 * 1000,
    gcTime: 5 * 60 * 1000,
  })
}

// リフォーム施工実績を取得するフック
export function useReformProjects(limit: number = 5) {
  return useQuery({
    queryKey: ['reform-projects', limit],
    queryFn: async (): Promise<ReformProject[]> => {
      const { data, error } = await supabase
        .from('reform_projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit)

      if (error) throw error
      return data || []
    },
    staleTime: 5 * 60 * 1000, // リフォーム実績は5分間新鮮
    gcTime: 10 * 60 * 1000,
  })
}

// 統計データを並列で取得するフック
export function useDashboardStats() {
  return useQueries({
    queries: [
      // 総物件数
      {
        queryKey: ['stats', 'total-properties'],
        queryFn: async (): Promise<number> => {
          const { count, error } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
          
          if (error) throw error
          return count || 0
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
      // 公開中物件数
      {
        queryKey: ['stats', 'published-properties'],
        queryFn: async (): Promise<number> => {
          const { count, error } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'published')
          
          if (error) throw error
          return count || 0
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
      // 新着お問い合わせ数
      {
        queryKey: ['stats', 'new-inquiries'],
        queryFn: async (): Promise<number> => {
          const { count, error } = await supabase
            .from('inquiries')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'new')
          
          if (error) throw error
          return count || 0
        },
        staleTime: 1 * 60 * 1000, // お問い合わせは1分間新鮮
        gcTime: 5 * 60 * 1000,
      },
      // おすすめ物件数
      {
        queryKey: ['stats', 'featured-properties'],
        queryFn: async (): Promise<number> => {
          const { count, error } = await supabase
            .from('properties')
            .select('*', { count: 'exact', head: true })
            .eq('featured', true)
          
          if (error) throw error
          return count || 0
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
      // リフォーム施工実績数
      {
        queryKey: ['stats', 'total-reform-projects'],
        queryFn: async (): Promise<number> => {
          const { count, error } = await supabase
            .from('reform_projects')
            .select('*', { count: 'exact', head: true })
          
          if (error) throw error
          return count || 0
        },
        staleTime: 5 * 60 * 1000,
        gcTime: 10 * 60 * 1000,
      },
    ],
    combine: (results) => {
      const [totalProperties, publishedProperties, newInquiries, featuredProperties, totalReformProjects] = results
      
      return {
        data: {
          totalProperties: totalProperties.data || 0,
          publishedProperties: publishedProperties.data || 0,
          newInquiries: newInquiries.data || 0,
          featuredProperties: featuredProperties.data || 0,
          totalReformProjects: totalReformProjects.data || 0,
          totalLeads: 0, // 後で実装
          newLeads: 0,   // 後で実装
        },
        isLoading: results.some(result => result.isLoading),
        isError: results.some(result => result.isError),
        error: results.find(result => result.error)?.error,
      }
    },
  })
}

// データのプリフェッチ用フック
export function usePrefetchData() {
  const queryClient = useQueryClient()
  
  const prefetchAll = () => {
    // 主要なデータをプリフェッチ
    queryClient.prefetchQuery({
      queryKey: ['properties', 5],
      queryFn: () => supabase.from('properties').select('*').order('created_at', { ascending: false }).limit(5)
    })
    
    queryClient.prefetchQuery({
      queryKey: ['inquiries', 5],
      queryFn: () => supabase.from('inquiries').select('*').order('created_at', { ascending: false }).limit(5)
    })
    
    queryClient.prefetchQuery({
      queryKey: ['reform-projects', 5],
      queryFn: () => supabase.from('reform_projects').select('*').order('created_at', { ascending: false }).limit(5)
    })
  }
  
  return { prefetchAll }
}

// 汎用的なSupabaseクエリフック
export function useSupabaseQuery<T>(
  queryKey: string[],
  queryFn: () => Promise<T>,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery({
    queryKey,
    queryFn,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  })
}
