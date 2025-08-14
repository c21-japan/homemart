const bcrypt = require('bcryptjs');
const { Pool } = require('pg');

const pool = new Pool({
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: 'postgres',
  database: 'homemart_db'
});

async function createAdmin() {
  try {
    // パスワードをハッシュ化
    const hashedPassword = await bcrypt.hash('HomeM@rt2024', 10);
    
    // ユーザーを追加
    const result = await pool.query(`
      INSERT INTO users (email, password, name, role, created_at, updated_at)
      VALUES ($1, $2, $3, $4, NOW(), NOW())
      ON CONFLICT (email) 
      DO UPDATE SET 
        password = $2,
        updated_at = NOW()
      RETURNING *
    `, ['inui@homemart.co.jp', hashedPassword, '乾佑企', 'admin']);
    
    console.log('✅ 管理者ユーザー作成成功！');
    console.log('📧 Email: inui@homemart.co.jp');
    console.log('🔑 Password: HomeM@rt2024');
    
  } catch (error) {
    console.error('❌ エラー:', error.message);
  } finally {
    await pool.end();
  }
}

createAdmin();
