<?php
/**
 * Authentication Endpoint
 * Handles login, logout, and session validation
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils/Validator.php';
require_once __DIR__ . '/utils/Encryption.php';
require_once __DIR__ . '/utils/RateLimiter.php';
require_once __DIR__ . '/utils/NotionClient.php';

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

// Get action from query parameter
$action = $_GET['action'] ?? '';

// Parse request body
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Route to appropriate handler
switch ($action) {
    case 'login':
        handleLogin($data);
        break;
    
    case 'logout':
        handleLogout($data);
        break;
    
    case 'validate':
    case 'validateSession':
        handleValidateSession($data);
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
}

/**
 * Handle login request
 */
function handleLogin($data) {
    // Validate inputs
    $storeId = Validator::validateStoreId($data['storeId'] ?? '');
    $pin = Validator::validatePin($data['pin'] ?? '');
    $latitude = Validator::validateLatitude($data['latitude'] ?? 0);
    $longitude = Validator::validateLongitude($data['longitude'] ?? 0);
    
    if (!$storeId || !$pin || $latitude === false || $longitude === false) {
        http_response_code(400);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid input'
        ]);
        return;
    }
    
    // Check rate limiting
    $rateLimiter = new RateLimiter();
    $limitCheck = $rateLimiter->checkLimit($storeId);
    
    if (!$limitCheck['allowed']) {
        http_response_code(423);
        echo json_encode([
            'success' => false,
            'error' => 'Too many attempts. Please try again later.',
            'lockedUntil' => $limitCheck['lockedUntil'] * 1000, // Convert to milliseconds
            'attemptsRemaining' => 0
        ]);
        return;
    }
    
    // Query Notion for store profile
    $notion = new NotionClient();
    $storeProfile = $notion->findStoreByStoreId($storeId);
    
    if (!$storeProfile) {
        // Don't reveal if store doesn't exist (security)
        $rateLimiter->recordAttempt($storeId);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid PIN',
            'attemptsRemaining' => $limitCheck['attemptsRemaining'] - 1
        ]);
        return;
    }
    
    // Extract store data
    $storedPinHash = NotionClient::getPropertyValue($storeProfile, 'PIN Hash');
    $storeName = NotionClient::getPropertyValue($storeProfile, 'Store Name');
    $role = NotionClient::getPropertyValue($storeProfile, 'Role') ?? 'staff';
    $storeLatitude = NotionClient::getPropertyValue($storeProfile, 'Latitude');
    $storeLongitude = NotionClient::getPropertyValue($storeProfile, 'Longitude');
    $geofenceRadius = NotionClient::getPropertyValue($storeProfile, 'Geofence Radius') ?? 100; // meters
    $forceLogout = NotionClient::getPropertyValue($storeProfile, 'Force Logout') ?? false;
    
    // Verify PIN
    if (!$storedPinHash || !password_verify($pin, $storedPinHash)) {
        $rateLimiter->recordAttempt($storeId);
        http_response_code(401);
        echo json_encode([
            'success' => false,
            'error' => 'Invalid PIN',
            'attemptsRemaining' => $limitCheck['attemptsRemaining'] - 1
        ]);
        return;
    }
    
    // Check geofence (if coordinates are available)
    if ($storeLatitude !== null && $storeLongitude !== null) {
        $distance = Validator::calculateDistance(
            $latitude,
            $longitude,
            $storeLatitude,
            $storeLongitude
        );
        
        if ($distance > $geofenceRadius) {
            $rateLimiter->recordAttempt($storeId);
            http_response_code(403);
            echo json_encode([
                'success' => false,
                'error' => 'Location verification failed. Are you at the store?',
                'attemptsRemaining' => $limitCheck['attemptsRemaining'] - 1
            ]);
            return;
        }
    }
    
    // Generate session token
    $sessionToken = Encryption::generateToken(SESSION_TOKEN_LENGTH);
    
    // Update session token in Notion
    $updateResult = $notion->updatePage($storeProfile['id'], [
        'Session Token' => NotionClient::formatProperty('rich_text', $sessionToken),
        'Last Login' => NotionClient::formatProperty('date', date('Y-m-d\TH:i:s\Z')),
        'Force Logout' => NotionClient::formatProperty('checkbox', false)
    ]);
    
    if (!$updateResult) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create session'
        ]);
        return;
    }
    
    // Log login event to Analytics & Logs
    logEvent($notion, 'login', $storeId, [
        'latitude' => $latitude,
        'longitude' => $longitude,
        'success' => true
    ]);
    
    // Reset rate limit on successful login
    $rateLimiter->reset($storeId);
    
    // Return success response
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'sessionToken' => $sessionToken,
        'user' => [
            'storeId' => $storeId,
            'storeName' => $storeName,
            'role' => $role
        ]
    ]);
}

/**
 * Handle logout request
 */
function handleLogout($data) {
    $sessionToken = Validator::validateSessionToken($data['sessionToken'] ?? '');
    
    if (!$sessionToken) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Invalid session token']);
        return;
    }
    
    // Find store by session token
    $notion = new NotionClient();
    $storeProfile = $notion->findStoreBySessionToken($sessionToken);
    
    if ($storeProfile) {
        // Clear session token
        $notion->updatePage($storeProfile['id'], [
            'Session Token' => NotionClient::formatProperty('rich_text', ''),
            'Last Logout' => NotionClient::formatProperty('date', date('Y-m-d\TH:i:s\Z'))
        ]);
        
        // Log logout event
        $storeId = NotionClient::getPropertyValue($storeProfile, 'Store ID');
        logEvent($notion, 'logout', $storeId, ['success' => true]);
    }
    
    http_response_code(200);
    echo json_encode(['success' => true]);
}

/**
 * Handle session validation request
 */
function handleValidateSession($data) {
    $sessionToken = Validator::validateSessionToken($data['sessionToken'] ?? '');
    
    if (!$sessionToken) {
        http_response_code(200);
        echo json_encode(['valid' => false]);
        return;
    }
    
    // Find store by session token
    $notion = new NotionClient();
    $storeProfile = $notion->findStoreBySessionToken($sessionToken);
    
    if (!$storeProfile) {
        http_response_code(200);
        echo json_encode(['valid' => false]);
        return;
    }
    
    // Check Force Logout flag
    $forceLogout = NotionClient::getPropertyValue($storeProfile, 'Force Logout') ?? false;
    
    if ($forceLogout) {
        // Clear session token and return invalid
        $notion->updatePage($storeProfile['id'], [
            'Session Token' => NotionClient::formatProperty('rich_text', ''),
            'Force Logout' => NotionClient::formatProperty('checkbox', false)
        ]);
        
        http_response_code(200);
        echo json_encode(['valid' => false]);
        return;
    }
    
    // Extract user data
    $storeId = NotionClient::getPropertyValue($storeProfile, 'Store ID');
    $storeName = NotionClient::getPropertyValue($storeProfile, 'Store Name');
    $role = NotionClient::getPropertyValue($storeProfile, 'Role') ?? 'staff';
    
    http_response_code(200);
    echo json_encode([
        'valid' => true,
        'user' => [
            'storeId' => $storeId,
            'storeName' => $storeName,
            'role' => $role
        ]
    ]);
}

/**
 * Log event to Analytics & Logs database
 */
function logEvent($notion, $eventType, $storeId, $metadata = []) {
    if (!DB_ANALYTICS_LOGS) {
        return;
    }
    
    try {
        $properties = [
            'Event Type' => NotionClient::formatProperty('select', $eventType),
            'Store ID' => NotionClient::formatProperty('rich_text', $storeId),
            'Timestamp' => NotionClient::formatProperty('date', date('Y-m-d\TH:i:s\Z')),
            'Metadata' => NotionClient::formatProperty('rich_text', json_encode($metadata))
        ];
        
        $notion->createPage(DB_ANALYTICS_LOGS, $properties);
    } catch (Exception $e) {
        error_log("Failed to log event: " . $e->getMessage());
    }
}
