import { useState } from 'react';
import { generateHexagram, getLineSymbol } from '../utils/divination';
import { findHexagram, getChangingHexagram } from '../data/hexagrams';
import HexagramDisplay from './HexagramDisplay';
import AIInterpretation from './AIInterpretation';
import { useAuth } from '../contexts/AuthContext';
import './DivinationPanel.css';

export default function DivinationPanel() {
  const [question, setQuestion] = useState('');
  const [throwing, setThrowing] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [lines, setLines] = useState([]);
  const [hexagram, setHexagram] = useState(null);
  const [changingHexagram, setChangingHexagram] = useState(null);
  const { incrementDivination } = useAuth();

  const startDivination = () => {
    if (throwing) return;

    setThrowing(true);
    setCurrentLine(0);
    setLines([]);
    setHexagram(null);
    setChangingHexagram(null);

    // 模拟投掷过程
    throwNextLine(0, []);
  };

  const throwNextLine = (lineIndex, previousLines) => {
    if (lineIndex >= 6) {
      // 所有爻都投掷完成
      setThrowing(false);
      const mainHexagram = findHexagram(previousLines);
      const changeHexagram = getChangingHexagram(previousLines);

      setHexagram(mainHexagram);
      setChangingHexagram(changeHexagram);
      incrementDivination();
      return;
    }

    setTimeout(() => {
      const newLines = generateHexagram();
      const currentLines = newLines.slice(0, lineIndex + 1);

      setLines(currentLines);
      setCurrentLine(lineIndex + 1);

      throwNextLine(lineIndex + 1, newLines);
    }, 800);
  };

  const reset = () => {
    setQuestion('');
    setThrowing(false);
    setCurrentLine(0);
    setLines([]);
    setHexagram(null);
    setChangingHexagram(null);
  };

  return (
    <div className="divination-panel">
      <div className="question-section card fade-in">
        <h2 className="gold-title">诚心求卦</h2>
        <p className="hint">心诚则灵，请静心思考您的问题</p>

        <textarea
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="请输入您想要占卜的问题（可选）&#10;例如：事业发展、感情婚姻、投资决策等"
          disabled={throwing || hexagram}
          rows={4}
        />

        <div className="action-buttons">
          {!hexagram ? (
            <button
              className="btn-primary throw-btn"
              onClick={startDivination}
              disabled={throwing}
            >
              {throwing ? '投掷中...' : '🪙 开始起卦'}
            </button>
          ) : (
            <button className="btn-secondary" onClick={reset}>
              🔄 重新起卦
            </button>
          )}
        </div>
      </div>

      {(lines.length > 0 || hexagram) && (
        <div className="throwing-section card fade-in">
          <h3 className="gold-title">六爻演卦</h3>

          <div className="lines-display">
            {[...Array(6)].map((_, index) => {
              const line = lines[5 - index]; // 从下往上显示
              const lineNum = 5 - index;

              return (
                <div
                  key={index}
                  className={`line-item ${
                    line ? 'visible' : 'hidden'
                  } ${currentLine === lineNum + 1 ? 'current' : ''}`}
                >
                  <span className="line-position">
                    {['上', '五', '四', '三', '二', '初'][index]}爻
                  </span>
                  <span className="line-symbol">
                    {line ? getLineSymbol(line.value) : '━ ━'}
                  </span>
                  <span className="line-type">
                    {line?.type || ''}
                  </span>
                </div>
              );
            })}
          </div>

          {throwing && (
            <div className="throwing-indicator pulse-gold">
              正在投掷第 {currentLine + 1} 爻...
            </div>
          )}
        </div>
      )}

      {hexagram && (
        <>
          <HexagramDisplay
            hexagram={hexagram}
            changingHexagram={changingHexagram}
            lines={lines}
          />

          <AIInterpretation
            hexagram={hexagram}
            changingHexagram={changingHexagram}
            lines={lines}
            question={question}
          />
        </>
      )}
    </div>
  );
}
