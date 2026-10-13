const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const adminAuthMiddleware = require('../middleware/adminAuth');

// 获取请假列表（管理员）
router.get('/leave/list', adminAuthMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type, status } = req.query;
    const offset = (page - 1) * pageSize;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (type) {
      whereClause += ' AND l.type = ?';
      params.push(type);
    }

    if (status) {
      whereClause += ' AND l.status = ?';
      params.push(status);
    }

    // 查询总数
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM \`leave\` l ${whereClause}`,
      params
    );

    // 查询列表
    const [list] = await pool.query(
      `SELECT l.*, 
        u.nickname,
        u.phone,
        CASE 
          WHEN l.type = 'sick' THEN '病假'
          WHEN l.type = 'personal' THEN '事假'
          WHEN l.type = 'annual' THEN '年假'
          ELSE '其他'
        END as typeName,
        CASE 
          WHEN l.status = 'pending' THEN '待审核'
          WHEN l.status = 'approved' THEN '已通过'
          WHEN l.status = 'rejected' THEN '已拒绝'
          WHEN l.status = 'cancelled' THEN '已取消'
          ELSE '未知'
        END as statusName
      FROM \`leave\` l 
      LEFT JOIN user u ON l.userId = u.id
      ${whereClause} 
      ORDER BY l.createTime DESC 
      LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    // 统计数据
    const [statsResult] = await pool.query(
      `SELECT 
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM \`leave\``
    );

    res.json({
      code: 200,
      message: '获取成功',
      data: {
        list,
        total: countResult.total,
        page: parseInt(page),
        pageSize: parseInt(pageSize),
        stats: statsResult[0]
      }
    });
  } catch (error) {
    console.error('获取请假列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取列表失败'
    });
  }
});

// 获取请假详情（管理员）
router.get('/leave/:id', adminAuthMiddleware, async (req, res) => {
  try {
    const [leaves] = await pool.query(
      `SELECT l.*, 
        u.nickname,
        u.phone,
        CASE 
          WHEN l.type = 'sick' THEN '病假'
          WHEN l.type = 'personal' THEN '事假'
          WHEN l.type = 'annual' THEN '年假'
          ELSE '其他'
        END as typeName,
        CASE 
          WHEN l.status = 'pending' THEN '待审核'
          WHEN l.status = 'approved' THEN '已通过'
          WHEN l.status = 'rejected' THEN '已拒绝'
          WHEN l.status = 'cancelled' THEN '已取消'
          ELSE '未知'
        END as statusName
      FROM \`leave\` l 
      LEFT JOIN user u ON l.userId = u.id
      WHERE l.id = ?`,
      [req.params.id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '请假记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '获取成功',
      data: leaves[0]
    });
  } catch (error) {
    console.error('获取请假详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取详情失败'
    });
  }
});

// 通过请假申请
router.put('/leave/approve/:id', adminAuthMiddleware, async (req, res) => {
  try {
    // 检查请假记录
    const [leaves] = await pool.query(
      'SELECT * FROM \`leave\` WHERE id = ?',
      [req.params.id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '请假记录不存在'
      });
    }

    const leave = leaves[0];
    if (leave.status !== 'pending') {
      return res.status(400).json({
        code: 400,
        message: '只能审核待审核的请假申请'
      });
    }

    // 更新状态
    await pool.query(
      'UPDATE \`leave\` SET status = ?, approveTime = NOW() WHERE id = ?',
      ['approved', req.params.id]
    );

    // 创建消息通知
    await pool.query(
      'INSERT INTO message (userId, leaveId, title, content) VALUES (?, ?, ?, ?)',
      [leave.userId, req.params.id, '请假已通过', '您的请假申请已通过审核']
    );

    res.json({
      code: 200,
      message: '审核通过'
    });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({
      code: 500,
      message: '审核失败'
    });
  }
});

// 拒绝请假申请
router.put('/leave/reject/:id', adminAuthMiddleware, async (req, res) => {
  try {
    // 检查请假记录
    const [leaves] = await pool.query(
      'SELECT * FROM \`leave\` WHERE id = ?',
      [req.params.id]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '请假记录不存在'
      });
    }

    const leave = leaves[0];
    if (leave.status !== 'pending') {
      return res.status(400).json({
        code: 400,
        message: '只能审核待审核的请假申请'
      });
    }

    // 更新状态
    await pool.query(
      'UPDATE \`leave\` SET status = ?, approveTime = NOW() WHERE id = ?',
      ['rejected', req.params.id]
    );

    // 创建消息通知
    await pool.query(
      'INSERT INTO message (userId, leaveId, title, content) VALUES (?, ?, ?, ?)',
      [leave.userId, req.params.id, '请假已拒绝', '您的请假申请已被拒绝']
    );

    res.json({
      code: 200,
      message: '已拒绝'
    });
  } catch (error) {
    console.error('审核失败:', error);
    res.status(500).json({
      code: 500,
      message: '审核失败'
    });
  }
});

module.exports = router;