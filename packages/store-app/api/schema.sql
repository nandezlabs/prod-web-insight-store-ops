-- Store App API Database Schema
-- MySQL database for rate limiting and session management

-- Create database
CREATE DATABASE IF NOT EXISTS store_app CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE store_app;

-- Rate Limiting Table
-- Tracks failed login attempts and lockouts
CREATE TABLE IF NOT EXISTS rate_limit_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    identifier VARCHAR(255) UNIQUE NOT NULL COMMENT 'Store ID or IP address',
    attempts INT DEFAULT 1 COMMENT 'Number of failed attempts',
    first_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT 'First attempt timestamp',
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Last attempt timestamp',
    locked_until TIMESTAMP NULL COMMENT 'Lockout expiration time',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_identifier (identifier),
    INDEX idx_locked_until (locked_until),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Rate limiting for authentication';

-- Optional: Session Cache Table
-- Can be used as alternative to Notion for faster session validation
CREATE TABLE IF NOT EXISTS session_cache (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_token VARCHAR(128) UNIQUE NOT NULL COMMENT 'Hex-encoded session token',
    store_id VARCHAR(50) NOT NULL COMMENT 'Associated store ID',
    user_role VARCHAR(20) DEFAULT 'staff' COMMENT 'User role',
    store_name VARCHAR(255) COMMENT 'Store display name',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL COMMENT 'Session expiration',
    last_validated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session_token (session_token),
    INDEX idx_store_id (store_id),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Session token cache';

-- Optional: Audit Log Table
-- Local backup of Notion logs for faster queries
CREATE TABLE IF NOT EXISTS audit_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL COMMENT 'login, logout, create, update, delete',
    store_id VARCHAR(50) NOT NULL COMMENT 'Store ID',
    user_role VARCHAR(20) COMMENT 'User role at time of event',
    event_data JSON COMMENT 'Additional event metadata',
    ip_address VARCHAR(45) COMMENT 'Client IP address',
    user_agent TEXT COMMENT 'Client user agent',
    success BOOLEAN DEFAULT true COMMENT 'Whether operation succeeded',
    error_message TEXT COMMENT 'Error details if failed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_event_type (event_type),
    INDEX idx_store_id (store_id),
    INDEX idx_created_at (created_at),
    INDEX idx_success (success)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Audit trail';

-- Cleanup stored procedure for old records
DELIMITER //

CREATE PROCEDURE cleanup_old_records()
BEGIN
    -- Clean up expired rate limits (older than 24 hours)
    DELETE FROM rate_limit_cache 
    WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
    AND (locked_until IS NULL OR locked_until < NOW());
    
    -- Clean up expired sessions
    DELETE FROM session_cache 
    WHERE expires_at < NOW();
    
    -- Archive old audit logs (optional - keep last 90 days)
    -- DELETE FROM audit_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 90 DAY);
END //

DELIMITER ;

-- Create event to run cleanup daily (requires event scheduler)
-- SET GLOBAL event_scheduler = ON;

CREATE EVENT IF NOT EXISTS daily_cleanup
ON SCHEDULE EVERY 1 DAY
STARTS CURRENT_TIMESTAMP
DO CALL cleanup_old_records();

-- Verification queries
SELECT 'Database setup complete!' AS status;
SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME 
FROM information_schema.TABLES 
WHERE TABLE_SCHEMA = 'store_app' 
ORDER BY TABLE_NAME;
