# 物件管理と顧客管理の連携機能

## 概要

物件管理画面（`/admin/properties`）に顧客管理の顧客情報を検索できる検索ボックスを追加し、売主（seller）を紐付けられるようにしました。これにより、物件管理と顧客管理の整合性が確保され、重複データによる不整合が解消されます。

## 主な機能

### 1. 売主選択機能
- インクリメンタルサーチ + プルダウン候補
- 日本語IME対応（composition中は検索を発火しない）
- デバウンス 300ms、2文字以上で検索
- 前方一致 + 部分一致検索（漢字/かな/ローマ字）
- キーボード操作対応（↑↓で移動、Enterで決定、Escで閉じる）

### 2. 共有コンポーネント
- `PropertySummary`コンポーネントで物件一覧と詳細の表示を統一
- 売主情報の表示と顧客詳細へのリンク

### 3. データ整合性
- 単一真実源（SSOT）：物件情報は必ず`properties`テーブル
- 顧客管理からの物件編集も同一更新関数に集約

## 技術仕様

### データベース変更

#### マイグレーションファイル
`supabase/migrations/20250118_properties_seller_link.sql`

#### 追加されたカラム
```sql
ALTER TABLE properties 
ADD COLUMN seller_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL;
```

#### 追加されたインデックス
```sql
-- 売主物件のインデックス
CREATE INDEX idx_properties_seller_customer 
ON properties(seller_customer_id) 
WHERE seller_customer_id IS NOT NULL;

-- 顧客検索用の複合インデックス
CREATE INDEX idx_customers_search_combined 
ON customers USING gin(
  to_tsvector('japanese', 
    COALESCE(name, '') || ' ' || 
    COALESCE(name_kana, '') || ' ' || 
    COALESCE(phone, '') || ' ' || 
    COALESCE(email, '')
  )
);

-- 電話番号・メールアドレスの前方一致検索用インデックス
CREATE INDEX idx_customers_phone_prefix ON customers(phone) WHERE phone IS NOT NULL;
CREATE INDEX idx_customers_email_prefix ON customers(email) WHERE email IS NOT NULL;
```

### API仕様

#### 顧客検索API
```
GET /api/customers/search?q=<string>&limit=10
```

**レスポンス形式**
```json
{
  "results": [
    {
      "id": "uuid",
      "label": "山田 太郎 | 080-XXXX-XXXX",
      "kana": "ヤマダ タロウ",
      "phone": "080-XXXX-XXXX",
      "email": "yamada@example.com",
      "category": "seller"
    }
  ],
  "total": 1,
  "query": "山田"
}
```

**検索条件**
- 2文字以上で検索開始
- 名前、かな、電話、メールで部分一致・前方一致
- アクティブな顧客のみ（`is_active = true`）
- 最大20件まで返却

### コンポーネント

#### SellerSelect
- 売主選択用のインクリメンタルサーチコンポーネント
- ARIA combobox対応
- キーボード操作対応
- 外部クリックでドロップダウンを閉じる

#### PropertySummary
- 物件一覧と詳細で共有するコンポーネント
- 売主情報の表示
- アクションボタンの表示制御

## UI操作方法

### 新規物件登録
1. `/admin/properties/new` にアクセス
2. 「売主」フィールドに顧客名・かな・電話・メールを入力
3. 候補から選択（キーボード操作可）
4. 選択後も他の物件項目は編集可能
5. 物件を登録

### 物件一覧表示
- テーブル形式からPropertySummaryカード形式に変更
- 売主情報が表示される
- 詳細・編集ボタンで操作

### 物件詳細表示
- `/admin/properties/[id]` で詳細ページ
- 一覧と同一の情報を表示
- 売主が紐付いている場合、顧客詳細へのリンクを表示

### 顧客管理からの物件作成
1. 顧客一覧で「🏠 新規物件登録」をクリック
2. 売主が自動的に設定された状態で物件登録ページが開く
3. 物件情報を入力して登録

## 移行・ロールバック手順

### 移行手順
1. データベースマイグレーションを実行
```bash
# Supabase CLIを使用
supabase db push

# または直接SQL実行
psql -h your-host -U your-user -d your-db -f supabase/migrations/20250118_properties_seller_link.sql
```

2. 既存のcustomer_idをseller_customer_idに移行（自動実行）
```sql
UPDATE properties 
SET seller_customer_id = customer_id 
WHERE customer_id IS NOT NULL 
  AND EXISTS (
    SELECT 1 FROM customers c 
    WHERE c.id = properties.customer_id 
    AND c.category = 'seller'
  );
```

3. アプリケーションを再起動

### ロールバック手順
1. マイグレーションをロールバック
```sql
-- インデックスを削除
DROP INDEX IF EXISTS idx_properties_seller_customer;
DROP INDEX IF EXISTS idx_customers_search_combined;
DROP INDEX IF EXISTS idx_customers_phone_prefix;
DROP INDEX IF EXISTS idx_customers_email_prefix;

-- カラムを削除
ALTER TABLE properties DROP COLUMN IF EXISTS seller_customer_id;
```

2. アプリケーションを再起動

## 既知の制約

### パフォーマンス
- 顧客検索は300msのデバウンスが適用される
- 検索結果は最大20件まで
- 大量データでの検索性能はインデックスに依存

### データ整合性
- 売主の削除時は`ON DELETE SET NULL`で対応
- 既存のcustomer_idとの整合性は移行時に確認が必要

### UI/UX
- 日本語IME入力中の検索発火は制御される
- 売主選択後も物件情報は編集可能

## テスト方法

### 単体テスト
```bash
# 顧客検索ロジックのテスト
npm test -- --testNamePattern="CustomerSearch"

# PropertySummaryコンポーネントのテスト
npm test -- --testNamePattern="PropertySummary"

# SellerSelectコンポーネントのテスト
npm test -- --testNamePattern="SellerSelect"
```

### 統合テスト
```bash
# APIテスト
npm test -- --testNamePattern="CustomerSearchAPI"

# サービス層テスト
npm test -- --testNamePattern="PropertyService"
```

### E2Eテスト
```bash
# Playwrightを使用
npm run test:e2e

# テストシナリオ
# 1. properties/new で「山田」を検索 → 候補選択 → 物件保存 → 詳細で売主リンク表示
# 2. 顧客詳細から物件編集 → /admin/properties 一覧と詳細に変更が反映
# 3. 物件一覧の「詳細」と物件詳細ページの表示フィールドが完全一致
# 4. かな/漢字/ローマ字の検索でヒット、IME合成中は検索不発
# 5. 大量顧客データでもレスポンスが劣化しない
```

### 手動テスト
1. **売主選択機能**
   - 新規物件登録で顧客検索
   - 日本語入力での検索
   - キーボード操作

2. **表示整合性**
   - 物件一覧と詳細の表示比較
   - 売主情報の表示確認

3. **データ整合性**
   - 顧客管理からの物件編集
   - 物件管理での売主変更

## トラブルシューティング

### よくある問題

#### 顧客検索が動作しない
- APIエンドポイントの確認
- データベースインデックスの確認
- ネットワークエラーの確認

#### 売主情報が表示されない
- `seller_customer_id`の値確認
- 顧客テーブルのデータ確認
- リレーション設定の確認

#### パフォーマンスが悪い
- データベースインデックスの確認
- 検索クエリの最適化
- キャッシュの活用

### ログ確認
```bash
# アプリケーションログ
tail -f logs/app.log

# データベースログ
tail -f logs/db.log

# APIログ
tail -f logs/api.log
```

## 今後の拡張予定

### 短期（1-2ヶ月）
- 売主変更履歴の記録
- 一括売主設定機能
- 売主別物件レポート

### 中期（3-6ヶ月）
- 顧客検索の高度化（AI推薦）
- 売主・買主のマッチング機能
- 物件価格の自動評価

### 長期（6ヶ月以上）
- 顧客管理システムの統合
- 外部不動産システムとの連携
- データ分析・BI機能

## 関連ドキュメント

- [データベース設計書](../database/README.md)
- [API仕様書](../api/README.md)
- [UI/UXガイドライン](../design/README.md)
- [テスト計画書](../testing/README.md)
