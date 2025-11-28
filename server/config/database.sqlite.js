const Database = require('better-sqlite3');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// SQLite数据库文件路径
const DB_PATH = process.env.SQLITE_DB_PATH || path.join(__dirname, '../../data/yijing.db');

// 确保数据目录存在
const dataDir = path.dirname(DB_PATH);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// 创建数据库连接
const db = new Database(DB_PATH, {
  verbose: process.env.NODE_ENV === 'development' ? console.log : null
});

// 启用外键约束
db.pragma('foreign_keys = ON');

// 初始化数据库表结构
function initDatabase() {
  try {
    const schemaPath = path.join(__dirname, '../../database/schema.sqlite.sql');
    const schema = fs.readFileSync(schemaPath, 'utf8');

    // 执行建表语句
    db.exec(schema);

    console.log('✅ SQLite数据库初始化成功:', DB_PATH);
    return true;
  } catch (error) {
    console.error('❌ SQLite数据库初始化失败:', error.message);
    return false;
  }
}

// 包装查询方法以兼容MySQL2 promise接口
const pool = {
  async query(sql, params = []) {
    try {
      // 判断是查询还是执行
      const isSelect = sql.trim().toLowerCase().startsWith('select');

      if (isSelect) {
        const stmt = db.prepare(sql);
        const rows = stmt.all(...params);
        return [rows, null]; // 返回格式: [rows, fields]
      } else {
        const stmt = db.prepare(sql);
        const info = stmt.run(...params);
        return [{
          affectedRows: info.changes,
          insertId: info.lastInsertRowid
        }, null];
      }
    } catch (error) {
      console.error('SQL Error:', error.message);
      console.error('SQL:', sql);
      console.error('Params:', params);
      throw error;
    }
  },

  async execute(sql, params = []) {
    return this.query(sql, params);
  }
};

// 测试数据库连接
async function testConnection() {
  try {
    const [rows] = await pool.query('SELECT 1 as test');
    if (rows && rows[0] && rows[0].test === 1) {
      console.log('✅ SQLite数据库连接成功');
      return true;
    }
    return false;
  } catch (error) {
    console.error('❌ SQLite数据库连接失败:', error.message);
    return false;
  }
}

module.exports = { pool, testConnection, initDatabase, db };
