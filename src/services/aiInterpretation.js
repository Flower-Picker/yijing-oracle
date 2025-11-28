// AI解卦服务
// 注意：实际使用时需要配置真实的API密钥

/**
 * 调用AI解卦
 * @param {Object} hexagram - 主卦
 * @param {Object} changingHexagram - 变卦（如果有）
 * @param {Array} changingLines - 变爻位置
 * @param {String} question - 用户问题
 */
export async function getAIInterpretation(hexagram, changingHexagram, changingLines, question = '') {
  // 构建提示词
  const prompt = buildPrompt(hexagram, changingHexagram, changingLines, question);

  try {
    // 这里应该调用真实的AI API（如OpenAI、Claude等）
    // 为了演示，我们返回模拟的解卦
    return await simulateAIResponse(prompt, hexagram, changingHexagram);
  } catch (error) {
    console.error('AI解卦失败:', error);
    throw new Error('AI解卦服务暂时不可用，请稍后再试');
  }
}

function buildPrompt(hexagram, changingHexagram, changingLines, question) {
  let prompt = `你是一位精通易经的大师，请为以下卦象提供详细解读：\n\n`;
  prompt += `本卦：${hexagram.name}卦（${hexagram.title}）\n`;
  prompt += `卦辞：${hexagram.judgement}\n`;
  prompt += `象曰：${hexagram.image}\n\n`;

  if (changingHexagram) {
    prompt += `变卦：${changingHexagram.name}卦（${changingHexagram.title}）\n`;
    prompt += `变爻位置：第${changingLines.join('、')}爻\n\n`;
  }

  if (question) {
    prompt += `问题：${question}\n\n`;
  }

  prompt += `请从以下几个方面进行解读：\n`;
  prompt += `1. 当前形势分析\n`;
  prompt += `2. 发展趋势预测\n`;
  prompt += `3. 应对建议\n`;
  prompt += `4. 注意事项\n`;

  return prompt;
}

// 模拟AI响应（实际应该调用真实API）
async function simulateAIResponse(prompt, hexagram, changingHexagram) {
  // 模拟网络延迟
  await new Promise(resolve => setTimeout(resolve, 2000));

  // 生成智能化的解卦内容
  const interpretations = {
    '乾': {
      situation: '当前处于强势位置，如日中天，充满活力与创造力。您的努力和才能正在被认可，正是大展宏图的好时机。',
      trend: '未来发展势头强劲，但要注意保持谦逊。刚健有力的同时，也要懂得以柔克刚，避免过刚易折。',
      advice: '继续保持积极进取的态度，但要注意方式方法。像天道运行一样，自强不息，同时也要顺应时势。',
      caution: '防止过于刚猛而失去变通，注意团队协作，不要一意孤行。'
    },
    '坤': {
      situation: '当前应该以柔顺包容的态度应对局面。就像大地承载万物一样，要有宽广的胸怀和耐心。',
      trend: '以退为进，以柔克刚。通过包容和等待，最终会获得理想的结果。',
      advice: '要学会顺势而为，不要强求。像大地一样厚德载物，默默付出终会有回报。',
      caution: '不要过于被动，要在顺从中保持自己的原则和底线。'
    },
    '屯': {
      situation: '当前处于起步阶段，虽然困难重重，但孕育着巨大的生机。万事开头难，这是正常现象。',
      trend: '虽然艰难，但前景光明。只要坚持下去，必能开创新局面。',
      advice: '稳扎稳打，不要急于求成。建立稳固的基础比快速扩张更重要。',
      caution: '避免冒进，当前不宜大举行动，应该先做好准备工作。'
    }
  };

  const hexName = hexagram.name;
  const baseInterpretation = interpretations[hexName] || {
    situation: `根据${hexagram.name}卦的特性，当前形势${hexagram.description}`,
    trend: `发展趋势：${hexagram.interpretation}`,
    advice: '建议您结合实际情况，遵循卦象的指引，谨慎行事。',
    caution: '注意观察形势变化，适时调整策略。'
  };

  let response = `## 🔮 AI智能解卦\n\n`;
  response += `### 📊 当前形势\n${baseInterpretation.situation}\n\n`;
  response += `### 📈 发展趋势\n${baseInterpretation.trend}\n\n`;
  response += `### 💡 应对建议\n${baseInterpretation.advice}\n\n`;
  response += `### ⚠️ 注意事项\n${baseInterpretation.caution}\n\n`;

  if (changingHexagram) {
    response += `### 🔄 变卦启示\n`;
    response += `由${hexagram.name}卦变为${changingHexagram.name}卦，说明形势正在发生转变。`;
    response += `${changingHexagram.description}这预示着您需要适应新的变化，调整策略以应对新的局面。\n\n`;
  }

  response += `---\n*此解卦结合了传统易经智慧与现代AI分析，仅供参考*`;

  return response;
}

// 检查API配置
export function checkAPIConfiguration() {
  // 检查是否配置了API密钥
  // 实际使用时应该检查环境变量
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  return !!apiKey;
}

// 真实的API调用示例（需要配置API密钥）
async function callRealAI(prompt) {
  const apiKey = import.meta.env.VITE_AI_API_KEY;
  const apiEndpoint = import.meta.env.VITE_AI_API_ENDPOINT || 'https://api.openai.com/v1/chat/completions';

  if (!apiKey) {
    throw new Error('未配置AI API密钥');
  }

  const response = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: '你是一位精通易经的大师，擅长解读卦象，提供智慧的建议。'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    })
  });

  if (!response.ok) {
    throw new Error('AI API调用失败');
  }

  const data = await response.json();
  return data.choices[0].message.content;
}
