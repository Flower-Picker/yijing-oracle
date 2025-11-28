const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { authenticate } = require('../middleware/auth');

// 所有用户路由都需要认证
router.use(authenticate);

// 获取用户信息
router.get('/profile', userController.getProfile);

// 更新用户信息
router.put('/profile', userController.updateProfile);

// 升级VIP
router.post('/upgrade-vip', userController.upgradeToVIP);

// 使用AI次数
router.post('/use-ai-quota', userController.useAIQuota);

module.exports = router;
