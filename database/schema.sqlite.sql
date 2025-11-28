-- 易经卜卦数据库表结构 (SQLite版本)

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE,
    phone TEXT UNIQUE,
    password_hash TEXT,

    -- 用户类型: guest, registered, vip
    user_type TEXT DEFAULT 'guest' CHECK(user_type IN ('guest', 'registered', 'vip')),

    -- 第三方登录
    wechat_openid TEXT UNIQUE,
    wechat_unionid TEXT,

    -- 验证状态
    email_verified INTEGER DEFAULT 0,
    phone_verified INTEGER DEFAULT 0,

    -- AI解卦次数
    ai_quota INTEGER DEFAULT 0,

    -- VIP信息
    vip_expire_at TEXT,

    -- 统计信息
    divination_count INTEGER DEFAULT 0,
    last_login_at TEXT,

    -- 时间戳
    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_phone ON users(phone);
CREATE INDEX IF NOT EXISTS idx_users_wechat_openid ON users(wechat_openid);
CREATE INDEX IF NOT EXISTS idx_users_user_type ON users(user_type);

-- 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL CHECK(type IN ('email', 'phone')),
    target TEXT NOT NULL, -- 邮箱或手机号
    code TEXT NOT NULL,
    purpose TEXT DEFAULT 'register' CHECK(purpose IN ('register', 'login', 'reset_password', 'bind')),

    -- 过期时间（默认10分钟）
    expire_at TEXT NOT NULL,

    -- 使用状态
    used INTEGER DEFAULT 0,
    used_at TEXT,

    created_at TEXT DEFAULT (datetime('now'))
);

CREATE INDEX IF NOT EXISTS idx_verification_codes_target_code ON verification_codes(target, code);
CREATE INDEX IF NOT EXISTS idx_verification_codes_expire ON verification_codes(expire_at);

-- 起卦记录表
CREATE TABLE IF NOT EXISTS divination_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,

    -- 问题
    question TEXT,

    -- 卦象信息（JSON格式）
    hexagram_data TEXT NOT NULL,

    -- 六爻数据（JSON格式）
    lines_data TEXT NOT NULL,

    -- 是否使用AI解卦
    ai_used INTEGER DEFAULT 0,

    -- AI解卦结果
    ai_interpretation TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_divination_records_user_id ON divination_records(user_id);
CREATE INDEX IF NOT EXISTS idx_divination_records_created_at ON divination_records(created_at);

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    login_type TEXT NOT NULL CHECK(login_type IN ('email', 'phone', 'wechat')),
    ip_address TEXT,
    user_agent TEXT,

    success INTEGER DEFAULT 1,
    fail_reason TEXT,

    created_at TEXT DEFAULT (datetime('now')),

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_login_logs_user_id ON login_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_login_logs_created_at ON login_logs(created_at);

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    config_key TEXT UNIQUE NOT NULL,
    config_value TEXT,
    description TEXT,

    created_at TEXT DEFAULT (datetime('now')),
    updated_at TEXT DEFAULT (datetime('now'))
);

-- 插入默认配置
INSERT OR IGNORE INTO system_config (config_key, config_value, description) VALUES
('register_ai_quota', '3', '注册用户赠送的AI解卦次数'),
('vip_ai_quota', '999', 'VIP用户的AI解卦次数'),
('sms_daily_limit', '5', '每个手机号每天最多发送验证码次数'),
('email_daily_limit', '5', '每个邮箱每天最多发送验证码次数');
