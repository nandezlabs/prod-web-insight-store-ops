# Store App - PHP API

Serverless PHP API layer for the Store App, providing secure authentication and Notion database proxy on Hostinger Premium.

## 🎯 Features

- **Secure Authentication** - PIN-based login with Argon2id hashing
- **Rate Limiting** - 5 attempts per 15 minutes, automatic lockout
- **Geofence Verification** - Location-based access control
- **Session Management** - Encrypted session tokens with validation
- **Notion Proxy** - Authenticated database operations
- **Audit Logging** - All actions logged to Notion
- **HTTPS Enforcement** - Automatic HTTP to HTTPS redirect
- **CORS Protection** - Restricted to authorized frontend domain
- **Input Validation** - Comprehensive sanitization and validation

## 📁 Structure

```
api/
├── config.php              # Configuration & environment variables
├── auth.php                # Authentication endpoint
├── notion-proxy.php        # Notion API proxy endpoint
├── error.php               # Error handler
├── .htaccess               # Security headers & URL rewriting
├── .env.example            # Environment variables template
├── generate-pin.php        # PIN hash generator
├── generate-key.php        # Encryption key generator
├── utils/
│   ├── Encryption.php      # AES-256-GCM encryption
│   ├── Validator.php       # Input validation & sanitization
│   ├── RateLimiter.php     # Rate limiting with MySQL
│   └── NotionClient.php    # Notion API wrapper
└── SETUP.md                # Complete setup instructions
```

## 🚀 Quick Start

### 1. Upload to Hostinger

Upload the entire `api/` folder to `public_html/api/`

### 2. Configure Environment

Set environment variables in Hostinger control panel:

```bash
NOTION_API_KEY=secret_xxx
DB_STORE_PROFILE=xxx
ENCRYPTION_KEY=xxx
DB_HOST=localhost
DB_NAME=store_app
ALLOWED_ORIGIN=https://your-domain.com
```

### 3. Generate Keys

```bash
# Generate encryption key
php generate-key.php

# Generate PIN hash for store
php generate-pin.php 1234
```

### 4. Create Store in Notion

Add a page to your Store Profile database with:

- Store ID: `STORE-001`
- PIN Hash: (from generate-pin.php)
- Store Name, Role, Coordinates, etc.

### 5. Test

```bash
curl -X POST https://yourdomain.com/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"STORE-001","pin":"1234","latitude":40.7128,"longitude":-74.0060}'
```

## 📡 API Endpoints

### Authentication

#### POST `/api/auth.php?action=login`

Authenticate with PIN and location.

**Request:**

```json
{
  "storeId": "STORE-001",
  "pin": "1234",
  "latitude": 40.7128,
  "longitude": -74.006
}
```

**Response (Success):**

```json
{
  "success": true,
  "sessionToken": "abc123...",
  "user": {
    "storeId": "STORE-001",
    "storeName": "Downtown Store",
    "role": "manager"
  }
}
```

**Response (Error):**

```json
{
  "success": false,
  "error": "Invalid PIN",
  "attemptsRemaining": 4
}
```

**Response (Rate Limited - 423):**

```json
{
  "success": false,
  "error": "Too many attempts. Please try again later.",
  "lockedUntil": 1701967200000,
  "attemptsRemaining": 0
}
```

#### POST `/api/auth.php?action=logout`

End user session.

**Request:**

```json
{
  "sessionToken": "abc123..."
}
```

**Response:**

```json
{
  "success": true
}
```

#### POST `/api/auth.php?action=validate`

Validate existing session.

**Request:**

```json
{
  "sessionToken": "abc123..."
}
```

**Response:**

```json
{
  "valid": true,
  "user": {
    "storeId": "STORE-001",
    "storeName": "Downtown Store",
    "role": "manager"
  }
}
```

### Notion Proxy

All requests require `Authorization: Bearer <sessionToken>` header.

#### POST `/api/notion-proxy.php?action=query`

Query a Notion database.

**Request:**

```json
{
  "databaseId": "xxx",
  "filter": {
    "property": "Status",
    "select": { "equals": "Active" }
  },
  "sorts": [{ "property": "Created", "direction": "descending" }]
}
```

**Response:**

```json
{
  "success": true,
  "results": [
    /* Notion pages */
  ]
}
```

#### POST `/api/notion-proxy.php?action=create`

Create a page in a database.

**Request:**

```json
{
  "databaseId": "xxx",
  "properties": {
    "Name": { "title": [{ "text": { "content": "New Item" } }] },
    "Status": { "select": { "name": "Active" } }
  }
}
```

#### POST `/api/notion-proxy.php?action=update`

Update a page.

**Request:**

```json
{
  "pageId": "xxx",
  "properties": {
    "Status": { "select": { "name": "Completed" } }
  }
}
```

#### POST `/api/notion-proxy.php?action=get`

Get a specific page.

**Request:**

```json
{
  "pageId": "xxx"
}
```

## 🔒 Security Features

### Authentication

- ✅ Argon2id password hashing (memory: 64MB, iterations: 4)
- ✅ Rate limiting (5 attempts = 15 min lockout)
- ✅ Geofence verification (Haversine distance)
- ✅ Session tokens (128-char hex, randomly generated)
- ✅ Force logout capability

### Encryption

- ✅ AES-256-GCM for session tokens
- ✅ Random IV per encryption
- ✅ Authentication tags for integrity

### Input Validation

- ✅ Store ID format validation
- ✅ PIN format (4-6 digits)
- ✅ Latitude/longitude bounds checking
- ✅ Session token format validation
- ✅ Notion ID validation
- ✅ SQL injection prevention (prepared statements)
- ✅ XSS prevention (htmlspecialchars)

### Headers & Transport

- ✅ HTTPS enforced (automatic redirect)
- ✅ HSTS (1 year)
- ✅ Content Security Policy
- ✅ X-Frame-Options: DENY
- ✅ X-Content-Type-Options: nosniff
- ✅ CORS restricted to frontend domain

### Access Control

- ✅ Role-based database access
- ✅ Store-level data isolation
- ✅ Session token verification
- ✅ Force logout flag

## 🛠️ Utilities

### Encryption Class

```php
// Generate encryption key
$key = Encryption::generateKey();

// Encrypt data
$encrypted = Encryption::encrypt($data, $key);

// Decrypt data
$plaintext = Encryption::decrypt($encrypted, $key);

// Generate session token
$token = Encryption::generateToken(64);
```

### Validator Class

```php
// Validate store ID
$storeId = Validator::validateStoreId($input);

// Validate PIN
$pin = Validator::validatePin($input);

// Validate coordinates
$lat = Validator::validateLatitude($input);
$lon = Validator::validateLongitude($input);

// Calculate distance (Haversine)
$distance = Validator::calculateDistance($lat1, $lon1, $lat2, $lon2);
```

### Rate Limiter

```php
$limiter = new RateLimiter();

// Check if allowed
$result = $limiter->checkLimit($storeId);
// Returns: ['allowed' => bool, 'attemptsRemaining' => int, 'lockedUntil' => timestamp]

// Record failed attempt
$limiter->recordAttempt($storeId);

// Reset on success
$limiter->reset($storeId);
```

### Notion Client

```php
$notion = new NotionClient();

// Query database
$results = $notion->queryDatabase($dbId, $filter, $sorts);

// Get page
$page = $notion->getPage($pageId);

// Create page
$page = $notion->createPage($dbId, $properties);

// Update page
$page = $notion->updatePage($pageId, $properties);

// Helper: Find store by ID
$store = $notion->findStoreByStoreId($storeId);

// Helper: Extract property value
$value = NotionClient::getPropertyValue($page, 'Property Name');

// Helper: Format property
$prop = NotionClient::formatProperty('rich_text', $value);
```

## 📊 Error Codes

| Code | Meaning               | Description                      |
| ---- | --------------------- | -------------------------------- |
| 200  | OK                    | Request successful               |
| 201  | Created               | Page created successfully        |
| 400  | Bad Request           | Invalid input or JSON            |
| 401  | Unauthorized          | Invalid credentials or session   |
| 403  | Forbidden             | Geofence failed or access denied |
| 404  | Not Found             | Page or resource not found       |
| 405  | Method Not Allowed    | Wrong HTTP method                |
| 423  | Locked                | Rate limit exceeded              |
| 500  | Internal Server Error | Server or Notion API error       |

## 🧪 Testing

Run tests locally:

```bash
# Test authentication
curl -X POST http://localhost/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"STORE-001","pin":"1234","latitude":40.7128,"longitude":-74.0060}'

# Test rate limiting (run 6 times)
for i in {1..6}; do
  curl -X POST http://localhost/api/auth.php?action=login \
    -H "Content-Type: application/json" \
    -d '{"storeId":"STORE-001","pin":"9999","latitude":40.7128,"longitude":-74.0060}'
  echo ""
done

# Test session validation
curl -X POST http://localhost/api/auth.php?action=validate \
  -H "Content-Type: application/json" \
  -d '{"sessionToken":"your_token_here"}'

# Test Notion proxy (requires valid session)
curl -X POST http://localhost/api/notion-proxy.php?action=query \
  -H "Authorization: Bearer your_token_here" \
  -H "Content-Type: application/json" \
  -d '{"databaseId":"xxx","filter":{}}'
```

## 📝 Database Schema

See [SETUP.md](SETUP.md) for complete Notion database schema.

## 🔧 Troubleshooting

Common issues and solutions in [SETUP.md](SETUP.md#-troubleshooting)

## 📚 Documentation

- [SETUP.md](SETUP.md) - Complete setup guide
- [.env.example](.env.example) - Environment variables template
- [Notion API Docs](https://developers.notion.com/)

## 🤝 Integration

Update frontend to use this API:

```typescript
// src/features/auth/services/authService.ts
const API_BASE_URL = "https://yourdomain.com/api";
```

All existing frontend code will work without changes - API contract matches exactly.

## 📄 License

Part of the Store App project.
