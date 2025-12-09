<?php
/**
 * Rate Limiter
 * Tracks login attempts and enforces rate limiting
 */

require_once __DIR__ . '/../config.php';

class RateLimiter {
    private $pdo;
    private $maxAttempts;
    private $timeWindow;
    
    public function __construct($maxAttempts = null, $timeWindow = null) {
        $this->pdo = getDbConnection();
        $this->maxAttempts = $maxAttempts ?? RATE_LIMIT_MAX_ATTEMPTS;
        $this->timeWindow = $timeWindow ?? RATE_LIMIT_TIME_WINDOW;
        
        $this->createTableIfNotExists();
    }
    
    /**
     * Create rate limit table if it doesn't exist
     */
    private function createTableIfNotExists() {
        if (!$this->pdo) {
            return;
        }
        
        $sql = "CREATE TABLE IF NOT EXISTS rate_limit_cache (
            id INT AUTO_INCREMENT PRIMARY KEY,
            identifier VARCHAR(255) UNIQUE NOT NULL,
            attempts INT DEFAULT 1,
            first_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            locked_until TIMESTAMP NULL,
            INDEX idx_identifier (identifier),
            INDEX idx_locked_until (locked_until)
        )";
        
        try {
            $this->pdo->exec($sql);
        } catch (PDOException $e) {
            error_log("Failed to create rate_limit_cache table: " . $e->getMessage());
        }
    }
    
    /**
     * Check if identifier is rate limited
     * 
     * @param string $identifier Unique identifier (e.g., store ID)
     * @return array ['allowed' => bool, 'attemptsRemaining' => int, 'resetAt' => timestamp, 'lockedUntil' => timestamp]
     */
    public function checkLimit($identifier) {
        if (!$this->pdo) {
            // If no DB connection, allow request but log error
            error_log("Rate limiter: No database connection");
            return [
                'allowed' => true,
                'attemptsRemaining' => $this->maxAttempts,
                'resetAt' => null,
                'lockedUntil' => null
            ];
        }
        
        // Clean up expired entries first
        $this->cleanup();
        
        $sql = "SELECT * FROM rate_limit_cache WHERE identifier = :identifier";
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute(['identifier' => $identifier]);
        $record = $stmt->fetch();
        
        $now = time();
        
        if (!$record) {
            // No record found, allowed
            return [
                'allowed' => true,
                'attemptsRemaining' => $this->maxAttempts,
                'resetAt' => null,
                'lockedUntil' => null
            ];
        }
        
        // Check if currently locked
        if ($record['locked_until']) {
            $lockedUntil = strtotime($record['locked_until']);
            if ($now < $lockedUntil) {
                return [
                    'allowed' => false,
                    'attemptsRemaining' => 0,
                    'resetAt' => $lockedUntil,
                    'lockedUntil' => $lockedUntil
                ];
            }
        }
        
        // Check if time window has expired
        $firstAttempt = strtotime($record['first_attempt']);
        if (($now - $firstAttempt) > $this->timeWindow) {
            // Time window expired, reset
            $this->reset($identifier);
            return [
                'allowed' => true,
                'attemptsRemaining' => $this->maxAttempts,
                'resetAt' => null,
                'lockedUntil' => null
            ];
        }
        
        // Check if max attempts exceeded
        $attempts = (int)$record['attempts'];
        if ($attempts >= $this->maxAttempts) {
            // Lock the identifier
            $lockedUntil = $now + $this->timeWindow;
            $this->lock($identifier, $lockedUntil);
            
            return [
                'allowed' => false,
                'attemptsRemaining' => 0,
                'resetAt' => $lockedUntil,
                'lockedUntil' => $lockedUntil
            ];
        }
        
        // Still have attempts remaining
        return [
            'allowed' => true,
            'attemptsRemaining' => $this->maxAttempts - $attempts,
            'resetAt' => $firstAttempt + $this->timeWindow,
            'lockedUntil' => null
        ];
    }
    
    /**
     * Record a failed attempt
     * 
     * @param string $identifier
     * @return bool Success
     */
    public function recordAttempt($identifier) {
        if (!$this->pdo) {
            return false;
        }
        
        $sql = "INSERT INTO rate_limit_cache (identifier, attempts, first_attempt, last_attempt)
                VALUES (:identifier, 1, NOW(), NOW())
                ON DUPLICATE KEY UPDATE
                attempts = attempts + 1,
                last_attempt = NOW()";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['identifier' => $identifier]);
            return true;
        } catch (PDOException $e) {
            error_log("Failed to record attempt: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Lock an identifier for the time window
     * 
     * @param string $identifier
     * @param int $lockedUntil Unix timestamp
     * @return bool Success
     */
    private function lock($identifier, $lockedUntil) {
        if (!$this->pdo) {
            return false;
        }
        
        $sql = "UPDATE rate_limit_cache 
                SET locked_until = FROM_UNIXTIME(:locked_until)
                WHERE identifier = :identifier";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute([
                'identifier' => $identifier,
                'locked_until' => $lockedUntil
            ]);
            return true;
        } catch (PDOException $e) {
            error_log("Failed to lock identifier: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Reset rate limit for identifier (on successful login)
     * 
     * @param string $identifier
     * @return bool Success
     */
    public function reset($identifier) {
        if (!$this->pdo) {
            return false;
        }
        
        $sql = "DELETE FROM rate_limit_cache WHERE identifier = :identifier";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['identifier' => $identifier]);
            return true;
        } catch (PDOException $e) {
            error_log("Failed to reset rate limit: " . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Clean up expired entries
     */
    private function cleanup() {
        if (!$this->pdo) {
            return;
        }
        
        $sql = "DELETE FROM rate_limit_cache 
                WHERE (locked_until IS NOT NULL AND locked_until < NOW())
                OR (UNIX_TIMESTAMP(NOW()) - UNIX_TIMESTAMP(first_attempt)) > :time_window";
        
        try {
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute(['time_window' => $this->timeWindow * 2]); // Keep for 2x time window
        } catch (PDOException $e) {
            error_log("Failed to cleanup rate limits: " . $e->getMessage());
        }
    }
}
