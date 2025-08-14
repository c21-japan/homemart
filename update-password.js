const bcrypt = require('bcryptjs');
const hash = bcrypt.hashSync('HomeM@rt2024', 10);
console.log('UPDATE users SET password = \'' + hash + '\' WHERE email = \'inui@homemart.co.jp\';');
