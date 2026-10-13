const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const authMiddleware = require('../middleware/auth');

// 获取消息列表
router.get('/list', authMiddleware, async (req, res) => {
  try {
    const { page = 1, pageSize = 10 } = req.query;
    const offset = (page - 1) * pageSize;

    // 查询总数
    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM message WHERE userId = ?',
      [req.userId]
    );
    const total = countResult[0].total;

    // 查询列表
    const [list] = await pool.query(
      'SELECT * FROM message WHERE userId = ? ORDER BY createTime DESC LIMIT ? OFFSET ?',
      [req.userId, parseInt(pageSize), parseInt(offset)]
    );

    res.json({
      code: 200,
      data: {
        list,
        total
      }
    });
  } catch (error) {
    console.error('获取消息列表失败:', error);
    res.status(500).json({
      code: 500,
      message: '获取消息列表失败'
    });
  }
});

// 标记已读
router.put('/read/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'UPDATE message SET isRead = 1 WHERE id = ? AND userId = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在'
      });
    }

    res.json({
      code: 200,
      message: '标记成功'
    });
  } catch (error) {
    console.error('标记已读失败:', error);
    res.status(500).json({
      code: 500,
      message: '标记失败'
    });
  }
});

// 删除消息
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const [result] = await pool.query(
      'DELETE FROM message WHERE id = ? AND userId = ?',
      [req.params.id, req.userId]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        code: 404,
        message: '消息不存在'
      });
    }

    res.json({
      code: 200,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除消息失败:', error);
    res.status(500).json({
      code: 500,
      message: '删除失败'
    });
  }
});

module.exports = router;