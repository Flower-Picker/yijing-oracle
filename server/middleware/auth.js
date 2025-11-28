const { verifyToken } = require('../utils/jwt');
const { pool } = require('../config/database');

/**
 * 验证JWT令牌中间件
 */
async function authenticate(req, res, next) {
  try {
    // 从请求头获取token
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: '未提供认证令牌'
      });
    }

    const token = authHeader.substring(7);

    // 验证token
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: '令牌无效或已过期'
      });
    }

    // 查询用户信息
    const [users] = await pool.query(
      'SELECT id, username, email, phone, user_type, ai_quota, vip_expire_at FROM users WHERE id = ?',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '用户不存在'
      });
    }

    // 将用户信息附加到请求对象
    req.user = users[0];
    next();
  } catch (error) {
    console.error('认证错误:', error);
    res.status(500).json({
      success: false,
      message: '认证失败'
    });
  }
}

/**
 * 可选认证中间件（token可选）
 */
async function optionalAuthenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const decoded = verifyToken(token);

      if (decoded) {
        const [users] = await pool.query(
          'SELECT id, username, email, phone, user_type, ai_quota FROM users WHERE id = ?',
          [decoded.userId]
        );

        if (users.length > 0) {
          req.user = users[0];
        }
      }
    }

    next();
  } catch (error) {
    next();
  }
}

/**
 * VIP权限验证
 */
function requireVIP(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: '请先登录'
    });
  }

  if (req.user.user_type !== 'vip') {
    return res.status(403).json({
      success: false,
      message: '此功能仅限VIP用户'
    });
  }

  // 检查VIP是否过期
  if (req.user.vip_expire_at && new Date(req.user.vip_expire_at) < new Date()) {
    return res.status(403).json({
      success: false,
      message: 'VIP已过期'
    });
  }

  next();
}

module.exports = {
  authenticate,
  optionalAuthenticate,
  requireVIP
};
