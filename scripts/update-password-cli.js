const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// 環境変数から設定を読み込み
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ 環境変数が設定されていません');
  console.log('NEXT_PUBLIC_SUPABASE_URL:', !!supabaseUrl);
  console.log('SUPABASE_SERVICE_KEY:', !!supabaseServiceKey);
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function updatePassword() {
  try {
    console.log('🔐 パスワードハッシュ更新開始');
    console.log('URL:', supabaseUrl);
    console.log('');
    
    // 現在のユーザー情報を確認
    console.log('1️⃣ 現在のユーザー情報を確認中...');
    const { data: currentUser, error: fetchError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', 'inui@homemart.co.jp')
      .single();
    
    if (fetchError) {
      console.error('❌ ユーザー取得エラー:', fetchError);
      return;
    }
    
    if (!currentUser) {
      console.error('❌ ユーザーが見つかりません');
      return;
    }
    
    console.log('✅ ユーザー発見:', {
      id: currentUser.id,
      email: currentUser.email,
      role: currentUser.role,
      currentHashLength: currentUser.password_hash?.length || 0
    });
    
    // 新しいパスワードハッシュ
    const newHash = '$2b$12$0YGnxJsBgRiMArU6ejL1DOCqKGHCcxWwvbQGiEmArULXHBSJ9XEr2';
    
    // パスワードハッシュを更新
    console.log('');
    console.log('2️⃣ パスワードハッシュを更新中...');
    const { data: updateResult, error: updateError } = await supabase
      .from('auth_users')
      .update({ 
        password_hash: newHash,
        updated_at: new Date().toISOString()
      })
      .eq('email', 'inui@homemart.co.jp')
      .select();
    
    if (updateError) {
      console.error('❌ 更新エラー:', updateError);
      return;
    }
    
    console.log('✅ 更新完了');
    
    // 更新結果を確認
    console.log('');
    console.log('3️⃣ 更新結果を確認中...');
    const { data: updatedUser, error: verifyError } = await supabase
      .from('auth_users')
      .select('*')
      .eq('email', 'inui@homemart.co.jp')
      .single();
    
    if (verifyError) {
      console.error('❌ 確認エラー:', verifyError);
      return;
    }
    
    console.log('✅ 確認完了:', {
      id: updatedUser.id,
      email: updatedUser.email,
      newHashLength: updatedUser.password_hash?.length || 0,
      updatedAt: updatedUser.updated_at
    });
    
    // パスワード検証テスト
    console.log('');
    console.log('4️⃣ パスワード検証テスト...');
    const bcrypt = require('bcryptjs');
    const testPassword = 'HomeM@rt2024';
    const isValid = await bcrypt.compare(testPassword, updatedUser.password_hash);
    
    console.log(`   パスワード: ${testPassword}`);
    console.log(`   検証結果: ${isValid ? '✅ 成功' : '❌ 失敗'}`);
    
    if (isValid) {
      console.log('');
      console.log('🎉 パスワード更新が完了しました！');
      console.log('   ログイン機能が使用できるようになりました。');
    } else {
      console.log('');
      console.log('❌ パスワード検証が失敗しました');
      console.log('   設定を確認してください。');
    }
    
  } catch (error) {
    console.error('💥 エラーが発生しました:', error);
  }
}

updatePassword();
