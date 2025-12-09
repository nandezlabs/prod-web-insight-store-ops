# API Quick Reference

Fast reference guide for Store App API endpoints and responses.

## 🔗 Base URL

```
https://yourdomain.com/api
```

## 🔐 Authentication Endpoints

### Login

```http
POST /auth.php?action=login
Content-Type: application/json

{
  "storeId": "STORE-001",
  "pin": "1234",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

**Success (200):**

```json
{
  "success": true,
  "sessionToken": "a1b2c3d4...",
  "user": {
    "storeId": "STORE-001",
    "storeName": "Downtown Store",
    "role": "manager"
  }
}
```

**Invalid PIN (401):**

```json
{
  "success": false,
  "error": "Invalid PIN",
  "attemptsRemaining": 4
}
```

**Geofence Failed (403):**

```json
{
  "success": false,
  "error": "Location verification failed. Are you at the store?",
  "attemptsRemaining": 3
}
```

**Rate Limited (423):**

```json
{
  "success": false,
  "error": "Too many attempts. Please try again later.",
  "lockedUntil": 1701967200000,
  "attemptsRemaining": 0
}
```

### Logout

```http
POST /auth.php?action=logout
Content-Type: application/json

{
  "sessionToken": "a1b2c3d4..."
}
```

**Success (200):**

```json
{
  "success": true
}
```

### Validate Session

```http
POST /auth.php?action=validate
Content-Type: application/json

{
  "sessionToken": "a1b2c3d4..."
}
```

**Valid (200):**

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

**Invalid (200):**

```json
{
  "valid": false
}
```

## 📊 Notion Proxy Endpoints

All requests require: `Authorization: Bearer <sessionToken>`

### Query Database

```http
POST /notion-proxy.php?action=query
Authorization: Bearer a1b2c3d4...
Content-Type: application/json

{
  "databaseId": "abc123",
  "filter": {
    "property": "Status",
    "select": {
      "equals": "Active"
    }
  },
  "sorts": [
    {
      "property": "Created",
      "direction": "descending"
    }
  ]
}
```

**Success (200):**

```json
{
  "success": true,
  "results": [
    {
      "id": "page-id-1",
      "properties": {
        /* ... */
      }
    }
  ]
}
```

### Get Page

```http
POST /notion-proxy.php?action=get
Authorization: Bearer a1b2c3d4...
Content-Type: application/json

{
  "pageId": "abc123"
}
```

**Success (200):**

```json
{
  "success": true,
  "page": {
    "id": "abc123",
    "properties": {
      /* ... */
    }
  }
}
```

### Create Page

```http
POST /notion-proxy.php?action=create
Authorization: Bearer a1b2c3d4...
Content-Type: application/json

{
  "databaseId": "abc123",
  "properties": {
    "Name": {
      "title": [
        {
          "text": {
            "content": "New Task"
          }
        }
      ]
    },
    "Status": {
      "select": {
        "name": "Active"
      }
    }
  }
}
```

**Success (201):**

```json
{
  "success": true,
  "page": {
    "id": "new-page-id",
    "properties": {
      /* ... */
    }
  }
}
```

### Update Page

```http
POST /notion-proxy.php?action=update
Authorization: Bearer a1b2c3d4...
Content-Type: application/json

{
  "pageId": "abc123",
  "properties": {
    "Status": {
      "select": {
        "name": "Completed"
      }
    }
  }
}
```

**Success (200):**

```json
{
  "success": true,
  "page": {
    "id": "abc123",
    "properties": {
      /* ... */
    }
  }
}
```

## ❌ Error Responses

### 400 Bad Request

```json
{
  "error": "Invalid input"
}
```

### 401 Unauthorized

```json
{
  "error": "Unauthorized - Invalid session"
}
```

### 403 Forbidden

```json
{
  "error": "Access denied to this database"
}
```

### 404 Not Found

```json
{
  "error": "Page not found"
}
```

### 423 Locked

```json
{
  "success": false,
  "error": "Too many attempts. Please try again later.",
  "lockedUntil": 1701967200000,
  "attemptsRemaining": 0
}
```

### 500 Internal Server Error

```json
{
  "error": "Failed to query database"
}
```

## 🔧 Property Formatting

### Text/Rich Text

```json
{
  "PropertyName": {
    "rich_text": [
      {
        "text": {
          "content": "Your text here"
        }
      }
    ]
  }
}
```

### Title

```json
{
  "Title": {
    "title": [
      {
        "text": {
          "content": "Your title"
        }
      }
    ]
  }
}
```

### Number

```json
{
  "Quantity": {
    "number": 42
  }
}
```

### Select

```json
{
  "Status": {
    "select": {
      "name": "Active"
    }
  }
}
```

### Checkbox

```json
{
  "Completed": {
    "checkbox": true
  }
}
```

### Date

```json
{
  "DueDate": {
    "date": {
      "start": "2024-01-15"
    }
  }
}
```

## 📝 Filter Examples

### Equals

```json
{
  "property": "Status",
  "select": {
    "equals": "Active"
  }
}
```

### Contains

```json
{
  "property": "Name",
  "rich_text": {
    "contains": "search term"
  }
}
```

### Greater Than

```json
{
  "property": "Price",
  "number": {
    "greater_than": 100
  }
}
```

### AND

```json
{
  "and": [
    {
      "property": "Status",
      "select": {
        "equals": "Active"
      }
    },
    {
      "property": "Price",
      "number": {
        "greater_than": 50
      }
    }
  ]
}
```

### OR

```json
{
  "or": [
    {
      "property": "Status",
      "select": {
        "equals": "Active"
      }
    },
    {
      "property": "Status",
      "select": {
        "equals": "Pending"
      }
    }
  ]
}
```

## 📈 Rate Limits

- **Login Attempts:** 5 per store per 15 minutes
- **Lockout Duration:** 15 minutes
- **Session Expiry:** 24 hours (configurable)

## 🔑 Security Headers

All responses include:

- `Strict-Transport-Security: max-age=31536000`
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Content-Security-Policy: default-src 'self'`
- `Access-Control-Allow-Origin: https://your-domain.com`

## 💡 Tips

1. **Session Tokens:** Store securely, never log or expose
2. **Rate Limiting:** Show countdown timer to users
3. **Geofence:** Request location permission early
4. **Error Handling:** Parse error responses for user-friendly messages
5. **CORS:** Ensure frontend domain matches `ALLOWED_ORIGIN`
6. **Testing:** Use DEBUG_MODE=true locally, false in production

## 🧪 Testing with curl

```bash
# Store token for reuse
TOKEN=$(curl -s -X POST 'https://yourdomain.com/api/auth.php?action=login' \
  -H 'Content-Type: application/json' \
  -d '{"storeId":"STORE-001","pin":"1234","latitude":40.7128,"longitude":-74.0060}' \
  | jq -r '.sessionToken')

# Use token for authenticated requests
curl -X POST 'https://yourdomain.com/api/notion-proxy.php?action=query' \
  -H "Authorization: Bearer $TOKEN" \
  -H 'Content-Type: application/json' \
  -d '{"databaseId":"abc123","filter":{}}'
```

## 📚 Related Documentation

- [README.md](README.md) - Complete API documentation
- [SETUP.md](SETUP.md) - Installation guide
- [DEPLOYMENT.md](DEPLOYMENT.md) - Deployment checklist
