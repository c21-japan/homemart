const bcrypt = require('bcryptjs');

async function hashPassword() {
  const password = 'HomeM@rt2024';
  const hash = await bcrypt.hash(password, 10);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nSQL Update Command:');
  console.log(`UPDATE auth_users SET password_hash = '${hash}' WHERE email = 'inui@homemart.co.jp';`);
}

hashPassword();
