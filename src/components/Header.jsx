import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import AuthModal from './AuthModal';
import './Header.css';

export default function Header() {
  const { user, logout, isGuest, isVIP } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);

  return (
    <>
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-symbol">☯</span>
            <h1 className="gold-title">易经卜卦</h1>
          </div>

          <div className="user-section">
            <div className="user-info">
              <span className="username">{user?.username}</span>
              {isVIP && <span className="vip-badge">VIP</span>}
              {!isGuest && (
                <span className="ai-quota">AI剩余: {user?.aiQuota}</span>
              )}
            </div>

            <div className="auth-buttons">
              {isGuest ? (
                <button
                  className="btn-primary"
                  onClick={() => setShowAuthModal(true)}
                >
                  登录/注册
                </button>
              ) : (
                <button
                  className="btn-secondary"
                  onClick={logout}
                >
                  退出
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {showAuthModal && (
        <AuthModal onClose={() => setShowAuthModal(false)} />
      )}
    </>
  );
}
