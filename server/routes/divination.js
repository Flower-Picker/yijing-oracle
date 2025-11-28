const express = require('express');
const router = express.Router();
const divinationController = require('../controllers/divinationController');
const { authenticate } = require('../middleware/auth');

// 所有起卦路由都需要认证
router.use(authenticate);

// 保存起卦记录
router.post('/save', divinationController.saveDivination);

// 获取起卦历史
router.get('/history', divinationController.getHistory);

// 删除起卦记录
router.delete('/record/:id', divinationController.deleteRecord);

module.exports = router;
