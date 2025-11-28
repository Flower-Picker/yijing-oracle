import apiClient from '../config/api';

// ==================== 认证相关API ====================

/**
 * 发送验证码
 */
export const sendVerificationCode = (type, target, purpose = 'register') => {
  return apiClient.post('/auth/send-code', { type, target, purpose });
};

/**
 * 邮箱注册
 */
export const registerByEmail = (email, password, username) => {
  return apiClient.post('/auth/register/email', { email, password, username });
};

/**
 * 邮箱登录
 */
export const loginByEmail = (email, password) => {
  return apiClient.post('/auth/login/email', { email, password });
};

/**
 * 手机号注册
 */
export const registerByPhone = (phone, code, password, username) => {
  return apiClient.post('/auth/register/phone', { phone, code, password, username });
};

/**
 * 手机号登录
 */
export const loginByPhone = (phone, code) => {
  return apiClient.post('/auth/login/phone', { phone, code });
};

/**
 * 获取微信登录二维码
 */
export const getWeChatQRCode = () => {
  return apiClient.get('/auth/wechat/qrcode');
};

/**
 * 微信登录回调
 */
export const wechatLoginCallback = (code) => {
  return apiClient.post('/auth/wechat/callback', { code });
};

// ==================== 用户相关API ====================

/**
 * 获取用户信息
 */
export const getUserProfile = () => {
  return apiClient.get('/user/profile');
};

/**
 * 更新用户信息
 */
export const updateUserProfile = (username) => {
  return apiClient.put('/user/profile', { username });
};

/**
 * 升级VIP
 */
export const upgradeToVIP = () => {
  return apiClient.post('/user/upgrade-vip');
};

/**
 * 使用AI解卦次数
 */
export const useAIQuota = () => {
  return apiClient.post('/user/use-ai-quota');
};

// ==================== 起卦相关API ====================

/**
 * 保存起卦记录
 */
export const saveDivination = (question, hexagram, lines, aiInterpretation) => {
  return apiClient.post('/divination/save', {
    question,
    hexagram,
    lines,
    aiInterpretation
  });
};

/**
 * 获取起卦历史
 */
export const getDivinationHistory = (page = 1, limit = 10) => {
  return apiClient.get('/divination/history', { params: { page, limit } });
};

/**
 * 删除起卦记录
 */
export const deleteDivinationRecord = (id) => {
  return apiClient.delete(`/divination/record/${id}`);
};
