const bcrypt = require('bcryptjs');

// テスト用のパスワードとハッシュ
const testPassword = 'HomeM@rt2024';
const testHash = '$2b$12$0YGnxJsBgRiMArU6ejL1DOCqKGHCcxWwvbQGiEmArULXHBSJ9XEr2';

async function testLogin() {
  console.log('🧪 ログイン機能テスト開始');
  console.log('');
  
  try {
    // 1. パスワードハッシュの検証テスト
    console.log('1️⃣ パスワードハッシュ検証テスト');
    console.log(`   パスワード: ${testPassword}`);
    console.log(`   ハッシュ: ${testHash}`);
    
    const isValid = await bcrypt.compare(testPassword, testHash);
    console.log(`   検証結果: ${isValid ? '✅ 成功' : '❌ 失敗'}`);
    console.log('');
    
    if (!isValid) {
      console.log('❌ パスワード検証が失敗しました');
      return;
    }
    
    // 2. 新しいハッシュの生成テスト
    console.log('2️⃣ 新しいハッシュ生成テスト');
    const newHash = await bcrypt.hash(testPassword, 12);
    console.log(`   新しいハッシュ: ${newHash}`);
    
    // 3. 新しいハッシュでの検証テスト
    const newHashValid = await bcrypt.compare(testPassword, newHash);
    console.log(`   新ハッシュ検証結果: ${newHashValid ? '✅ 成功' : '❌ 失敗'}`);
    console.log('');
    
    // 4. 間違ったパスワードでのテスト
    console.log('3️⃣ 間違ったパスワードでのテスト');
    const wrongPassword = 'WrongPassword123';
    const wrongPasswordValid = await bcrypt.compare(wrongPassword, testHash);
    console.log(`   間違ったパスワード: ${wrongPassword}`);
    console.log(`   検証結果: ${wrongPasswordValid ? '❌ 誤って成功' : '✅ 正しく失敗'}`);
    console.log('');
    
    // 5. 結果サマリー
    console.log('📊 テスト結果サマリー');
    console.log(`   ✅ 正しいパスワード検証: ${isValid ? '成功' : '失敗'}`);
    console.log(`   ✅ 新ハッシュ検証: ${newHashValid ? '成功' : '失敗'}`);
    console.log(`   ✅ 間違ったパスワード拒否: ${!wrongPasswordValid ? '成功' : '失敗'}`);
    
    if (isValid && newHashValid && !wrongPasswordValid) {
      console.log('');
      console.log('🎉 すべてのテストが成功しました！');
      console.log('   ログイン機能は正常に動作します。');
    } else {
      console.log('');
      console.log('❌ 一部のテストが失敗しました。');
      console.log('   設定を確認してください。');
    }
    
  } catch (error) {
    console.error('💥 テスト実行中にエラーが発生:', error);
  }
}

testLogin();
