const jwt = require('jsonwebtoken');

const adminAuthMiddleware = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({
        code: 401,
        message: '未提供认证信息'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.adminId = decoded.adminId;
    req.adminInfo = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      code: 401,
      message: '认证失败，请重新登录'
    });
  }
};

module.exports = adminAuthMiddleware;