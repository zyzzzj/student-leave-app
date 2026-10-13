const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');

// 管理员登录
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        code: 400,
        message: '请输入账号和密码'
      });
    }

    // 查询管理员
    const [admins] = await pool.query('SELECT * FROM admin WHERE username = ?', [username]);
    if (admins.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '账号或密码错误'
      });
    }

    const admin = admins[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, admin.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        code: 400,
        message: '账号或密码错误'
      });
    }

    // 生成Token
    const token = jwt.sign(
      { adminId: admin.id, username: admin.username, role: admin.role },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // 返回管理员信息（不包含密码）
    const { password: _, ...adminInfo } = admin;

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        adminInfo
      }
    });
  } catch (error) {
    console.error('管理员登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试'
    });
  }
});

module.exports = router;