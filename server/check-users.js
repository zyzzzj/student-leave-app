const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_leave_db'
  });
  
  const [rows] = await conn.execute('SELECT id, studentNo, password FROM user');
  console.log('用户数据:');
  rows.forEach(r => console.log(`  ID: ${r.id}, 学号: ${r.studentNo}, 密码哈希: ${r.password.substring(0, 20)}...`));
  
  await conn.end();
})();