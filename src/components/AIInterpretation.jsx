import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getAIInterpretation } from '../services/aiInterpretation';
import { getChangingPositions } from '../utils/divination';
import './AIInterpretation.css';

export default function AIInterpretation({ hexagram, changingHexagram, lines, question }) {
  const [loading, setLoading] = useState(false);
  const [interpretation, setInterpretation] = useState('');
  const [error, setError] = useState('');
  const { user, useAIQuota, isGuest, upgradeToVIP } = useAuth();

  const handleGetInterpretation = async () => {
    if (isGuest) {
      setError('请先登录或注册以使用AI解卦功能');
      return;
    }

    if (user.aiQuota <= 0) {
      setError('AI解卦次数已用完，升级VIP享受无限次数！');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const changingLines = getChangingPositions(lines);
      const result = await getAIInterpretation(
        hexagram,
        changingHexagram,
        changingLines,
        question
      );

      setInterpretation(result);
      useAIQuota();
    } catch (err) {
      setError(err.message || 'AI解卦失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-interpretation card fade-in">
      <div className="ai-header">
        <h3 className="gold-title">🤖 AI智能解卦</h3>
        <p className="ai-description">
          运用现代AI技术，结合传统易经智慧，为您提供深度解读
        </p>
      </div>

      {!interpretation ? (
        <div className="ai-prompt">
          {isGuest ? (
            <>
              <div className="info-box guest-info">
                <p>⚠️ 您当前是游客身份</p>
                <p>请登录或注册后使用AI解卦功能</p>
              </div>
            </>
          ) : (
            <>
              <div className="quota-info">
                <span>剩余次数：</span>
                <span className="quota-number">{user.aiQuota}</span>
              </div>

              {user.aiQuota <= 0 && (
                <div className="info-box upgrade-info">
                  <p>💎 AI解卦次数已用完</p>
                  <button className="btn-primary" onClick={upgradeToVIP}>
                    升级VIP享受无限次数
                  </button>
                </div>
              )}
            </>
          )}

          {error && (
            <div className="error-box">
              {error}
            </div>
          )}

          <button
            className="btn-primary get-ai-btn"
            onClick={handleGetInterpretation}
            disabled={loading || isGuest || user?.aiQuota <= 0}
          >
            {loading ? (
              <>
                <span className="spinner"></span>
                AI解卦中...
              </>
            ) : (
              '✨ 获取AI解卦'
            )}
          </button>
        </div>
      ) : (
        <div className="ai-result">
          <div className="result-content">
            {interpretation.split('\n').map((line, index) => {
              if (line.startsWith('###')) {
                return (
                  <h4 key={index} className="result-subtitle">
                    {line.replace(/###/g, '').trim()}
                  </h4>
                );
              } else if (line.startsWith('##')) {
                return (
                  <h3 key={index} className="result-title gold-title">
                    {line.replace(/##/g, '').trim()}
                  </h3>
                );
              } else if (line.trim() === '---') {
                return <hr key={index} className="divider" />;
              } else if (line.trim()) {
                return (
                  <p key={index} className="result-text">
                    {line}
                  </p>
                );
              }
              return null;
            })}
          </div>

          <div className="result-footer">
            <p className="disclaimer">
              * AI解卦仅供参考，具体决策请结合实际情况综合判断
            </p>

            {!isGuest && user.aiQuota <= 0 && (
              <div className="upgrade-prompt">
                <div className="info-box upgrade-info">
                  <p>💎 AI解卦次数已用完</p>
                  <p>升级VIP享受无限次数，继续获得AI智慧指引</p>
                  <button className="btn-primary" onClick={upgradeToVIP}>
                    立即升级VIP
                  </button>
                </div>
              </div>
            )}

            {!isGuest && user.aiQuota > 0 && user.aiQuota <= 3 && (
              <div className="quota-reminder">
                <p>💡 您还有 <strong>{user.aiQuota}</strong> 次AI解卦机会</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
