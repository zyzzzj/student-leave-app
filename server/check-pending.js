const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_leave_db'
  });
  
  const [rows] = await conn.execute('SELECT id, userId, type, status, startTime, endTime, reason, createTime FROM `leave` WHERE status = "pending" ORDER BY createTime DESC');
  console.log('待审核记录数:', rows.length);
  console.log(JSON.stringify(rows, null, 2));
  
  await conn.end();
})();