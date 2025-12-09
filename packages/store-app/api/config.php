<?php
/**
 * API Configuration
 * Store sensitive credentials in environment variables
 */

// Notion API Configuration
define('NOTION_API_KEY', getenv('NOTION_API_KEY') ?: '');
define('NOTION_VERSION', '2022-06-28');
define('NOTION_BASE_URL', 'https://api.notion.com/v1');

// Notion Database IDs (store in environment variables)
define('DB_STORE_PROFILE', getenv('DB_STORE_PROFILE') ?: '');
define('DB_CHECKLISTS', getenv('DB_CHECKLISTS') ?: '');
define('DB_INVENTORY', getenv('DB_INVENTORY') ?: '');
define('DB_REPLACEMENTS', getenv('DB_REPLACEMENTS') ?: '');
define('DB_FORM_DEFINITIONS', getenv('DB_FORM_DEFINITIONS') ?: '');
define('DB_MARKET_INTEL', getenv('DB_MARKET_INTEL') ?: '');
define('DB_ANALYTICS_LOGS', getenv('DB_ANALYTICS_LOGS') ?: '');

// Encryption Configuration (32-byte key in base64)
define('ENCRYPTION_KEY', getenv('ENCRYPTION_KEY') ?: '');

// Rate Limiting Configuration
define('RATE_LIMIT_MAX_ATTEMPTS', 5);
define('RATE_LIMIT_TIME_WINDOW', 900); // 15 minutes in seconds

// Session Configuration
define('SESSION_TOKEN_LENGTH', 64); // bytes
define('SESSION_EXPIRY', 86400); // 24 hours in seconds

// CORS Configuration
define('ALLOWED_ORIGIN', getenv('ALLOWED_ORIGIN') ?: 'http://localhost:5173');

// Error Reporting (disable in production)
define('DEBUG_MODE', getenv('DEBUG_MODE') === 'true');

if (DEBUG_MODE) {
    error_reporting(E_ALL);
    ini_set('display_errors', 1);
} else {
    error_reporting(0);
    ini_set('display_errors', 0);
}

// Timezone
date_default_timezone_set('UTC');

// Helper function to get database connection
function getDbConnection() {
    $host = getenv('DB_HOST') ?: 'localhost';
    $dbname = getenv('DB_NAME') ?: 'store_app';
    $username = getenv('DB_USER') ?: 'root';
    $password = getenv('DB_PASSWORD') ?: '';
    
    try {
        $pdo = new PDO(
            "mysql:host=$host;dbname=$dbname;charset=utf8mb4",
            $username,
            $password,
            [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ]
        );
        return $pdo;
    } catch (PDOException $e) {
        if (DEBUG_MODE) {
            error_log("Database connection failed: " . $e->getMessage());
        }
        return null;
    }
}

// Set CORS headers
function setCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    
    if ($origin === ALLOWED_ORIGIN) {
        header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
    }
    
    header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");
    header("Access-Control-Allow-Headers: Content-Type, Authorization");
    header("Access-Control-Allow-Credentials: true");
    header("Access-Control-Max-Age: 86400");
}

// Handle preflight OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    setCorsHeaders();
    http_response_code(204);
    exit;
}

// Set security headers
header("X-Content-Type-Options: nosniff");
header("X-Frame-Options: DENY");
header("X-XSS-Protection: 1; mode=block");
header("Strict-Transport-Security: max-age=31536000; includeSubDomains");
header("Content-Security-Policy: default-src 'self'");

// JSON content type
header('Content-Type: application/json; charset=utf-8');

// Always set CORS headers
setCorsHeaders();
