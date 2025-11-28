// 六爻铜钱法起卦逻辑

/**
 * 投掷三枚铜钱
 * 正面（数字面）= 3，背面（字面）= 2
 * 三个正面 = 9（老阳，会变）
 * 两个正面一个背面 = 8（少阴）
 * 两个背面一个正面 = 7（少阳）
 * 三个背面 = 6（老阴，会变）
 */
export function throwCoins() {
  const coins = Array.from({ length: 3 }, () => Math.random() > 0.5 ? 3 : 2);
  const sum = coins.reduce((a, b) => a + b, 0);
  return {
    coins,
    value: sum,
    isChanging: sum === 6 || sum === 9
  };
}

/**
 * 生成完整的六爻
 */
export function generateHexagram() {
  const lines = [];
  for (let i = 0; i < 6; i++) {
    const result = throwCoins();
    lines.push({
      position: i + 1,
      ...result,
      yinYang: result.value === 7 || result.value === 9 ? '阳' : '阴',
      type: getLineType(result.value)
    });
  }
  return lines;
}

/**
 * 获取爻的类型
 */
function getLineType(value) {
  switch (value) {
    case 6: return '老阴（变）';
    case 7: return '少阳';
    case 8: return '少阴';
    case 9: return '老阳（变）';
    default: return '';
  }
}

/**
 * 获取爻的符号
 */
export function getLineSymbol(value) {
  // 7和9是阳爻（实线），6和8是阴爻（虚线）
  return value === 7 || value === 9 ? '━━━' : '━ ━';
}

/**
 * 检查是否有变爻
 */
export function hasChangingLines(lines) {
  return lines.some(line => line.isChanging);
}

/**
 * 获取变爻位置
 */
export function getChangingPositions(lines) {
  return lines
    .filter(line => line.isChanging)
    .map(line => line.position);
}
