const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// 提交请假申请
router.post('/apply', authMiddleware, async (req, res) => {
  try {
    const { type, startTime, endTime, reason, images } = req.body;

    // 验证必填字段
    if (!type || !startTime || !endTime || !reason) {
      return res.status(400).json({
        code: 400,
        message: '请填写完整的请假信息'
      });
    }

    // 验证时间
    if (new Date(endTime) <= new Date(startTime)) {
      return res.status(400).json({
        code: 400,
        message: '结束时间必须晚于开始时间'
      });
    }

    // 插入请假记录
    const imagesStr = images ? images.join(',') : null;
    const [result] = await pool.query(
      'INSERT INTO `leave` (userId, type, startTime, endTime, reason, images, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [req.userId, type, startTime, endTime, reason, imagesStr, 'pending']
    );

    // 创建消息通知
    await pool.query(
      'INSERT INTO message (userId, leaveId, title, content) VALUES (?, ?, ?, ?)',
      [req.userId, result.insertId, '请假申请已提交', `您的${type}申请已提交，等待审批`]
    );

    res.json({
      code: 200,
      message: '提交成功',
      data: {
        id: result.insertId
      }
    });
  } catch (error) {
    console.error('提交请假申请失败:', error);
    res.status(500).json({
      code: 500,
      message: '提交失败，请稍后重试'
    });
  }
});

// 获取请假列表
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10, type, status } = req.query;
    const offset = (page - 1) * pageSize;

    // 构建查询条件
    let whereClause = 'WHERE l.userId = ?';
    let params = [req.userId];

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
    const total = countResult[0].total;

    // 查询列表
    const [list] = await pool.query(
      `SELECT l.*, 
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
      ${whereClause} 
      ORDER BY l.createTime DESC 
      LIMIT ? OFFSET ?`,
      [...params, parseInt(pageSize), parseInt(offset)]
    );

    // 处理图片字段
    const processedList = list.map(item => ({
      ...item,
      images: item.images ? item.images.split(',') : []
    }));

    // 统计数据
    const [statsResult] = await pool.query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved,
        SUM(CASE WHEN status = 'rejected' THEN 1 ELSE 0 END) as rejected
      FROM \`leave\` 
      WHERE userId = ?`,
      [req.userId]
    );

    res.json({
      code: 200,
      data: {
        list: processedList,
        total,
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

// 获取请假详情
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const [leaves] = await pool.query(
      `SELECT l.*, 
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
      WHERE l.id = ? AND l.userId = ?`,
      [req.params.id, req.userId]
    );

    if (leaves.length === 0) {
      return res.status(404).json({
        code: 404,
        message: '请假记录不存在'
      });
    }

    const leave = leaves[0];
    leave.images = leave.images ? leave.images.split(',') : [];

    res.json({
      code: 200,
      data: leave
    });
  } catch (error) {
    console.error('获取请假详情失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取详情失败'
    });
  }
});

// 取消请假
router.put('/cancel/:id', authMiddleware, async (req, res) => {
  try {
    // 检查请假记录
    const [leaves] = await pool.query(
      'SELECT * FROM \`leave\` WHERE id = ? AND userId = ?',
      [req.params.id, req.userId]
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
        message: '只能取消待审核的请假申请'
      });
    }

    // 更新状态
    await pool.query(
      'UPDATE \`leave\` SET status = ? WHERE id = ?',
      ['cancelled', req.params.id]
    );

    // 创建消息通知
    await pool.query(
      'INSERT INTO message (userId, leaveId, title, content) VALUES (?, ?, ?, ?)',
      [req.userId, req.params.id, '请假已取消', '您的请假申请已取消']
    );

    res.json({
      code: 200,
      message: '取消成功'
    });
  } catch (error) {
    console.error('取消请假失败:', error);
    res.status(500).json({
      code: 500,
      message: '取消失败'
    });
  }
});

// 删除请假记录
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM \`leave\` WHERE id = ? AND userId = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '请假记录不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除请假记录失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败'
    });
  }
});

module.exports = router;