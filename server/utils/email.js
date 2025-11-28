const nodemailer = require('nodemailer');

/**
 * 创建邮件传输器
 */
function createTransporter() {
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER) {
    return null;
  }

  return nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT || 587,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD
    }
  });
}

/**
 * 发送验证码邮件
 */
async function sendVerificationEmail(email, code, purpose = 'register') {
  const transporter = createTransporter();

  if (!transporter) {
    console.warn('邮件服务未配置，跳过发送');
    console.log(`[模拟发送] 邮箱: ${email}, 验证码: ${code}`);
    return { success: true, mock: true };
  }

  const purposeText = {
    register: '注册',
    login: '登录',
    reset_password: '重置密码',
    bind: '绑定'
  };

  const mailOptions = {
    from: process.env.EMAIL_FROM || '易经卜卦 <noreply@yijing.com>',
    to: email,
    subject: `【易经卜卦】${purposeText[purpose] || '验证'}验证码`,
    html: `
      <div style="padding: 20px; background-color: #f5f5f5;">
        <div style="max-width: 600px; margin: 0 auto; background-color: white; padding: 30px; border-radius: 10px;">
          <h2 style="color: #d4af37; text-align: center;">易经卜卦</h2>
          <p>您好！</p>
          <p>您的${purposeText[purpose] || '验证'}验证码是：</p>
          <div style="text-align: center; margin: 30px 0;">
            <span style="font-size: 32px; font-weight: bold; color: #d4af37; letter-spacing: 5px;">${code}</span>
          </div>
          <p style="color: #666;">验证码有效期为10分钟，请勿泄露给他人。</p>
          <p style="color: #999; font-size: 12px; margin-top: 30px;">
            如果这不是您的操作，请忽略此邮件。
          </p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ 验证码邮件已发送到 ${email}`);
    return { success: true };
  } catch (error) {
    console.error('邮件发送失败:', error);
    throw new Error('邮件发送失败');
  }
}

module.exports = {
  sendVerificationEmail
};
