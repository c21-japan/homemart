const bcrypt = require('bcryptjs');

// テストユーザーのパスワード
const password = 'HomeM@rt2024';
const email = 'inui@homemart.co.jp';

async function generateHash() {
  try {
    // パスワードハッシュを生成
    const saltRounds = 12;
    const hash = await bcrypt.hash(password, saltRounds);
    
    console.log('=== パスワードハッシュ生成完了 ===');
    console.log(`メールアドレス: ${email}`);
    console.log(`パスワード: ${password}`);
    console.log(`ハッシュ: ${hash}`);
    console.log('');
    console.log('=== SQL文 ===');
    console.log(`UPDATE auth_users SET password_hash = '${hash}' WHERE email = '${email}';`);
    console.log('');
    console.log('=== 検証用 ===');
    console.log('このハッシュでパスワード検証をテストできます:');
    console.log(`bcrypt.compare('${password}', '${hash}')`);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

generateHash();
