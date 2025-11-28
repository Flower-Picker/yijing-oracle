-- 易经卜卦数据库表结构

-- 创建数据库
CREATE DATABASE IF NOT EXISTS yijing_oracle DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE yijing_oracle;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255),

    -- 用户类型: guest, registered, vip
    user_type ENUM('guest', 'registered', 'vip') DEFAULT 'guest',

    -- 第三方登录
    wechat_openid VARCHAR(100) UNIQUE,
    wechat_unionid VARCHAR(100),

    -- 验证状态
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,

    -- AI解卦次数
    ai_quota INT DEFAULT 0,

    -- VIP信息
    vip_expire_at DATETIME,

    -- 统计信息
    divination_count INT DEFAULT 0,
    last_login_at DATETIME,

    -- 时间戳
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    INDEX idx_email (email),
    INDEX idx_phone (phone),
    INDEX idx_wechat_openid (wechat_openid),
    INDEX idx_user_type (user_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 验证码表
CREATE TABLE IF NOT EXISTS verification_codes (
    id INT PRIMARY KEY AUTO_INCREMENT,
    type ENUM('email', 'phone') NOT NULL,
    target VARCHAR(100) NOT NULL COMMENT '邮箱或手机号',
    code VARCHAR(10) NOT NULL,
    purpose ENUM('register', 'login', 'reset_password', 'bind') DEFAULT 'register',

    -- 过期时间（默认10分钟）
    expire_at DATETIME NOT NULL,

    -- 使用状态
    used BOOLEAN DEFAULT FALSE,
    used_at DATETIME,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    INDEX idx_target_code (target, code),
    INDEX idx_expire (expire_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 起卦记录表
CREATE TABLE IF NOT EXISTS divination_records (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,

    -- 问题
    question TEXT,

    -- 卦象信息（JSON格式）
    hexagram_data JSON NOT NULL,

    -- 六爻数据（JSON格式）
    lines_data JSON NOT NULL,

    -- 是否使用AI解卦
    ai_used BOOLEAN DEFAULT FALSE,

    -- AI解卦结果
    ai_interpretation TEXT,

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 登录日志表
CREATE TABLE IF NOT EXISTS login_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    login_type ENUM('email', 'phone', 'wechat') NOT NULL,
    ip_address VARCHAR(50),
    user_agent TEXT,

    success BOOLEAN DEFAULT TRUE,
    fail_reason VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,

    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 系统配置表
CREATE TABLE IF NOT EXISTS system_config (
    id INT PRIMARY KEY AUTO_INCREMENT,
    config_key VARCHAR(50) UNIQUE NOT NULL,
    config_value TEXT,
    description VARCHAR(255),

    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 插入默认配置
INSERT INTO system_config (config_key, config_value, description) VALUES
('register_ai_quota', '3', '注册用户赠送的AI解卦次数'),
('vip_ai_quota', '999', 'VIP用户的AI解卦次数'),
('sms_daily_limit', '5', '每个手机号每天最多发送验证码次数'),
('email_daily_limit', '5', '每个邮箱每天最多发送验证码次数');
