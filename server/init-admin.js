const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function initAdmin() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: 'root',
      database: 'student_leave_db'
    });

    // 创建管理员表
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS \`admin\` (
        id INT PRIMARY KEY AUTO_INCREMENT,
        username VARCHAR(50) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        name VARCHAR(50),
        role VARCHAR(20) DEFAULT 'admin',
        createTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        updateTime DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
    `);

    // 生成密码哈希
    const hash = await bcrypt.hash('admin123', 10);
    console.log('管理员密码哈希:', hash);

    // 检查是否已存在admin账号
    const [existing] = await connection.execute(
      'SELECT id FROM admin WHERE username = ?',
      ['admin']
    );

    if (existing.length === 0) {
      // 插入默认管理员
      await connection.execute(
        'INSERT INTO admin (username, password, name, role) VALUES (?, ?, ?, ?)',
        ['admin', hash, '系统管理员', 'admin']
      );
      console.log('✓ 管理员账号创建成功');
      console.log('  账号: admin');
      console.log('  密码: admin123');
    } else {
      // 更新密码
      await connection.execute(
        'UPDATE admin SET password = ? WHERE username = ?',
        [hash, 'admin']
      );
      console.log('✓ 管理员密码已更新');
      console.log('  账号: admin');
      console.log('  密码: admin123');
    }

    await connection.end();
  } catch (error) {
    console.error('错误:', error.message);
  }
}

initAdmin();