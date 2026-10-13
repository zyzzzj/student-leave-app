const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_leave_db'
  });
  
  try {
    await conn.execute('ALTER TABLE `leave` ADD COLUMN approveTime DATETIME NULL COMMENT "审核时间" AFTER status');
    console.log('approveTime 字段添加成功');
  } catch (e) {
    if (e.code === 'ER_DUP_FIELDNAME') {
      console.log('approveTime 字段已存在');
    } else {
      console.log('错误:', e.message);
    }
  }
  
  await conn.end();
})();