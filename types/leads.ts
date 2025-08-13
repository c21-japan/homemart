import { z } from 'zod'

export type LeadType = 'purchase' | 'sell' | 'reform'
export type LeadStatus = 'new' | 'in_progress' | 'won' | 'lost'

// 媒介契約種別
export type ContractType = '専属専任' | '専任' | '一般'

// 画像処理ステータス
export type PhotoProcessingStatus = 'queued' | 'enhanced' | 'staged' | 'error'

// 基本情報の型定義
export interface LeadBase {
  type: LeadType
  source?: string
  last_name: string
  first_name: string
  last_name_kana?: string
  first_name_kana?: string
  email?: string
  phone?: string
  postal_code?: string
  prefecture?: string
  city?: string
  address1?: string
  address2?: string
  residence_structure?: string
  household?: string
  note?: string
  attachments?: string[]
  location?: { lat: number; lng: number }
}

// 用途別の追加項目
export type LeadExtra =
  | {
      type: 'purchase'
      budget?: number
      desired_area?: string
      layout?: string
      move_in_timing?: string
      loan_preapproved?: boolean
    }
  | {
      type: 'sell'
      property_type?: string
      building_name?: string
      room_no?: string
      land_size?: number
      floor_area?: number
      year_built?: string
      remaining_loan?: number
      expected_price?: number
      psychological_defect?: boolean
      parking_state?: string
      hoa_fee?: number
      reason?: string
      current_status?: 'vacant' | 'occupied'
    }
  | {
      type: 'reform'
      target_rooms?: string[]
      wish_items?: string[]
      rough_budget?: number
      desired_deadline?: string
      visit_request?: boolean
    }

// 完全なリード情報
export interface CustomerLead extends LeadBase {
  id: string
  created_at: string
  updated_at: string
  created_by?: string
  assigned_to?: string
  status: LeadStatus
  extra: LeadExtra
}

// 媒介契約情報
export interface ListingAgreement {
  id: string
  lead_id: string
  property_id?: string
  contract_type: ContractType
  signed_at: string
  reins_required_by: string
  reins_registered_at?: string
  report_interval_days: number
  next_report_date: string
  last_report_sent_at?: string
  report_channel: string
  status: 'active' | 'suspended' | 'closed'
  created_at: string
  updated_at: string
}

// 送信ログ情報
export interface ListingReportLog {
  id: string
  agreement_id: string
  sent_at: string
  subject: string
  body: string
  to_email: string
  metrics: Record<string, any>
  success: boolean
  error?: string
}

// 画像情報
export interface LeadPhoto {
  id: string
  lead_id: string
  slot: number
  category: string
  original_path: string
  enhanced_path?: string
  staged_path?: string
  processing_status: PhotoProcessingStatus
  note?: string
  created_at: string
}

// 写真カテゴリ（固定30スロット）
export const PHOTO_CATEGORIES = {
  1: '外観',
  2: '間取り',
  3: 'リビング',
  4: '室内1',
  5: '室内2',
  6: '室内3',
  7: 'キッチン',
  8: '洗面所',
  9: '洗面台',
  10: 'トイレ',
  11: '浴室',
  12: '玄関',
  13: 'バルコニー/眺望',
  14: '共用部/駐車場',
  15: '収納',
  16: '廊下',
  17: '和室',
  18: '洋室',
  19: 'WIC',
  20: '設備',
  21: 'その他1',
  22: 'その他2',
  23: 'その他3',
  24: 'その他4',
  25: 'その他5',
  26: 'その他6',
  27: 'その他7',
  28: 'その他8',
  29: 'その他9',
  30: 'その他10'
} as const

export type PhotoCategory = typeof PHOTO_CATEGORIES[keyof typeof PHOTO_CATEGORIES]

// Zod スキーマ
export const leadBaseSchema = z.object({
  type: z.enum(['purchase', 'sell', 'reform']),
  source: z.string().optional(),
  last_name: z.string().min(1, '姓は必須です'),
  first_name: z.string().min(1, '名は必須です'),
  last_name_kana: z.string().optional(),
  first_name_kana: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  phone: z.string().optional(),
  postal_code: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  residence_structure: z.string().optional(),
  household: z.string().optional(),
  note: z.string().optional(),
  attachments: z.array(z.string()).default([]),
  location: z.object({
    lat: z.number(),
    lng: z.number()
  }).optional()
})

// 用途別の追加項目スキーマ
export const purchaseExtraSchema = z.object({
  type: z.literal('purchase'),
  budget: z.number().min(0, '予算は0以上で入力してください').optional(),
  desired_area: z.string().optional(),
  layout: z.string().optional(),
  move_in_timing: z.string().optional(),
  loan_preapproved: z.boolean().optional()
})

export const sellExtraSchema = z.object({
  type: z.literal('sell'),
  property_type: z.string().optional(),
  building_name: z.string().optional(),
  room_no: z.string().optional(),
  land_size: z.number().min(0).optional(),
  floor_area: z.number().min(0).optional(),
  year_built: z.string().optional(),
  remaining_loan: z.number().min(0).optional(),
  expected_price: z.number().min(0).optional(),
  psychological_defect: z.boolean().optional(),
  parking_state: z.string().optional(),
  hoa_fee: z.number().min(0).optional(),
  reason: z.string().optional(),
  current_status: z.enum(['vacant', 'occupied']).optional()
})

export const reformExtraSchema = z.object({
  type: z.literal('reform'),
  target_rooms: z.array(z.string()).optional(),
  wish_items: z.array(z.string()).optional(),
  rough_budget: z.number().min(0).optional(),
  desired_deadline: z.string().optional(),
  visit_request: z.boolean().optional()
})

// 用途別のスキーマを統合
export const leadExtraSchema = z.discriminatedUnion('type', [
  purchaseExtraSchema,
  sellExtraSchema,
  reformExtraSchema
])

// 媒介契約作成スキーマ
export const createAgreementSchema = z.object({
  lead_id: z.string(),
  contract_type: z.enum(['専属専任', '専任', '一般']),
  signed_at: z.string(),
  property_id: z.string().optional()
})

// 完全なリード作成スキーマ
export const createLeadSchema = leadBaseSchema.merge(
  z.object({
    extra: leadExtraSchema
  })
)

// リード更新スキーマ
export const updateLeadSchema = createLeadSchema.partial().merge(
  z.object({
    id: z.string(),
    status: z.enum(['new', 'in_progress', 'won', 'lost']).optional(),
    assigned_to: z.string().optional()
  })
)

// 検索・フィルター用
export interface LeadFilter {
  type?: LeadType
  status?: LeadStatus
  assigned_to?: string
  created_by?: string
  month?: string // YYYY-MM形式
  search?: string // 氏名・建物名・電話番号での検索
}

// 統計情報
export interface LeadStats {
  total: number
  byStatus: Record<LeadStatus, number>
  byType: Record<LeadType, number>
  byMonth: Record<string, number>
}

// 媒介契約統計
export interface AgreementStats {
  total: number
  byType: Record<ContractType, number>
  dueReports: number
  reinsOverdue: number
}

// 営業日計算用
export interface BusinessDayConfig {
  holidays: string[] // YYYY-MM-DD形式
  workDays: number[] // 0=日曜, 1=月曜, ..., 6=土曜
}

// チェックリスト関連の型定義
export type ChecklistType = 'seller' | 'buyer' | 'reform'

export interface ChecklistItem {
  id: string
  item_key: string
  label: string
  checked: boolean
  completed_at?: string
  note?: string
  file_path?: string
  required: boolean
  order_index: number
  created_at: string
  updated_at: string
}

export interface ChecklistAttachment {
  id: string
  checklist_id: string
  item_id: string
  file_path: string
  file_name: string
  file_size: number
  file_type: string
  uploaded_at: string
  uploaded_by?: string
}

export interface CustomerChecklist {
  id: string
  lead_id: string
  type: ChecklistType
  items: ChecklistItem[]
  progress_percentage: number
  total_items: number
  completed_items: number
  created_at: string
  updated_at: string
}

// チェックリスト項目の定義（3種類）
export const CHECKLIST_ITEMS = {
  seller: [
    { key: 'property_docs', label: '物件資料', required: true, order: 1 },
    { key: 'customer_survey', label: 'お客様アンケート', required: true, order: 2 },
    { key: 'registration_cert', label: '登記事項証明書（住所・権利者）', required: true, order: 3 },
    { key: 'cadastral_map', label: '公図（写）', required: true, order: 4 },
    { key: 'building_confirmation', label: '建築確認済証（年 月 日〜年 月 日）', required: true, order: 5 },
    { key: 'sales_contract', label: '売買契約書（写）', required: true, order: 6 },
    { key: 'registry', label: '登記簿謄本（写）', required: true, order: 7 },
    { key: 'measured_drawing', label: '実測図（写）', required: true, order: 8 },
    { key: 'property_tax', label: '固定資産税納付書（写）', required: true, order: 9 },
    { key: 'management_rules', label: '管理規約（写）', required: false, order: 10 },
    { key: 'sale_consent', label: '売渡承諾書（写）', required: true, order: 11 },
    { key: 'keys', label: '鍵', required: true, order: 12 },
    { key: 'other', label: 'その他（自由入力）', required: false, order: 13 }
  ],
  buyer: [
    { key: 'property_docs', label: '物件資料', required: true, order: 1 },
    { key: 'customer_survey', label: 'お客様アンケート', required: true, order: 2 },
    { key: 'purchase_application', label: '購入申込書（記入日：年 月 日）', required: true, order: 3 },
    { key: 'loan_preapproval', label: '住宅ローン事前審査 承諾書', required: true, order: 4 },
    { key: 'important_matters', label: '重要事項説明書（写）', required: true, order: 5 },
    { key: 'sales_contract', label: '売買契約書（写）', required: true, order: 6 },
    { key: 'earnest_money', label: '手付金領収書（写）', required: true, order: 7 },
    { key: 'id_verification', label: '本人確認書類（写）', required: true, order: 8 },
    { key: 'seal_certificate', label: '印鑑証明書（写）', required: true, order: 9 },
    { key: 'fire_insurance', label: '火災保険 申込書', required: true, order: 10 },
    { key: 'residence_record', label: '住民票（写）', required: true, order: 11 },
    { key: 'final_payment', label: '残代金領収書（写）', required: true, order: 12 },
    { key: 'keys', label: '鍵', required: true, order: 13 },
    { key: 'other', label: 'その他（自由入力）', required: false, order: 14 }
  ],
  reform: [
    { key: 'inquiry_response', label: '問い合わせ対応（日時・担当）', required: true, order: 1 },
    { key: 'site_estimate', label: '訪問見積（日時）', required: true, order: 2 },
    { key: 'estimate_presentation', label: '見積書の提示（提出日）', required: true, order: 3 },
    { key: 'preparation', label: '事前準備（申請書類・カタログ・承諾）', required: true, order: 4 },
    { key: 'contract_confirmation', label: '工事書面前確認（契約書・発注書）', required: true, order: 5 },
    { key: 'materials_confirmation', label: '工事中必要材料（確認済み）', required: true, order: 6 },
    { key: 'completion_check', label: '完了時の確認（仕上がりチェック・写真撮影）', required: true, order: 7 },
    { key: 'handover', label: '引渡し（請求書・保証書・説明）', required: true, order: 8 },
    { key: 'aftercare', label: 'アフターケア（Googleレビュー依頼）', required: false, order: 9 },
    { key: 'work_content', label: '工事内容（自由入力）', required: false, order: 10 }
  ]
} as const

// チェックリスト作成スキーマ
export const createChecklistSchema = z.object({
  lead_id: z.string(),
  type: z.enum(['seller', 'buyer', 'reform']),
  items: z.array(z.object({
    item_key: z.string(),
    label: z.string(),
    checked: z.boolean().default(false),
    required: z.boolean().default(true),
    order_index: z.number()
  }))
})

// チェックリスト項目更新スキーマ
export const updateChecklistItemSchema = z.object({
  item_id: z.string(),
  checked: z.boolean(),
  note: z.string().optional(),
  file_path: z.string().optional()
})
