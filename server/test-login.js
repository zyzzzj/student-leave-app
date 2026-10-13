const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function testLogin() {
  try {
    // 连接数据库
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'student_leave_db'
    });

    // 查询用户
    const [users] = await connection.execute(
      'SELECT * FROM user WHERE phone = ?',
      ['13800138000']
    );

    console.log('查询到的用户:', users[0]);
    console.log('密码字段:', users[0].password);

    // 验证密码
    const isValid = await bcrypt.compare('123456', users[0].password);
    console.log('密码验证结果:', isValid);

    await connection.end();
  } catch (error) {
    console.error('错误:', error.message);
  }
}

testLogin();