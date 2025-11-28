import { getChangingPositions } from '../utils/divination';
import './HexagramDisplay.css';

export default function HexagramDisplay({ hexagram, changingHexagram, lines }) {
  const changingLines = getChangingPositions(lines);
  const hasChanging = changingLines.length > 0;

  return (
    <div className="hexagram-display card fade-in">
      <h3 className="gold-title section-title">卦象解读</h3>

      <div className="hexagrams-container">
        <div className="hexagram-card main-hexagram">
          <div className="hexagram-header">
            <h4 className="gold-title">本卦</h4>
            <span className="hexagram-symbol">{hexagram.symbol}</span>
          </div>

          <div className="hexagram-info">
            <h5 className="hexagram-name">{hexagram.title}</h5>
            <p className="hexagram-number">第 {hexagram.number} 卦</p>
          </div>

          <div className="hexagram-details">
            <div className="detail-item">
              <span className="label">卦辞：</span>
              <span className="value">{hexagram.judgement}</span>
            </div>

            <div className="detail-item">
              <span className="label">象曰：</span>
              <span className="value">{hexagram.image}</span>
            </div>

            <div className="detail-item description">
              <span className="label">说明：</span>
              <span className="value">{hexagram.description}</span>
            </div>

            <div className="interpretation">
              <p>{hexagram.interpretation}</p>
            </div>
          </div>
        </div>

        {hasChanging && changingHexagram && (
          <>
            <div className="arrow-indicator">
              <span>→</span>
              <p className="changing-info">
                第 {changingLines.join('、')} 爻变
              </p>
            </div>

            <div className="hexagram-card changing-hexagram">
              <div className="hexagram-header">
                <h4 className="gold-title">变卦</h4>
                <span className="hexagram-symbol">{changingHexagram.symbol}</span>
              </div>

              <div className="hexagram-info">
                <h5 className="hexagram-name">{changingHexagram.title}</h5>
                <p className="hexagram-number">第 {changingHexagram.number} 卦</p>
              </div>

              <div className="hexagram-details">
                <div className="detail-item">
                  <span className="label">卦辞：</span>
                  <span className="value">{changingHexagram.judgement}</span>
                </div>

                <div className="detail-item description">
                  <span className="label">说明：</span>
                  <span className="value">{changingHexagram.description}</span>
                </div>

                <div className="interpretation">
                  <p>{changingHexagram.interpretation}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
