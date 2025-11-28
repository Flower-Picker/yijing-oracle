const bcrypt = require('bcryptjs');
const { pool } = require('../config/database');
const { generateToken } = require('../utils/jwt');
const { generateCode, sendSMS } = require('../utils/sms');
const { sendVerificationEmail } = require('../utils/email');
const { wechatLogin, getQRCodeURL } = require('../utils/wechat');

/**
 * 发送验证码
 */
async function sendCode(req, res) {
  try {
    const { type, target, purpose } = req.body;

    if (!type || !target) {
      return res.status(400).json({
        success: false,
        message: '参数不完整'
      });
    }

    // 生成6位验证码
    const code = generateCode(6);

    // 设置过期时间（10分钟后）
    const expireAt = new Date(Date.now() + 10 * 60 * 1000);

    // 保存验证码到数据库
    await pool.query(
      'INSERT INTO verification_codes (type, target, code, purpose, expire_at) VALUES (?, ?, ?, ?, ?)',
      [type, target, code, purpose || 'register', expireAt]
    );

    // 发送验证码
    if (type === 'phone') {
      await sendSMS(target, code);
    } else if (type === 'email') {
      await sendVerificationEmail(target, code, purpose);
    }

    res.json({
      success: true,
      message: '验证码已发送'
    });
  } catch (error) {
    console.error('发送验证码失败:', error);
    res.status(500).json({
      success: false,
      message: '发送验证码失败'
    });
  }
}

/**
 * 验证验证码
 */
async function verifyCode(target, code, purpose = 'register') {
  const [codes] = await pool.query(
    'SELECT * FROM verification_codes WHERE target = ? AND code = ? AND purpose = ? AND used = FALSE AND expire_at > NOW() ORDER BY created_at DESC LIMIT 1',
    [target, code, purpose]
  );

  if (codes.length === 0) {
    return false;
  }

  // 标记为已使用
  await pool.query(
    'UPDATE verification_codes SET used = TRUE, used_at = NOW() WHERE id = ?',
    [codes[0].id]
  );

  return true;
}

/**
 * 邮箱注册
 */
async function registerByEmail(req, res) {
  try {
    const { email, password, username } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空'
      });
    }

    // 检查邮箱是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该邮箱已被注册'
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.query(
      'INSERT INTO users (email, password_hash, username, user_type, ai_quota) VALUES (?, ?, ?, ?, ?)',
      [email, passwordHash, username || email.split('@')[0], 'registered', 3]
    );

    const userId = result.insertId;

    // 生成token
    const token = generateToken({ userId, email });

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: userId,
          email,
          username: username || email.split('@')[0],
          userType: 'registered',
          aiQuota: 3
        }
      }
    });
  } catch (error) {
    console.error('邮箱注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
}

/**
 * 邮箱登录
 */
async function loginByEmail(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: '邮箱和密码不能为空'
      });
    }

    // 查询用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    const user = users[0];

    // 验证密码
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({
        success: false,
        message: '邮箱或密码错误'
      });
    }

    // 更新最后登录时间
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 生成token
    const token = generateToken({ userId: user.id, email: user.email });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          email: user.email,
          username: user.username,
          userType: user.user_type,
          aiQuota: user.ai_quota,
          vipExpireAt: user.vip_expire_at
        }
      }
    });
  } catch (error) {
    console.error('邮箱登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
}

/**
 * 手机号注册
 */
async function registerByPhone(req, res) {
  try {
    const { phone, code, password, username } = req.body;

    if (!phone || !code || !password) {
      return res.status(400).json({
        success: false,
        message: '手机号、验证码和密码不能为空'
      });
    }

    // 验证验证码
    const isCodeValid = await verifyCode(phone, code, 'register');

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    // 检查手机号是否已存在
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE phone = ?',
      [phone]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: '该手机号已被注册'
      });
    }

    // 加密密码
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const [result] = await pool.query(
      'INSERT INTO users (phone, password_hash, username, user_type, ai_quota, phone_verified) VALUES (?, ?, ?, ?, ?, ?)',
      [phone, passwordHash, username || `用户${phone.slice(-4)}`, 'registered', 3, true]
    );

    const userId = result.insertId;

    // 生成token
    const token = generateToken({ userId, phone });

    res.json({
      success: true,
      message: '注册成功',
      data: {
        token,
        user: {
          id: userId,
          phone,
          username: username || `用户${phone.slice(-4)}`,
          userType: 'registered',
          aiQuota: 3
        }
      }
    });
  } catch (error) {
    console.error('手机号注册失败:', error);
    res.status(500).json({
      success: false,
      message: '注册失败'
    });
  }
}

/**
 * 手机号登录
 */
async function loginByPhone(req, res) {
  try {
    const { phone, code } = req.body;

    if (!phone || !code) {
      return res.status(400).json({
        success: false,
        message: '手机号和验证码不能为空'
      });
    }

    // 验证验证码
    const isCodeValid = await verifyCode(phone, code, 'login');

    if (!isCodeValid) {
      return res.status(400).json({
        success: false,
        message: '验证码无效或已过期'
      });
    }

    // 查询用户
    const [users] = await pool.query(
      'SELECT * FROM users WHERE phone = ?',
      [phone]
    );

    if (users.length === 0) {
      return res.status(401).json({
        success: false,
        message: '该手机号未注册'
      });
    }

    const user = users[0];

    // 更新最后登录时间
    await pool.query(
      'UPDATE users SET last_login_at = NOW() WHERE id = ?',
      [user.id]
    );

    // 生成token
    const token = generateToken({ userId: user.id, phone: user.phone });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          phone: user.phone,
          username: user.username,
          userType: user.user_type,
          aiQuota: user.ai_quota,
          vipExpireAt: user.vip_expire_at
        }
      }
    });
  } catch (error) {
    console.error('手机号登录失败:', error);
    res.status(500).json({
      success: false,
      message: '登录失败'
    });
  }
}

/**
 * 获取微信登录二维码
 */
function getWeChatQRCode(req, res) {
  try {
    const qrcodeUrl = getQRCodeURL();

    res.json({
      success: true,
      data: {
        qrcodeUrl
      }
    });
  } catch (error) {
    console.error('获取微信二维码失败:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
}

/**
 * 微信登录回调
 */
async function wechatCallback(req, res) {
  try {
    const { code } = req.body;

    if (!code) {
      return res.status(400).json({
        success: false,
        message: '缺少授权code'
      });
    }

    // 获取微信用户信息
    const wechatUser = await wechatLogin(code);

    // 查询是否已存在该微信用户
    let [users] = await pool.query(
      'SELECT * FROM users WHERE wechat_openid = ?',
      [wechatUser.openid]
    );

    let user;

    if (users.length === 0) {
      // 创建新用户
      const [result] = await pool.query(
        'INSERT INTO users (wechat_openid, wechat_unionid, username, user_type, ai_quota) VALUES (?, ?, ?, ?, ?)',
        [wechatUser.openid, wechatUser.unionid, wechatUser.nickname, 'registered', 3]
      );

      user = {
        id: result.insertId,
        username: wechatUser.nickname,
        user_type: 'registered',
        ai_quota: 3
      };
    } else {
      user = users[0];

      // 更新最后登录时间
      await pool.query(
        'UPDATE users SET last_login_at = NOW() WHERE id = ?',
        [user.id]
      );
    }

    // 生成token
    const token = generateToken({ userId: user.id, openid: wechatUser.openid });

    res.json({
      success: true,
      message: '登录成功',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          userType: user.user_type,
          aiQuota: user.ai_quota,
          vipExpireAt: user.vip_expire_at
        }
      }
    });
  } catch (error) {
    console.error('微信登录失败:', error);
    res.status(500).json({
      success: false,
      message: error.message || '微信登录失败'
    });
  }
}

module.exports = {
  sendCode,
  registerByEmail,
  loginByEmail,
  registerByPhone,
  loginByPhone,
  getWeChatQRCode,
  wechatCallback
};
