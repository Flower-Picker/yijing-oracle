// 快速创建测试账号的脚本
// 在浏览器控制台（F12 → Console）中运行以下代码

// 创建注册用户（有3次AI解卦）
function createTestUser() {
  const testUser = {
    type: 'registered',
    username: '测试用户',
    divinationCount: 5,
    aiQuota: 3,
    registerTime: new Date().toISOString()
  };
  localStorage.setItem('yijing_user', JSON.stringify(testUser));
  console.log('✅ 测试用户已创建！刷新页面查看效果');
  console.log('用户信息：', testUser);
}

// 创建VIP用户（无限AI解卦）
function createVIPUser() {
  const vipUser = {
    type: 'vip',
    username: 'VIP会员',
    divinationCount: 10,
    aiQuota: 999,
    vipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    registerTime: new Date().toISOString()
  };
  localStorage.setItem('yijing_user', JSON.stringify(vipUser));
  console.log('✅ VIP用户已创建！刷新页面查看效果');
  console.log('用户信息：', vipUser);
}

// 重置为游客
function resetToGuest() {
  const guestUser = {
    type: 'guest',
    username: '游客',
    divinationCount: 0,
    aiQuota: 0
  };
  localStorage.setItem('yijing_user', JSON.stringify(guestUser));
  console.log('✅ 已重置为游客！刷新页面查看效果');
}

// 使用说明
console.log(`
🧪 测试账号快速创建工具

在控制台运行以下命令：

1. 创建普通注册用户（3次AI解卦）：
   createTestUser()

2. 创建VIP用户（无限AI解卦）：
   createVIPUser()

3. 重置为游客：
   resetToGuest()
`);
