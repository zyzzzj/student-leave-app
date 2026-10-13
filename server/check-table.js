const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_leave_db'
  });
  
  const [cols] = await conn.execute('SHOW COLUMNS FROM `leave`');
  console.log('leave 表字段:');
  cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
  
  await conn.end();
})();