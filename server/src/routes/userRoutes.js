const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// 用户注册
router.post('/register', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '请输入正确的手机号'
      });
    }

    // 验证密码
    if (!password || password.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '密码长度不能少于6位'
      });
    }

    // 检查手机号是否已注册
    const [existingUsers] = await pool.query('SELECT id FROM user WHERE phone = ?', [phone]);
    if (existingUsers.length > 0) {
      return res.status(400).json({
        code: 400,
        message: '该手机号已注册'
      });
    }

    // 密码加密
    const hashedPassword = await bcrypt.hash(password, 10);

    // 插入用户
    const [result] = await pool.query(
      'INSERT INTO user (phone, password) VALUES (?, ?)',
      [phone, hashedPassword]
    );

    res.json({
      code: 200,
      message: '注册成功',
      data: {
        userId: result.insertId
      }
    });
  } catch (error) {
    console.error('注册失败:', error);
    res.status(500).json({
      code: 500,
      message: '注册失败，请稍后重试'
    });
  }
});

// 用户登录
router.post('/login', async (req, res) => {
  try {
    const { phone, password } = req.body;

    // 验证手机号
    const phoneRegex = /^1[3-9]\d{9}$/;
    if (!phone || !phoneRegex.test(phone)) {
      return res.status(400).json({
        code: 400,
        message: '请输入正确的手机号'
      });
    }

    // 验证密码
    if (!password) {
      return res.status(400).json({
        code: 400,
        message: '请输入密码'
      });
    }

    // 查询用户
    const [users] = await pool.query('SELECT * FROM user WHERE phone = ?', [phone]);
    if (users.length === 0) {
      return res.status(400).json({
        code: 400,
        message: '手机号或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(400).json({
        code: 400,
        message: '手机号或密码错误'
      });
    }

    // 生成Token
    const token = jwt.sign(
      { userId: user.id, phone: user.phone },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // 返回用户信息（不包含密码）
    const { password: _, ...userInfo } = user;

    res.json({
      code: 200,
      message: '登录成功',
      data: {
        token,
        userInfo
      }
    });
  } catch (error) {
    console.error('登录失败:', error);
    res.status(500).json({
      code: 500,
      message: '登录失败，请稍后重试'
    });
  }
});

// 获取用户信息
router.get('/info', authMiddleware, async (req, res) => {
  try {
    const [users] = await pool.query(
      'SELECT id, nickname, avatar, gender, department, class, studentNo, createTime FROM user WHERE id = ?',
      [req.userId]
    );

    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    res.json({
      code: 200,
      data: users[0]
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取用户信息失败'
    });
  }
});

// 更新用户信息
router.put('/info', authMiddleware, async (req, res) => {
  try {
    const { nickname, avatar, gender, department, class: userClass } = req.body;

    await pool.query(
      'UPDATE user SET nickname = ?, avatar = ?, gender = ?, department = ?, `class` = ? WHERE id = ?',
      [nickname, avatar, gender, department, userClass, req.userId]
    );

    // 获取更新后的用户信息
    const [users] = await pool.query(
      'SELECT id, nickname, avatar, gender, department, class, studentNo, createTime FROM user WHERE id = ?',
      [req.userId]
    );

    res.json({
      code: 200,
      message: '更新成功',
      data: users[0]
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    console.error('错误详情:', error.message);
    console.error('SQL错误:', error.sqlMessage || error.sql);
    console.error('请求数据:', req.body);
    console.error('用户ID:', req.userId);
    res.status(500).json({
      code: 500,
      message: '更新用户信息失败: ' + error.message
    });
  }
});

// 修改密码
router.post('/changePassword', authMiddleware, async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        code: 400,
        message: '请输入旧密码和新密码'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        code: 400,
        message: '新密码长度不能少于6位'
      });
    }

    // 验证旧密码
    const [users] = await pool.query('SELECT password FROM user WHERE id = ?', [req.userId]);
    if (users.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '用户不存在'
      });
    }

    const isPasswordValid = await bcrypt.compare(oldPassword, users[0].password);
    if (!isPasswordValid) {
      return res.status(400).json({
        code: 400,
        message: '旧密码错误'
      });
    }

    // 更新密码
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE user SET password = ? WHERE id = ?', [hashedPassword, req.userId]);

    res.json({
      code: 200,
      message: '密码修改成功'
    });
  } catch (error) {
    console.error('修改密码失败:', error);
    res.status(500).json({
      code: 500,
      message: '修改密码失败'
    });
  }
});

module.exports = router;