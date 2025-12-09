<?php
/**
 * Notion API Client
 * Wrapper for Notion API calls
 */

require_once __DIR__ . '/../config.php';

class NotionClient {
    private $apiKey;
    private $version;
    private $baseUrl;
    
    public function __construct($apiKey = null, $version = null) {
        $this->apiKey = $apiKey ?? NOTION_API_KEY;
        $this->version = $version ?? NOTION_VERSION;
        $this->baseUrl = NOTION_BASE_URL;
    }
    
    /**
     * Query a Notion database
     * 
     * @param string $databaseId Database ID
     * @param array $filter Optional filter criteria
     * @param array $sorts Optional sort criteria
     * @return array|false Query results or false on failure
     */
    public function queryDatabase($databaseId, $filter = [], $sorts = []) {
        $url = "{$this->baseUrl}/databases/{$databaseId}/query";
        
        $body = [];
        if (!empty($filter)) {
            $body['filter'] = $filter;
        }
        if (!empty($sorts)) {
            $body['sorts'] = $sorts;
        }
        
        $response = $this->request('POST', $url, $body);
        
        if ($response && isset($response['results'])) {
            return $response['results'];
        }
        
        return false;
    }
    
    /**
     * Get a specific page by ID
     * 
     * @param string $pageId Page ID
     * @return array|false Page object or false on failure
     */
    public function getPage($pageId) {
        $url = "{$this->baseUrl}/pages/{$pageId}";
        return $this->request('GET', $url);
    }
    
    /**
     * Create a new page in a database
     * 
     * @param string $databaseId Parent database ID
     * @param array $properties Page properties
     * @return array|false Created page object or false on failure
     */
    public function createPage($databaseId, $properties) {
        $url = "{$this->baseUrl}/pages";
        
        $body = [
            'parent' => ['database_id' => $databaseId],
            'properties' => $properties
        ];
        
        return $this->request('POST', $url, $body);
    }
    
    /**
     * Update a page's properties
     * 
     * @param string $pageId Page ID to update
     * @param array $properties Updated properties
     * @return array|false Updated page object or false on failure
     */
    public function updatePage($pageId, $properties) {
        $url = "{$this->baseUrl}/pages/{$pageId}";
        
        $body = [
            'properties' => $properties
        ];
        
        return $this->request('PATCH', $url, $body);
    }
    
    /**
     * Make HTTP request to Notion API
     * 
     * @param string $method HTTP method
     * @param string $url Full URL
     * @param array $body Request body
     * @return array|false Response data or false on failure
     */
    private function request($method, $url, $body = null) {
        $headers = [
            'Authorization: Bearer ' . $this->apiKey,
            'Notion-Version: ' . $this->version,
            'Content-Type: application/json'
        ];
        
        $ch = curl_init();
        
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($body !== null) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($body));
        }
        
        // SSL verification
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 2);
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $error = curl_error($ch);
        
        curl_close($ch);
        
        if ($error) {
            error_log("Notion API request failed: " . $error);
            return false;
        }
        
        $data = json_decode($response, true);
        
        if ($httpCode >= 200 && $httpCode < 300) {
            return $data;
        } else {
            error_log("Notion API error (HTTP $httpCode): " . $response);
            return false;
        }
    }
    
    /**
     * Helper: Find store profile by Store ID
     * 
     * @param string $storeId Store ID to search for
     * @return array|false Store profile page or false
     */
    public function findStoreByStoreId($storeId) {
        $filter = [
            'property' => 'Store ID',
            'rich_text' => [
                'equals' => $storeId
            ]
        ];
        
        $results = $this->queryDatabase(DB_STORE_PROFILE, $filter);
        
        if ($results && count($results) > 0) {
            return $results[0];
        }
        
        return false;
    }
    
    /**
     * Helper: Find store profile by session token
     * 
     * @param string $sessionToken Session token to search for
     * @return array|false Store profile page or false
     */
    public function findStoreBySessionToken($sessionToken) {
        $filter = [
            'property' => 'Session Token',
            'rich_text' => [
                'equals' => $sessionToken
            ]
        ];
        
        $results = $this->queryDatabase(DB_STORE_PROFILE, $filter);
        
        if ($results && count($results) > 0) {
            return $results[0];
        }
        
        return false;
    }
    
    /**
     * Helper: Extract property value from Notion page
     * 
     * @param array $page Notion page object
     * @param string $propertyName Property name
     * @return mixed Property value or null
     */
    public static function getPropertyValue($page, $propertyName) {
        if (!isset($page['properties'][$propertyName])) {
            return null;
        }
        
        $property = $page['properties'][$propertyName];
        $type = $property['type'];
        
        switch ($type) {
            case 'title':
                return isset($property['title'][0]['plain_text']) ? $property['title'][0]['plain_text'] : null;
            
            case 'rich_text':
                return isset($property['rich_text'][0]['plain_text']) ? $property['rich_text'][0]['plain_text'] : null;
            
            case 'number':
                return $property['number'];
            
            case 'select':
                return isset($property['select']['name']) ? $property['select']['name'] : null;
            
            case 'multi_select':
                return array_map(function($item) {
                    return $item['name'];
                }, $property['multi_select'] ?? []);
            
            case 'checkbox':
                return $property['checkbox'];
            
            case 'url':
                return $property['url'];
            
            case 'email':
                return $property['email'];
            
            case 'phone_number':
                return $property['phone_number'];
            
            case 'date':
                return isset($property['date']['start']) ? $property['date']['start'] : null;
            
            default:
                return null;
        }
    }
    
    /**
     * Helper: Format property for Notion API
     * 
     * @param string $type Property type
     * @param mixed $value Property value
     * @return array Formatted property
     */
    public static function formatProperty($type, $value) {
        switch ($type) {
            case 'title':
                return [
                    'title' => [
                        ['text' => ['content' => (string)$value]]
                    ]
                ];
            
            case 'rich_text':
                return [
                    'rich_text' => [
                        ['text' => ['content' => (string)$value]]
                    ]
                ];
            
            case 'number':
                return ['number' => (float)$value];
            
            case 'checkbox':
                return ['checkbox' => (bool)$value];
            
            case 'select':
                return ['select' => ['name' => (string)$value]];
            
            case 'url':
                return ['url' => (string)$value];
            
            default:
                return ['rich_text' => [['text' => ['content' => (string)$value]]]];
        }
    }
}
