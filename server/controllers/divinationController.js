const { pool } = require('../config/database');

/**
 * 保存起卦记录
 */
async function saveDivination(req, res) {
  try {
    const { question, hexagram, lines, aiInterpretation } = req.body;
    const userId = req.user.id;

    if (!hexagram || !lines) {
      return res.status(400).json({
        success: false,
        message: '卦象数据不完整'
      });
    }

    const aiUsed = !!aiInterpretation;

    await pool.query(
      'INSERT INTO divination_records (user_id, question, hexagram_data, lines_data, ai_used, ai_interpretation) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, question, JSON.stringify(hexagram), JSON.stringify(lines), aiUsed, aiInterpretation]
    );

    // 更新用户起卦次数
    await pool.query(
      'UPDATE users SET divination_count = divination_count + 1 WHERE id = ?',
      [userId]
    );

    res.json({
      success: true,
      message: '保存成功'
    });
  } catch (error) {
    console.error('保存起卦记录失败:', error);
    res.status(500).json({
      success: false,
      message: '保存失败'
    });
  }
}

/**
 * 获取起卦历史
 */
async function getHistory(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const [records] = await pool.query(
      'SELECT * FROM divination_records WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
      [userId, limit, offset]
    );

    const [countResult] = await pool.query(
      'SELECT COUNT(*) as total FROM divination_records WHERE user_id = ?',
      [userId]
    );

    const total = countResult[0].total;

    res.json({
      success: true,
      data: {
        records: records.map(record => ({
          id: record.id,
          question: record.question,
          hexagram: JSON.parse(record.hexagram_data),
          lines: JSON.parse(record.lines_data),
          aiUsed: record.ai_used,
          aiInterpretation: record.ai_interpretation,
          createdAt: record.created_at
        })),
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    console.error('获取起卦历史失败:', error);
    res.status(500).json({
      success: false,
      message: '获取历史记录失败'
    });
  }
}

/**
 * 删除起卦记录
 */
async function deleteRecord(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    await pool.query(
      'DELETE FROM divination_records WHERE id = ? AND user_id = ?',
      [id, userId]
    );

    res.json({
      success: true,
      message: '删除成功'
    });
  } catch (error) {
    console.error('删除记录失败:', error);
    res.status(500).json({
      success: false,
      message: '删除失败'
    });
  }
}

module.exports = {
  saveDivination,
  getHistory,
  deleteRecord
};
