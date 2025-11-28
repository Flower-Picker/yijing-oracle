const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

// 发送验证码
router.post('/send-code', authController.sendCode);

// 邮箱注册
router.post('/register/email', authController.registerByEmail);

// 邮箱登录
router.post('/login/email', authController.loginByEmail);

// 手机号注册
router.post('/register/phone', authController.registerByPhone);

// 手机号登录（验证码）
router.post('/login/phone', authController.loginByPhone);

// 获取微信登录二维码
router.get('/wechat/qrcode', authController.getWeChatQRCode);

// 微信登录回调
router.post('/wechat/callback', authController.wechatCallback);

module.exports = router;
