const { pool } = require('../config/database');

/**
 * 获取用户信息
 */
async function getProfile(req, res) {
  try {
    const user = req.user;

    res.json({
      success: true,
      data: {
        id: user.id,
        username: user.username,
        email: user.email,
        phone: user.phone,
        userType: user.user_type,
        aiQuota: user.ai_quota,
        vipExpireAt: user.vip_expire_at,
        divinationCount: user.divination_count || 0
      }
    });
  } catch (error) {
    console.error('获取用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户信息失败'
    });
  }
}

/**
 * 更新用户信息
 */
async function updateProfile(req, res) {
  try {
    const { username } = req.body;
    const userId = req.user.id;

    if (!username) {
      return res.status(400).json({
        success: false,
        message: '用户名不能为空'
      });
    }

    await pool.query(
      'UPDATE users SET username = ? WHERE id = ?',
      [username, userId]
    );

    res.json({
      success: true,
      message: '更新成功'
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新失败'
    });
  }
}

/**
 * 升级VIP
 */
async function upgradeToVIP(req, res) {
  try {
    const userId = req.user.id;

    // 设置VIP过期时间（1年后）
    const vipExpireAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000);

    await pool.query(
      'UPDATE users SET user_type = ?, ai_quota = ?, vip_expire_at = ? WHERE id = ?',
      ['vip', 999, vipExpireAt, userId]
    );

    res.json({
      success: true,
      message: '升级VIP成功',
      data: {
        userType: 'vip',
        aiQuota: 999,
        vipExpireAt
      }
    });
  } catch (error) {
    console.error('升级VIP失败:', error);
    res.status(500).json({
      success: false,
      message: '升级失败'
    });
  }
}

/**
 * 使用AI解卦次数
 */
async function useAIQuota(req, res) {
  try {
    const userId = req.user.id;

    if (req.user.ai_quota <= 0) {
      return res.status(400).json({
        success: false,
        message: 'AI解卦次数不足'
      });
    }

    await pool.query(
      'UPDATE users SET ai_quota = ai_quota - 1 WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: '使用成功',
      data: {
        remainingQuota: req.user.ai_quota - 1
      }
    });
  } catch (error) {
    console.error('使用AI次数失败:', error);
    res.status(500).json({
      success: false,
      message: '操作失败'
    });
  }
}

module.exports = {
  getProfile,
  updateProfile,
  upgradeToVIP,
  useAIQuota
};
