import { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const USER_TYPES = {
  GUEST: 'guest',
  REGISTERED: 'registered',
  VIP: 'vip'
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 从localStorage加载用户信息
    const savedUser = localStorage.getItem('yijing_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    } else {
      // 默认为游客
      setUser({
        type: USER_TYPES.GUEST,
        username: '游客',
        divinationCount: 0,
        aiQuota: 0
      });
    }
    setLoading(false);
  }, []);

  const login = (username, password) => {
    // 简单的模拟登录（实际应该连接后端）
    const newUser = {
      type: USER_TYPES.REGISTERED,
      username,
      divinationCount: 0,
      aiQuota: 3, // 注册用户有3次AI解卦
      loginTime: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('yijing_user', JSON.stringify(newUser));
    return true;
  };

  const register = (username, password) => {
    // 模拟注册
    const newUser = {
      type: USER_TYPES.REGISTERED,
      username,
      divinationCount: 0,
      aiQuota: 3,
      registerTime: new Date().toISOString()
    };
    setUser(newUser);
    localStorage.setItem('yijing_user', JSON.stringify(newUser));
    return true;
  };

  const upgradeToVIP = () => {
    const vipUser = {
      ...user,
      type: USER_TYPES.VIP,
      aiQuota: 999, // VIP用户有大量AI解卦次数
      vipExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString()
    };
    setUser(vipUser);
    localStorage.setItem('yijing_user', JSON.stringify(vipUser));
  };

  const logout = () => {
    const guestUser = {
      type: USER_TYPES.GUEST,
      username: '游客',
      divinationCount: 0,
      aiQuota: 0
    };
    setUser(guestUser);
    localStorage.setItem('yijing_user', JSON.stringify(guestUser));
  };

  const incrementDivination = () => {
    const updatedUser = {
      ...user,
      divinationCount: user.divinationCount + 1
    };
    setUser(updatedUser);
    localStorage.setItem('yijing_user', JSON.stringify(updatedUser));
  };

  const useAIQuota = () => {
    if (user.aiQuota > 0) {
      const updatedUser = {
        ...user,
        aiQuota: user.aiQuota - 1
      };
      setUser(updatedUser);
      localStorage.setItem('yijing_user', JSON.stringify(updatedUser));
      return true;
    }
    return false;
  };

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    upgradeToVIP,
    incrementDivination,
    useAIQuota,
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
