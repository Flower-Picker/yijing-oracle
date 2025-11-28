import { createContext, useContext, useState, useEffect } from 'react';
import * as api from '../services/api';

const AuthContext = createContext();

export const USER_TYPES = {
  GUEST: 'guest',
  REGISTERED: 'registered',
  VIP: 'vip'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 初始化：从token恢复用户信息
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('yijing_token');

      if (token) {
        try {
          // 通过token获取用户信息
          const response = await api.getUserProfile();
          if (response.success) {
            setUser(transformUserData(response.data));
          }
        } catch (error) {
          console.error('获取用户信息失败:', error);
          // Token无效，清除并设为游客
          localStorage.removeItem('yijing_token');
          setUser(createGuestUser());
        }
      } else {
        setUser(createGuestUser());
      }

      setLoading(false);
    };

    initAuth();
  }, []);

  // 创建游客用户
  const createGuestUser = () => ({
    type: USER_TYPES.GUEST,
    username: '游客',
    divinationCount: 0,
    aiQuota: 0
  });

  // 转换后端用户数据格式
  const transformUserData = (data) => ({
    id: data.id,
    type: data.userType,
    username: data.username,
    email: data.email,
    phone: data.phone,
    aiQuota: data.aiQuota,
    divinationCount: data.divinationCount || 0,
    vipExpiry: data.vipExpireAt
  });

  // 保存认证信息
  const saveAuth = (token, userData) => {
    localStorage.setItem('yijing_token', token);
    setUser(transformUserData(userData));
  };

  // 邮箱登录
  const loginByEmail = async (email, password) => {
    try {
      setError(null);
      const response = await api.loginByEmail(email, password);

      if (response.success) {
        saveAuth(response.data.token, response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 邮箱注册
  const registerByEmail = async (email, password, username) => {
    try {
      setError(null);
      const response = await api.registerByEmail(email, password, username);

      if (response.success) {
        saveAuth(response.data.token, response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 手机号登录
  const loginByPhone = async (phone, code) => {
    try {
      setError(null);
      const response = await api.loginByPhone(phone, code);

      if (response.success) {
        saveAuth(response.data.token, response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 手机号注册
  const registerByPhone = async (phone, code, password, username) => {
    try {
      setError(null);
      const response = await api.registerByPhone(phone, code, password, username);

      if (response.success) {
        saveAuth(response.data.token, response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 发送验证码
  const sendCode = async (type, target, purpose = 'register') => {
    try {
      setError(null);
      const response = await api.sendVerificationCode(type, target, purpose);
      return { success: response.success, message: response.message };
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 微信登录
  const loginByWeChat = async (code) => {
    try {
      setError(null);
      const response = await api.wechatLoginCallback(code);

      if (response.success) {
        saveAuth(response.data.token, response.data.user);
        return { success: true };
      }
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 升级VIP
  const upgradeToVIP = async () => {
    try {
      setError(null);
      const response = await api.upgradeToVIP();

      if (response.success) {
        setUser(prev => ({
          ...prev,
          type: USER_TYPES.VIP,
          aiQuota: response.data.aiQuota,
          vipExpiry: response.data.vipExpireAt
        }));
        return { success: true };
      }
    } catch (error) {
      setError(error);
      return { success: false, error };
    }
  };

  // 登出
  const logout = () => {
    localStorage.removeItem('yijing_token');
    setUser(createGuestUser());
  };

  // 增加起卦次数
  const incrementDivination = () => {
    setUser(prev => ({
      ...prev,
      divinationCount: (prev.divinationCount || 0) + 1
    }));
  };

  // 使用AI配额
  const useAIQuota = async () => {
    if (user.aiQuota <= 0) {
      return false;
    }

    try {
      const response = await api.useAIQuota();
      if (response.success) {
        setUser(prev => ({
          ...prev,
          aiQuota: response.data.remainingQuota
        }));
        return true;
      }
    } catch (error) {
      console.error('使用AI配额失败:', error);
      return false;
    }
  };

  // 刷新用户信息
  const refreshUser = async () => {
    try {
      const response = await api.getUserProfile();
      if (response.success) {
        setUser(transformUserData(response.data));
      }
    } catch (error) {
      console.error('刷新用户信息失败:', error);
    }
  };

  const value = {
    user,
    loading,
    error,
    loginByEmail,
    registerByEmail,
    loginByPhone,
    registerByPhone,
    sendCode,
    loginByWeChat,
    logout,
    upgradeToVIP,
    incrementDivination,
    useAIQuota,
    refreshUser,
    isGuest: user?.type === USER_TYPES.GUEST,
    isRegistered: user?.type === USER_TYPES.REGISTERED,
    isVIP: user?.type === USER_TYPES.VIP
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
