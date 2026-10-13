const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePasswords() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'student_leave_db'
    });

    const hash = await bcrypt.hash('123456', 10);
    console.log('生成的哈希:', hash);

    await connection.execute(
      'UPDATE user SET password = ?',
      [hash]
    );

    console.log('密码更新成功');

    // 验证
    const [users] = await connection.execute(
      'SELECT password FROM user WHERE id = 1'
    );
    
    const isValid = await bcrypt.compare('123456', users[0].password);
    console.log('验证结果:', isValid);

    await connection.end();
  } catch (error) {
    console.error('错误:', error.message);
  }
}

updatePasswords();