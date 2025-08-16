import { z } from "zod";

// 基本顧客スキーマ
export const baseCustomer = z.object({
  name: z.string().min(1, "氏名は必須です"),
  name_kana: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("有効なメールアドレスを入力してください").optional(),
  address: z.string().optional(),
  source: z.enum(["flyer", "lp", "suumo", "homes", "referral", "other"]).optional(),
  assignee_user_id: z.string().uuid().optional(),
  property_type: z.enum(["mansion", "land", "house"])
});

// 物件基本情報
export const baseProperty = z.object({
  address: z.string().optional(),
  mansion_name: z.string().optional(),
  room_no: z.string().optional(),
  land_info: z.string().optional(),
  building_area: z.number().nonnegative().optional(),
  floor_plan: z.string().optional(),
  built_year: z.number().int().positive().optional(),
  area: z.number().nonnegative().optional(),
});

// 売却顧客スキーマ
const seller = baseCustomer.extend({
  category: z.literal("seller"),
  // 物件種別別の追加項目
  mansion_specific: z.object({
    mansion_name: z.string().min(1, "マンション名は必須です"),
    room_no: z.string().min(1, "部屋番号は必須です"),
  }).optional(),
  land_specific: z.object({
    land_info: z.string().min(1, "地番・地目は必須です"),
    boundary_status: z.string().optional(),
  }).optional(),
  house_specific: z.object({
    building_area: z.number().nonnegative().optional(),
    floor_plan: z.string().optional(),
    reform_history: z.string().optional(),
  }).optional(),
  // 売却固有項目
  desired_price: z.number().nonnegative("希望価格は0以上で入力してください").optional(),
  brokerage: z.enum(["exclusive_right", "exclusive", "general"]),
  brokerage_start: z.coerce.date(),
  report_channel: z.enum(["email", "postal"]),
  purchase_or_brokerage: z.enum(["買取", "仲介"]),
}).superRefine((val, ctx) => {
  // 物件種別に応じた必須項目チェック
  if (val.property_type === "mansion" && !val.mansion_specific) {
    ctx.addIssue({ 
      code: "custom", 
      path: ["mansion_specific"], 
      message: "マンションの場合はマンション名と部屋番号は必須です" 
    });
  }
  if (val.property_type === "land" && !val.land_specific) {
    ctx.addIssue({ 
      code: "custom", 
      path: ["land_specific"], 
      message: "土地の場合は地番・地目は必須です" 
    });
  }
  // メール選択時は email 必須
  if (val.report_channel === "email" && !val.email) {
    ctx.addIssue({ 
      code: "custom", 
      path: ["email"], 
      message: "メール送信を選択した場合はメールアドレスは必須です" 
    });
  }
});

// 購入顧客スキーマ
const buyer = baseCustomer.extend({
  category: z.literal("buyer"),
  preferred_area: z.string().min(1, "希望エリアは必須です"),
  budget_min: z.number().nonnegative().optional(),
  budget_max: z.number().nonnegative().optional(),
  conditions: z.object({
    station_distance: z.string().optional(),
    built_year_min: z.number().int().positive().optional(),
    built_year_max: z.number().int().positive().optional(),
    floor_plan: z.string().optional(),
    parking: z.boolean().optional(),
  }).optional(),
  finance_plan: z.object({
    loan_type: z.string().optional(),
    down_payment: z.number().nonnegative().optional(),
    loan_amount: z.number().nonnegative().optional(),
  }).optional(),
  interested_property_id: z.string().uuid().optional(),
}).superRefine((val, ctx) => {
  // 予算の整合性チェック
  if (val.budget_min && val.budget_max && val.budget_min > val.budget_max) {
    ctx.addIssue({ 
      code: "custom", 
      path: ["budget_max"], 
      message: "最大予算は最小予算より大きい値を入力してください" 
    });
  }
});

// リフォーム顧客スキーマ
const reform = baseCustomer.extend({
  category: z.literal("reform"),
  is_existing_customer: z.boolean().default(false),
  existing_customer_id: z.string().uuid().optional(),
  requested_works: z.array(z.string()).min(1, "依頼内容は1つ以上選択してください"),
  expected_revenue: z.number().nonnegative().optional(),
  start_date: z.coerce.date().optional(),
  end_date: z.coerce.date().optional(),
  survey_date: z.coerce.date().optional(),
  // 原価情報
  costs: z.object({
    material_cost: z.number().nonnegative().default(0),
    outsourcing_cost: z.number().nonnegative().default(0),
    travel_cost: z.number().nonnegative().default(0),
    other_cost: z.number().nonnegative().default(0),
    note: z.string().optional(),
  }).optional(),
}).superRefine((val, ctx) => {
  // 既存顧客選択時は顧客ID必須
  if (val.is_existing_customer && !val.existing_customer_id) {
    ctx.addIssue({ 
      code: "custom", 
      path: ["existing_customer_id"], 
      message: "既存顧客を選択した場合は顧客を指定してください" 
    });
  }
  // 工期の整合性チェック
  if (val.start_date && val.end_date && val.start_date >= val.end_date) {
    ctx.addIssue({ 
      code: "custom", 
      path: ["end_date"], 
      message: "完了予定日は開始日より後の日付を入力してください" 
    });
  }
});

// 顧客作成用のUnion型
export const customerUnion = z.discriminatedUnion("category", [seller, buyer, reform]);
export type CustomerInput = z.infer<typeof customerUnion>;

// 顧客更新用スキーマ（部分更新対応）
export const customerUpdateSchema = customerUnion.partial();

// チェックリストスキーマ
export const checklistSchema = z.object({
  customer_id: z.string().uuid(),
  type: z.enum(["seller", "buyer", "reform"]),
  title: z.string().min(1, "タイトルは必須です"),
  due_date: z.coerce.date().optional(),
  items: z.array(z.object({
    label: z.string().min(1, "項目名は必須です"),
    is_checked: z.boolean().default(false),
  })).optional(),
});

// リフォーム原価更新スキーマ
export const reformCostUpdateSchema = z.object({
  project_id: z.string().uuid(),
  material_cost: z.number().nonnegative(),
  outsourcing_cost: z.number().nonnegative(),
  travel_cost: z.number().nonnegative(),
  other_cost: z.number().nonnegative(),
  note: z.string().optional(),
});

// 媒介報告スキーマ
export const brokerageReportSchema = z.object({
  customer_id: z.string().uuid(),
  report_date: z.coerce.date(),
  viewing_count: z.number().int().nonnegative(),
  response_count: z.number().int().nonnegative(),
  proposal: z.string().min(1, "提案内容は必須です"),
  next_action: z.string().min(1, "次回方針は必須です"),
  notes: z.string().optional(),
});

// 検索・フィルター用スキーマ
export const customerSearchSchema = z.object({
  query: z.string().optional(),
  category: z.enum(["seller", "buyer", "reform"]).optional(),
  property_type: z.enum(["mansion", "land", "house"]).optional(),
  assignee_user_id: z.string().uuid().optional(),
  source: z.enum(["flyer", "lp", "suumo", "homes", "referral", "other"]).optional(),
  status: z.string().optional(),
  date_from: z.coerce.date().optional(),
  date_to: z.coerce.date().optional(),
});

// 通知設定スキーマ
export const reminderSchema = z.object({
  customer_id: z.string().uuid(),
  title: z.string().min(1, "タイトルは必須です"),
  scheduled_at: z.coerce.date(),
  channel: z.enum(["email", "postal"]),
  payload: z.record(z.any()).optional(),
  priority: z.number().int().min(0).max(10).default(0),
});

// 書類生成スキーマ
export const documentSchema = z.object({
  customer_id: z.string().uuid(),
  kind: z.string().min(1, "書類種別は必須です"),
  meta: z.record(z.any()).optional(),
  file_path: z.string().optional(),
});

// 型定義のエクスポート
export type SellerInput = z.infer<typeof seller>;
export type BuyerInput = z.infer<typeof buyer>;
export type ReformInput = z.infer<typeof reform>;
export type ChecklistInput = z.infer<typeof checklistSchema>;
export type ReformCostUpdate = z.infer<typeof reformCostUpdateSchema>;
export type BrokerageReport = z.infer<typeof brokerageReportSchema>;
export type CustomerSearch = z.infer<typeof customerSearchSchema>;
export type ReminderInput = z.infer<typeof reminderSchema>;
export type DocumentInput = z.infer<typeof documentSchema>;
