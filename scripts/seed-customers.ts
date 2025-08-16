import { createClient } from '@/lib/supabase-server';

const supabase = createClient();

async function seedCustomers() {
  try {
    console.log('顧客管理システムのSeedデータ作成を開始...');

    // 1. 売却顧客（専属専任・メール）
    const seller1 = await createSellerCustomer({
      name: '田中 太郎',
      name_kana: 'タナカ タロウ',
      phone: '090-1234-5678',
      email: 'tanaka@example.com',
      address: '東京都渋谷区渋谷1-1-1',
      source: 'flyer',
      property_type: 'mansion',
      mansion_name: '渋谷パークタワー',
      room_no: '1501',
      desired_price: 80000000,
      brokerage: 'exclusive_right',
      brokerage_start: new Date('2024-12-01'),
      report_channel: 'email',
      purchase_or_brokerage: '仲介'
    });

    // 2. 売却顧客（専任・郵送）
    const seller2 = await createSellerCustomer({
      name: '佐藤 花子',
      name_kana: 'サトウ ハナコ',
      phone: '090-8765-4321',
      email: 'sato@example.com',
      address: '東京都新宿区新宿2-2-2',
      source: 'lp',
      property_type: 'house',
      building_area: 120.5,
      floor_plan: '3LDK',
      built_year: 2010,
      area: 150.2,
      desired_price: 65000000,
      brokerage: 'exclusive',
      brokerage_start: new Date('2024-11-15'),
      report_channel: 'postal',
      purchase_or_brokerage: '買取'
    });

    // 3. 購入顧客（SUUMO起点）
    const buyer1 = await createBuyerCustomer({
      name: '鈴木 次郎',
      name_kana: 'スズキ ジロウ',
      phone: '090-5555-6666',
      email: 'suzuki@example.com',
      address: '東京都品川区品川3-3-3',
      source: 'suumo',
      preferred_area: '品川区・大田区',
      budget_min: 50000000,
      budget_max: 80000000,
      conditions: {
        station_distance: '徒歩10分以内',
        built_year_min: 2000,
        built_year_max: 2020,
        floor_plan: '3LDK以上',
        parking: true
      },
      finance_plan: {
        loan_type: 'フラット35',
        down_payment: 10000000,
        loan_amount: 60000000
      }
    });

    // 4. 購入顧客（HOME'S起点）
    const buyer2 = await createBuyerCustomer({
      name: '高橋 美咲',
      name_kana: 'タカハシ ミサキ',
      phone: '090-7777-8888',
      email: 'takahashi@example.com',
      address: '東京都世田谷区世田谷4-4-4',
      source: 'homes',
      preferred_area: '世田谷区・目黒区',
      budget_min: 40000000,
      budget_max: 60000000,
      conditions: {
        station_distance: '徒歩15分以内',
        built_year_min: 1995,
        built_year_max: 2015,
        floor_plan: '2LDK以上',
        parking: false
      },
      finance_plan: {
        loan_type: '住宅ローン',
        down_payment: 8000000,
        loan_amount: 45000000
      }
    });

    // 5. リフォーム案件（新規顧客）
    const reform1 = await createReformCustomer({
      name: '伊藤 健一',
      name_kana: 'イトウ ケンイチ',
      phone: '090-9999-0000',
      email: 'ito@example.com',
      address: '東京都中野区中野5-5-5',
      source: 'referral',
      property_type: 'house',
      building_area: 95.8,
      floor_plan: '2LDK',
      built_year: 2005,
      area: 120.0,
      is_existing_customer: false,
      requested_works: ['キッチンリフォーム', '浴室リフォーム', '内装リフォーム'],
      expected_revenue: 3500000
    });

    // 6. リフォーム案件（既存顧客）
    const reform2 = await createReformCustomer({
      name: '渡辺 由美',
      name_kana: 'ワタナベ ユミ',
      phone: '090-1111-2222',
      email: 'watanabe@example.com',
      address: '東京都杉並区杉並6-6-6',
      source: 'other',
      property_type: 'mansion',
      mansion_name: '杉並ハイツ',
      room_no: '805',
      is_existing_customer: true,
      requested_works: ['システムキッチン交換', '洗面台交換'],
      expected_revenue: 1200000
    });

    // 7. 原価データの追加（リフォーム案件1）
    await addReformCosts(reform1.reform_project_id, {
      material_cost: 1800000,
      outsourcing_cost: 1200000,
      travel_cost: 50000,
      other_cost: 45000,
      note: '高級建材使用'
    });

    // 8. 原価データの追加（リフォーム案件2）
    await addReformCosts(reform2.reform_project_id, {
      material_cost: 600000,
      outsourcing_cost: 400000,
      travel_cost: 20000,
      other_cost: 18000,
      note: '標準仕様'
    });

    console.log('✅ 顧客管理システムのSeedデータ作成が完了しました！');
    console.log(`作成された顧客数: ${seller1 ? 6 : 0}件`);

  } catch (error) {
    console.error('❌ Seedデータ作成エラー:', error);
  }
}

// 売却顧客作成
async function createSellerCustomer(data: {
  name: string;
  name_kana: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  property_type: string;
  mansion_name?: string;
  room_no?: string;
  building_area?: number;
  floor_plan?: string;
  built_year?: number;
  area?: number;
  desired_price: number;
  brokerage: string;
  brokerage_start: Date;
  report_channel: string;
  purchase_or_brokerage: string;
}) {
  try {
    // 顧客作成
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        category: 'seller',
        name: data.name,
        name_kana: data.name_kana,
        phone: data.phone,
        email: data.email,
        address: data.address,
        source: data.source,
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // 物件作成
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        customer_id: customer.id,
        property_type: data.property_type,
        address: data.address,
        mansion_name: data.mansion_name,
        room_no: data.room_no,
        building_area: data.building_area,
        floor_plan: data.floor_plan,
        built_year: data.built_year,
        area: data.area,
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    // 売却詳細作成
    const { data: sellerDetail, error: sellerError } = await supabase
      .from('seller_details')
      .insert({
        customer_id: customer.id,
        property_id: property.id,
        desired_price: data.desired_price,
        brokerage: data.brokerage,
        brokerage_start: data.brokerage_start.toISOString().split('T')[0],
        report_channel: data.report_channel,
        purchase_or_brokerage: data.purchase_or_brokerage,
      })
      .select()
      .single();

    if (sellerError) throw sellerError;

    // チェックリスト作成
    await createSellerChecklist(customer.id);

    return { customer, property, sellerDetail };
  } catch (error) {
    console.error('売却顧客作成エラー:', error);
    return null;
  }
}

// 購入顧客作成
async function createBuyerCustomer(data: {
  name: string;
  name_kana: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  preferred_area: string;
  budget_min?: number;
  budget_max?: number;
  conditions?: any;
  finance_plan?: any;
}) {
  try {
    // 顧客作成
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        category: 'buyer',
        name: data.name,
        name_kana: data.name_kana,
        phone: data.phone,
        email: data.email,
        address: data.address,
        source: data.source,
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // 購入詳細作成
    const { data: buyerDetail, error: buyerError } = await supabase
      .from('buyer_details')
      .insert({
        customer_id: customer.id,
        preferred_area: data.preferred_area,
        budget_min: data.budget_min,
        budget_max: data.budget_max,
        conditions: data.conditions,
        finance_plan: data.finance_plan,
      })
      .select()
      .single();

    if (buyerError) throw buyerError;

    // チェックリスト作成
    await createBuyerChecklist(customer.id);

    return { customer, buyerDetail };
  } catch (error) {
    console.error('購入顧客作成エラー:', error);
    return null;
  }
}

// リフォーム顧客作成
async function createReformCustomer(data: {
  name: string;
  name_kana: string;
  phone: string;
  email: string;
  address: string;
  source: string;
  property_type: string;
  mansion_name?: string;
  room_no?: string;
  building_area?: number;
  floor_plan?: string;
  built_year?: number;
  area?: number;
  is_existing_customer: boolean;
  requested_works: string[];
  expected_revenue: number;
}) {
  try {
    // 顧客作成
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .insert({
        category: 'reform',
        name: data.name,
        name_kana: data.name_kana,
        phone: data.phone,
        email: data.email,
        address: data.address,
        source: data.source,
      })
      .select()
      .single();

    if (customerError) throw customerError;

    // 物件作成
    const { data: property, error: propertyError } = await supabase
      .from('properties')
      .insert({
        customer_id: customer.id,
        property_type: data.property_type,
        address: data.address,
        mansion_name: data.mansion_name,
        room_no: data.room_no,
        building_area: data.building_area,
        floor_plan: data.floor_plan,
        built_year: data.built_year,
        area: data.area,
      })
      .select()
      .single();

    if (propertyError) throw propertyError;

    // リフォーム案件作成
    const { data: reformProject, error: reformError } = await supabase
      .from('reform_projects')
      .insert({
        customer_id: customer.id,
        property_id: property.id,
        is_existing_customer: data.is_existing_customer,
        requested_works: data.requested_works,
        expected_revenue: data.expected_revenue,
        status: 'estimating',
        progress_percent: 10,
      })
      .select()
      .single();

    if (reformError) throw reformError;

    // チェックリスト作成
    await createReformChecklist(customer.id);

    return { customer, property, reform_project_id: reformProject.id };
  } catch (error) {
    console.error('リフォーム顧客作成エラー:', error);
    return null;
  }
}

// 売却チェックリスト作成
async function createSellerChecklist(customerId: string) {
  const checklistItems = [
    '物件の現況確認',
    '査定依頼',
    '媒介契約書の作成',
    '物件情報の登録',
    'チラシ・LPの作成',
    '内覧の設定',
    '買主との交渉',
    '売買契約の締結',
    '引渡しの完了'
  ];

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'seller',
        title: '売却案件チェックリスト',
        due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目を作成
    for (const item of checklistItems) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item,
          is_checked: Math.random() > 0.7, // 30%の確率でチェック済み
        });
    }

  } catch (error) {
    console.error('売却チェックリスト作成エラー:', error);
  }
}

// 購入チェックリスト作成
async function createBuyerChecklist(customerId: string) {
  const checklistItems = [
    '購入希望条件の詳細ヒアリング',
    '物件の検索・提案',
    '内覧の設定',
    '物件の詳細調査',
    '価格交渉',
    'ローン審査',
    '売買契約の締結',
    '引渡しの完了'
  ];

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'buyer',
        title: '購入案件チェックリスト',
        due_date: new Date(Date.now() + 120 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目を作成
    for (const item of checklistItems) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item,
          is_checked: Math.random() > 0.8, // 20%の確率でチェック済み
        });
    }

  } catch (error) {
    console.error('購入チェックリスト作成エラー:', error);
  }
}

// リフォームチェックリスト作成
async function createReformChecklist(customerId: string) {
  const checklistItems = [
    '現地調査・見積もり',
    '提案書の作成',
    '契約の締結',
    '着工準備',
    '工事の開始',
    '工事の進行管理',
    '工事の完了',
    '引渡し・アフターケア'
  ];

  try {
    const { data: checklist, error: checklistError } = await supabase
      .from('checklists')
      .insert({
        customer_id: customerId,
        type: 'reform',
        title: 'リフォーム案件チェックリスト',
        due_date: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      })
      .select()
      .single();

    if (checklistError) throw checklistError;

    // チェックリスト項目を作成
    for (const item of checklistItems) {
      await supabase
        .from('checklist_items')
        .insert({
          checklist_id: checklist.id,
          label: item,
          is_checked: Math.random() > 0.6, // 40%の確率でチェック済み
        });
    }

  } catch (error) {
    console.error('リフォームチェックリスト作成エラー:', error);
  }
}

// リフォーム原価追加
async function addReformCosts(projectId: string, costs: {
  material_cost: number;
  outsourcing_cost: number;
  travel_cost: number;
  other_cost: number;
  note?: string;
}) {
  try {
    const { error } = await supabase
      .from('reform_costs')
      .insert({
        project_id: projectId,
        ...costs,
      });

    if (error) throw error;
    console.log(`原価データを追加しました: プロジェクトID ${projectId}`);

  } catch (error) {
    console.error('原価データ追加エラー:', error);
  }
}

// スクリプト実行
if (require.main === module) {
  seedCustomers();
}

export { seedCustomers };
