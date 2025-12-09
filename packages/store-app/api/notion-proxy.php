<?php
/**
 * Notion API Proxy
 * Authenticated proxy for Notion database operations
 */

require_once __DIR__ . '/config.php';
require_once __DIR__ . '/utils/Validator.php';
require_once __DIR__ . '/utils/NotionClient.php';

// Get authorization header
$headers = getallheaders();
$authHeader = $headers['Authorization'] ?? $headers['authorization'] ?? '';

if (!$authHeader || !preg_match('/Bearer\s+(\S+)/', $authHeader, $matches)) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Missing or invalid token']);
    exit;
}

$sessionToken = Validator::validateSessionToken($matches[1]);

if (!$sessionToken) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Invalid token format']);
    exit;
}

// Validate session token
$notion = new NotionClient();
$storeProfile = $notion->findStoreBySessionToken($sessionToken);

if (!$storeProfile) {
    http_response_code(401);
    echo json_encode(['error' => 'Unauthorized - Invalid session']);
    exit;
}

// Check Force Logout flag
$forceLogout = NotionClient::getPropertyValue($storeProfile, 'Force Logout') ?? false;

if ($forceLogout) {
    http_response_code(401);
    echo json_encode(['error' => 'Session terminated']);
    exit;
}

// Get authenticated store info
$storeId = NotionClient::getPropertyValue($storeProfile, 'Store ID');
$role = NotionClient::getPropertyValue($storeProfile, 'Role') ?? 'staff';

// Parse request
$method = $_SERVER['REQUEST_METHOD'];
$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (json_last_error() !== JSON_ERROR_NONE && in_array($method, ['POST', 'PUT', 'PATCH'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Get action from query parameter
$action = $_GET['action'] ?? '';

// Route to appropriate handler
switch ($action) {
    case 'query':
        handleQuery($data, $storeId, $role);
        break;
    
    case 'get':
        handleGet($data, $storeId, $role);
        break;
    
    case 'create':
        handleCreate($data, $storeId, $role);
        break;
    
    case 'update':
        handleUpdate($data, $storeId, $role);
        break;
    
    default:
        http_response_code(400);
        echo json_encode(['error' => 'Invalid action']);
        exit;
}

/**
 * Handle database query request
 */
function handleQuery($data, $storeId, $role) {
    $databaseId = Validator::validateNotionId($data['databaseId'] ?? '');
    $filter = $data['filter'] ?? [];
    $sorts = $data['sorts'] ?? [];
    
    if (!$databaseId) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid database ID']);
        return;
    }
    
    // Validate database access
    $allowedDatabases = getAllowedDatabases($role);
    
    if (!in_array($databaseId, $allowedDatabases)) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied to this database']);
        return;
    }
    
    // Add store filter for non-admin users
    if ($role !== 'admin') {
        $filter = addStoreFilter($filter, $storeId);
    }
    
    $notion = new NotionClient();
    $results = $notion->queryDatabase($databaseId, $filter, $sorts);
    
    if ($results === false) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to query database']);
        return;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'results' => $results
    ]);
}

/**
 * Handle get page request
 */
function handleGet($data, $storeId, $role) {
    $pageId = Validator::validateNotionId($data['pageId'] ?? '');
    
    if (!$pageId) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid page ID']);
        return;
    }
    
    $notion = new NotionClient();
    $page = $notion->getPage($pageId);
    
    if (!$page) {
        http_response_code(404);
        echo json_encode(['error' => 'Page not found']);
        return;
    }
    
    // Check if user has access to this page
    if ($role !== 'admin') {
        $pageStoreId = NotionClient::getPropertyValue($page, 'Store ID');
        
        if ($pageStoreId && $pageStoreId !== $storeId) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'page' => $page
    ]);
}

/**
 * Handle create page request
 */
function handleCreate($data, $storeId, $role) {
    $databaseId = Validator::validateNotionId($data['databaseId'] ?? '');
    $properties = $data['properties'] ?? [];
    
    if (!$databaseId || empty($properties)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid database ID or properties']);
        return;
    }
    
    // Validate database access
    $allowedDatabases = getAllowedDatabases($role);
    
    if (!in_array($databaseId, $allowedDatabases)) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied to this database']);
        return;
    }
    
    // Add Store ID to properties for non-admin users
    if ($role !== 'admin' && !isset($properties['Store ID'])) {
        $properties['Store ID'] = NotionClient::formatProperty('rich_text', $storeId);
    }
    
    $notion = new NotionClient();
    $page = $notion->createPage($databaseId, $properties);
    
    if (!$page) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to create page']);
        return;
    }
    
    http_response_code(201);
    echo json_encode([
        'success' => true,
        'page' => $page
    ]);
}

/**
 * Handle update page request
 */
function handleUpdate($data, $storeId, $role) {
    $pageId = Validator::validateNotionId($data['pageId'] ?? '');
    $properties = $data['properties'] ?? [];
    
    if (!$pageId || empty($properties)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid page ID or properties']);
        return;
    }
    
    $notion = new NotionClient();
    
    // Verify access to page
    $existingPage = $notion->getPage($pageId);
    
    if (!$existingPage) {
        http_response_code(404);
        echo json_encode(['error' => 'Page not found']);
        return;
    }
    
    // Check if user has access to this page
    if ($role !== 'admin') {
        $pageStoreId = NotionClient::getPropertyValue($existingPage, 'Store ID');
        
        if ($pageStoreId && $pageStoreId !== $storeId) {
            http_response_code(403);
            echo json_encode(['error' => 'Access denied']);
            return;
        }
    }
    
    // Update page
    $updatedPage = $notion->updatePage($pageId, $properties);
    
    if (!$updatedPage) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to update page']);
        return;
    }
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'page' => $updatedPage
    ]);
}

/**
 * Get allowed databases for role
 */
function getAllowedDatabases($role) {
    $databases = [
        DB_CHECKLISTS,
        DB_INVENTORY,
        DB_REPLACEMENTS,
        DB_FORM_DEFINITIONS,
        DB_MARKET_INTEL
    ];
    
    if ($role === 'admin' || $role === 'manager') {
        $databases[] = DB_ANALYTICS_LOGS;
    }
    
    // Remove empty database IDs
    return array_filter($databases);
}

/**
 * Add store filter to existing filter
 */
function addStoreFilter($filter, $storeId) {
    $storeFilter = [
        'property' => 'Store ID',
        'rich_text' => [
            'equals' => $storeId
        ]
    ];
    
    if (empty($filter)) {
        return $storeFilter;
    }
    
    // Combine with AND
    return [
        'and' => [
            $filter,
            $storeFilter
        ]
    ];
}
