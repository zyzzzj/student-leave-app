const mysql = require('mysql2/promise');

(async () => {
  const conn = await mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'student_leave_db'
  });
  
  try {
    // 检查 user 表结构
    const [cols] = await conn.execute('SHOW COLUMNS FROM `user`');
    console.log('user 表当前字段:');
    cols.forEach(c => console.log(`  ${c.Field} (${c.Type})`));
    
    // 如果 phone 存在，删除它
    const hasPhone = cols.some(c => c.Field === 'phone');
    const hasStudentNo = cols.some(c => c.Field === 'studentNo');
    
    if (hasPhone) {
      await conn.execute('ALTER TABLE `user` DROP COLUMN `phone`');
      console.log('已删除 phone 字段');
    }
    
    if (!hasStudentNo) {
      await conn.execute('ALTER TABLE `user` ADD COLUMN `studentNo` VARCHAR(20) NOT NULL UNIQUE COMMENT "学号" AFTER `id`');
      console.log('已添加 studentNo 字段');
    }
    
    // 更新测试数据
    await conn.execute('UPDATE `user` SET studentNo = ? WHERE id = 1', ['2024001']);
    await conn.execute('UPDATE `user` SET studentNo = ? WHERE id = 2', ['2024002']);
    await conn.execute('UPDATE `user` SET studentNo = ? WHERE id = 3', ['2024003']);
    await conn.execute('UPDATE `user` SET studentNo = ? WHERE id = 4', ['2024004']);
    console.log('测试数据更新成功');
    
    // 删除 leave 表的 phone 字段
    const [leaveCols] = await conn.execute('SHOW COLUMNS FROM `leave`');
    const leaveHasPhone = leaveCols.some(c => c.Field === 'phone');
    if (leaveHasPhone) {
      await conn.execute('ALTER TABLE `leave` DROP COLUMN `phone`');
      console.log('已删除 leave 表的 phone 字段');
    }
    
  } catch (e) {
    console.log('错误:', e.message);
  }
  
  await conn.end();
})();