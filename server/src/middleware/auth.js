const jwt = require('jsonwebtoken');

// JWT中间件 - 验证Token
function authMiddleware(req, res, next) {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证令牌'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    req.phone = decoded.phone;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证令牌无效或已过期'
    });
  }
}

module.exports = authMiddleware;