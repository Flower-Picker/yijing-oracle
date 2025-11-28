import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const [mode, setMode] = useState('login'); // 'login' | 'register'
  const [loginType, setLoginType] = useState('email'); // 'email' | 'phone' | 'wechat'

  // 表单字段
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');

  // 状态
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [countdown, setCountdown] = useState(0);

  const { loginByEmail, registerByEmail, loginByPhone, registerByPhone, sendCode } = useAuth();

  // 发送验证码
  const handleSendCode = async () => {
    const target = loginType === 'email' ? email : phone;

    if (!target) {
      setError(`请输入${loginType === 'email' ? '邮箱' : '手机号'}`);
      return;
    }

    // 验证格式
    if (loginType === 'email' && !email.includes('@')) {
      setError('邮箱格式不正确');
      return;
    }

    if (loginType === 'phone' && !/^1\d{10}$/.test(phone)) {
      setError('手机号格式不正确');
      return;
    }

    setLoading(true);
    setError('');

    const result = await sendCode(loginType, target, mode);

    if (result.success) {
      setCodeSent(true);
      setCountdown(60);

      // 倒计时
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            setCodeSent(false);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      setError(result.error || '发送失败');
    }

    setLoading(false);
  };

  // 提交表单
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      let result;

      if (loginType === 'email') {
        if (!email || !password) {
          setError('请输入邮箱和密码');
          setLoading(false);
          return;
        }

        if (password.length < 6) {
          setError('密码至少6个字符');
          setLoading(false);
          return;
        }

        if (mode === 'login') {
          result = await loginByEmail(email, password);
        } else {
          result = await registerByEmail(email, password, username);
        }
      } else if (loginType === 'phone') {
        if (!phone || !code) {
          setError('请输入手机号和验证码');
          setLoading(false);
          return;
        }

        if (mode === 'login') {
          result = await loginByPhone(phone, code);
        } else {
          if (!password || password.length < 6) {
            setError('请输入至少6位密码');
            setLoading(false);
            return;
          }
          result = await registerByPhone(phone, code, password, username);
        }
      }

      if (result && result.success) {
        onClose();
      } else {
        setError(result?.error || '操作失败');
      }
    } catch (err) {
      setError('操作失败，请重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2 className="gold-title">{mode === 'login' ? '登录' : '注册'}</h2>

        {/* 登录方式选择 */}
        <div className="login-type-tabs">
          <button
            className={`tab ${loginType === 'email' ? 'active' : ''}`}
            onClick={() => setLoginType('email')}
          >
            邮箱
          </button>
          <button
            className={`tab ${loginType === 'phone' ? 'active' : ''}`}
            onClick={() => setLoginType('phone')}
          >
            手机号
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* 邮箱登录/注册 */}
          {loginType === 'email' && (
            <>
              <div className="form-group">
                <label>邮箱</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  autoFocus
                />
              </div>

              <div className="form-group">
                <label>密码</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码（至少6位）"
                />
              </div>

              {mode === 'register' && (
                <div className="form-group">
                  <label>用户名（可选）</label>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="不填写则使用邮箱前缀"
                  />
                </div>
              )}
            </>
          )}

          {/* 手机号登录/注册 */}
          {loginType === 'phone' && (
            <>
              <div className="form-group">
                <label>手机号</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="请输入手机号"
                  maxLength={11}
                  autoFocus
                />
              </div>

              <div className="form-group code-group">
                <label>验证码</label>
                <div className="code-input-wrapper">
                  <input
                    type="text"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="请输入验证码"
                    maxLength={6}
                  />
                  <button
                    type="button"
                    className="send-code-btn"
                    onClick={handleSendCode}
                    disabled={codeSent || loading}
                  >
                    {countdown > 0 ? `${countdown}秒后重试` : '发送验证码'}
                  </button>
                </div>
              </div>

              {mode === 'register' && (
                <>
                  <div className="form-group">
                    <label>密码</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="请输入密码（至少6位）"
                    />
                  </div>

                  <div className="form-group">
                    <label>用户名（可选）</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="不填写则自动生成"
                    />
                  </div>
                </>
              )}
            </>
          )}

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary submit-btn" disabled={loading}>
            {loading ? '处理中...' : (mode === 'login' ? '登录' : '注册')}
          </button>

          <div className="switch-mode">
            {mode === 'login' ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setMode(mode === 'login' ? 'register' : 'login');
                setError('');
              }}
            >
              {mode === 'login' ? '立即注册' : '去登录'}
            </button>
          </div>

          <div className="info-text">
            <p>💡 注册用户免费获得3次AI解卦</p>
            <p>✨ VIP用户享受无限次AI解卦</p>
          </div>
        </form>
      </div>
    </div>
  );
}
