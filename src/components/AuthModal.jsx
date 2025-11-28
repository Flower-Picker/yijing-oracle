import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './AuthModal.css';

export default function AuthModal({ onClose }) {
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, register } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
      setError('请输入用户名和密码');
      return;
    }

    if (password.length < 6) {
      setError('密码至少6个字符');
      return;
    }

    try {
      if (isLogin) {
        login(username, password);
      } else {
        register(username, password);
      }
      onClose();
    } catch (err) {
      setError('操作失败，请重试');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>

        <h2 className="gold-title">{isLogin ? '登录' : '注册'}</h2>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="请输入用户名"
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

          {error && <div className="error-message">{error}</div>}

          <button type="submit" className="btn-primary submit-btn">
            {isLogin ? '登录' : '注册'}
          </button>

          <div className="switch-mode">
            {isLogin ? '还没有账号？' : '已有账号？'}
            <button
              type="button"
              className="link-button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
            >
              {isLogin ? '立即注册' : '去登录'}
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
