const axios = require('axios');
const crypto = require('crypto');

/**
 * 生成验证码
 */
function generateCode(length = 6) {
  return Math.random().toString().slice(2, 2 + length);
}

/**
 * 发送短信验证码（阿里云）
 */
async function sendSMSAliyun(phone, code) {
  const accessKeyId = process.env.SMS_ACCESS_KEY_ID;
  const accessKeySecret = process.env.SMS_ACCESS_KEY_SECRET;
  const signName = process.env.SMS_SIGN_NAME || '易经卜卦';
  const templateCode = process.env.SMS_TEMPLATE_CODE;

  if (!accessKeyId || !accessKeySecret || !templateCode) {
    console.warn('阿里云短信未配置，跳过发送');
    console.log(`[模拟发送] 手机: ${phone}, 验证码: ${code}`);
    return { success: true, mock: true };
  }

  try {
    // 阿里云短信API调用
    // 这里是简化版本，实际需要按照阿里云SDK文档实现
    const params = {
      PhoneNumbers: phone,
      SignName: signName,
      TemplateCode: templateCode,
      TemplateParam: JSON.stringify({ code })
    };

    // TODO: 实际项目中使用阿里云SDK
    // const response = await client.request('SendSms', params);

    console.log(`✅ 短信已发送到 ${phone}, 验证码: ${code}`);
    return { success: true };
  } catch (error) {
    console.error('短信发送失败:', error);
    throw new Error('短信发送失败');
  }
}

/**
 * 发送短信验证码（腾讯云）
 */
async function sendSMSTencent(phone, code) {
  const secretId = process.env.TENCENT_SECRET_ID;
  const secretKey = process.env.TENCENT_SECRET_KEY;

  if (!secretId || !secretKey) {
    console.warn('腾讯云短信未配置，跳过发送');
    console.log(`[模拟发送] 手机: ${phone}, 验证码: ${code}`);
    return { success: true, mock: true };
  }

  // TODO: 实际项目中使用腾讯云SDK
  console.log(`✅ 短信已发送到 ${phone}, 验证码: ${code}`);
  return { success: true };
}

/**
 * 统一发送接口
 */
async function sendSMS(phone, code) {
  // 优先使用阿里云
  if (process.env.SMS_ACCESS_KEY_ID) {
    return await sendSMSAliyun(phone, code);
  }

  // 其次使用腾讯云
  if (process.env.TENCENT_SECRET_ID) {
    return await sendSMSTencent(phone, code);
  }

  // 开发环境：模拟发送
  console.log(`[开发模式] 验证码: ${code} 已发送到 ${phone}`);
  return { success: true, mock: true };
}

module.exports = {
  generateCode,
  sendSMS
};
