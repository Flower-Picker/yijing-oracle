const axios = require('axios');

const WECHAT_APP_ID = process.env.WECHAT_APP_ID;
const WECHAT_APP_SECRET = process.env.WECHAT_APP_SECRET;
const WECHAT_REDIRECT_URI = process.env.WECHAT_REDIRECT_URI;

/**
 * 生成微信登录二维码URL
 */
function getQRCodeURL(state = 'STATE') {
  if (!WECHAT_APP_ID) {
    throw new Error('微信AppID未配置');
  }

  const params = new URLSearchParams({
    appid: WECHAT_APP_ID,
    redirect_uri: encodeURIComponent(WECHAT_REDIRECT_URI),
    response_type: 'code',
    scope: 'snsapi_login',
    state: state
  });

  return `https://open.weixin.qq.com/connect/qrconnect?${params.toString()}#wechat_redirect`;
}

/**
 * 通过code获取access_token
 */
async function getAccessToken(code) {
  if (!WECHAT_APP_ID || !WECHAT_APP_SECRET) {
    throw new Error('微信配置未完成');
  }

  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/oauth2/access_token', {
      params: {
        appid: WECHAT_APP_ID,
        secret: WECHAT_APP_SECRET,
        code: code,
        grant_type: 'authorization_code'
      }
    });

    if (response.data.errcode) {
      throw new Error(response.data.errmsg || '获取access_token失败');
    }

    return response.data;
  } catch (error) {
    console.error('获取微信access_token失败:', error);
    throw new Error('微信登录失败');
  }
}

/**
 * 获取用户信息
 */
async function getUserInfo(accessToken, openid) {
  try {
    const response = await axios.get('https://api.weixin.qq.com/sns/userinfo', {
      params: {
        access_token: accessToken,
        openid: openid
      }
    });

    if (response.data.errcode) {
      throw new Error(response.data.errmsg || '获取用户信息失败');
    }

    return response.data;
  } catch (error) {
    console.error('获取微信用户信息失败:', error);
    throw new Error('获取用户信息失败');
  }
}

/**
 * 完整的微信登录流程
 */
async function wechatLogin(code) {
  // 1. 获取access_token
  const tokenData = await getAccessToken(code);
  const { access_token, openid, unionid } = tokenData;

  // 2. 获取用户信息
  const userInfo = await getUserInfo(access_token, openid);

  return {
    openid,
    unionid,
    nickname: userInfo.nickname,
    avatar: userInfo.headimgurl,
    sex: userInfo.sex,
    province: userInfo.province,
    city: userInfo.city
  };
}

module.exports = {
  getQRCodeURL,
  wechatLogin
};
