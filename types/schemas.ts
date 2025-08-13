import { z } from 'zod';

// 基本情報のスキーマ
export const leadBaseSchema = z.object({
  type: z.enum(['purchase', 'sell', 'reform']),
  source: z.string().optional(),
  last_name: z.string().min(1, '姓は必須です'),
  first_name: z.string().min(1, '名は必須です'),
  last_name_kana: z.string().optional(),
  first_name_kana: z.string().optional(),
  email: z.string().email('有効なメールアドレスを入力してください').optional().or(z.literal('')),
  phone: z.string().min(1, '電話番号は必須です'),
  postal_code: z.string().optional(),
  prefecture: z.string().optional(),
  city: z.string().optional(),
  address1: z.string().optional(),
  address2: z.string().optional(),
  residence_structure: z.string().optional(),
  household: z.string().optional(),
  note: z.string().optional(),
  attachments: z.array(z.instanceof(File)).optional(),
});

// 購入用の追加項目スキーマ
export const purchaseExtraSchema = z.object({
  budget: z.number().min(0, '予算は0以上で入力してください').optional(),
  desired_area: z.string().optional(),
  layout: z.string().optional(),
  move_in_timing: z.string().optional(),
  loan_preapproved: z.boolean().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }).optional(),
});

// 売却用の追加項目スキーマ
export const sellExtraSchema = z.object({
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
  current_status: z.enum(['vacant', 'occupied']).optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }).optional(),
});

// リフォーム用の追加項目スキーマ
export const reformExtraSchema = z.object({
  target_rooms: z.array(z.string()).optional(),
  wish_items: z.array(z.string()).optional(),
  rough_budget: z.number().min(0).optional(),
  desired_deadline: z.string().optional(),
  visit_request: z.boolean().optional(),
  location: z.object({
    latitude: z.number(),
    longitude: z.number(),
    address: z.string(),
  }).optional(),
});

// 用途別の完全なスキーマ
export const purchaseLeadSchema = leadBaseSchema.extend({
  type: z.literal('purchase'),
  extra: purchaseExtraSchema,
});

export const sellLeadSchema = leadBaseSchema.extend({
  type: z.literal('sell'),
  extra: sellExtraSchema,
});

export const reformLeadSchema = leadBaseSchema.extend({
  type: z.literal('reform'),
  extra: reformExtraSchema,
});

// 統合スキーマ（用途に応じて動的に検証）
export const leadFormSchema = z.discriminatedUnion('type', [
  purchaseLeadSchema,
  sellLeadSchema,
  reformLeadSchema,
]);

// 検索・フィルター用スキーマ
export const leadFilterSchema = z.object({
  type: z.enum(['purchase', 'sell', 'reform']).optional(),
  status: z.enum(['new', 'in_progress', 'won', 'lost']).optional(),
  assigned_to: z.string().optional(),
  search: z.string().optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
});

// 位置情報取得用スキーマ
export const locationSchema = z.object({
  latitude: z.number(),
  longitude: z.number(),
  address: z.string(),
});
