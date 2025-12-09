# PHP API Setup Guide

Complete guide for deploying the Store App PHP API on Hostinger Premium.

## 📋 Prerequisites

- Hostinger Premium hosting account
- PHP 7.4+ with required extensions
- MySQL database
- SSL certificate (HTTPS)
- Notion account with API access

## 🚀 Installation Steps

### 1. Upload Files to Hostinger

Upload the entire `api/` folder to your `public_html` directory:

```
public_html/
└── api/
    ├── .htaccess
    ├── config.php
    ├── auth.php
    ├── notion-proxy.php
    ├── error.php
    └── utils/
        ├── Encryption.php
        ├── Validator.php
        ├── RateLimiter.php
        └── NotionClient.php
```

### 2. Create MySQL Database

1. Log into Hostinger control panel
2. Go to **Databases** → **MySQL Databases**
3. Create a new database (e.g., `store_app`)
4. Create a database user with strong password
5. Grant all privileges to the user

The rate limiting table will be created automatically on first use.

### 3. Set Environment Variables

In Hostinger control panel, go to **Advanced** → **PHP Configuration** → **PHP Options**

Add these environment variables:

```bash
# Notion API Configuration
NOTION_API_KEY=secret_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
NOTION_VERSION=2022-06-28

# Notion Database IDs (32-character hex strings)
DB_STORE_PROFILE=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_CHECKLISTS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_INVENTORY=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_REPLACEMENTS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_FORM_DEFINITIONS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_MARKET_INTEL=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
DB_ANALYTICS_LOGS=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Encryption Key (generate with: openssl rand -base64 32)
ENCRYPTION_KEY=YOUR_32_BYTE_BASE64_KEY_HERE

# Database Configuration
DB_HOST=localhost
DB_NAME=store_app
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# CORS Configuration
ALLOWED_ORIGIN=https://your-frontend-domain.com

# Debug Mode (set to false in production)
DEBUG_MODE=false
```

**To generate encryption key:**

```bash
php -r "echo base64_encode(random_bytes(32));"
```

### 4. Configure Notion Databases

Each Notion database must have these properties:

#### Store Profile Database

- **Store ID** (Text) - Unique store identifier
- **Store Name** (Text) - Display name
- **PIN Hash** (Text) - Argon2id hashed PIN
- **Role** (Select: staff, manager, admin)
- **Session Token** (Text) - Current session token
- **Latitude** (Number) - Store location latitude
- **Longitude** (Number) - Store location longitude
- **Geofence Radius** (Number) - Allowed distance in meters
- **Force Logout** (Checkbox) - Force logout flag
- **Last Login** (Date) - Last login timestamp
- **Last Logout** (Date) - Last logout timestamp

#### Other Databases

All operational databases should include:

- **Store ID** (Text) - For filtering by store

### 5. Create Initial Store Profile

1. Open your Store Profile database in Notion
2. Create a new page with:
   - Store ID: `STORE-001`
   - Store Name: Your Store Name
   - PIN Hash: (see below)
   - Role: `manager`
   - Latitude/Longitude: Store coordinates
   - Geofence Radius: `100` (meters)

**Generate PIN hash:**

```php
<?php
// Save as generate-pin.php and run: php generate-pin.php
$pin = '1234'; // Your desired PIN
$hash = password_hash($pin, PASSWORD_ARGON2ID);
echo "PIN Hash: $hash\n";
?>
```

### 6. Test the API

Test authentication endpoint:

```bash
curl -X POST https://yourdomain.com/api/auth.php?action=login \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "STORE-001",
    "pin": "1234",
    "latitude": 40.7128,
    "longitude": -74.0060
  }'
```

Expected response:

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

### 7. Update Frontend Configuration

Update your frontend API endpoint:

```typescript
// src/features/auth/services/authService.ts
const API_BASE_URL = "https://yourdomain.com/api";
```

## 🔒 Security Checklist

- [ ] SSL certificate installed (HTTPS)
- [ ] Environment variables configured
- [ ] Database credentials secured
- [ ] CORS restricted to frontend domain
- [ ] Debug mode disabled in production
- [ ] Strong encryption key generated
- [ ] PIN hashes use Argon2id
- [ ] .htaccess security headers active
- [ ] File permissions set correctly (644 for files, 755 for directories)
- [ ] Error reporting disabled in production

## 📊 File Permissions

Set proper permissions via SSH or File Manager:

```bash
chmod 755 api/
chmod 644 api/*.php
chmod 644 api/.htaccess
chmod 755 api/utils/
chmod 644 api/utils/*.php
```

## 🧪 Testing Endpoints

### Login

```bash
POST /api/auth.php?action=login
Content-Type: application/json

{
  "storeId": "STORE-001",
  "pin": "1234",
  "latitude": 40.7128,
  "longitude": -74.0060
}
```

### Logout

```bash
POST /api/auth.php?action=logout
Content-Type: application/json

{
  "sessionToken": "abc123..."
}
```

### Validate Session

```bash
POST /api/auth.php?action=validate
Content-Type: application/json

{
  "sessionToken": "abc123..."
}
```

### Query Notion Database

```bash
POST /api/notion-proxy.php?action=query
Authorization: Bearer abc123...
Content-Type: application/json

{
  "databaseId": "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
  "filter": {},
  "sorts": []
}
```

## 🐛 Troubleshooting

### "Cannot connect to database"

- Check database credentials in environment variables
- Verify database exists and user has privileges
- Check MySQL service is running

### "Notion API error"

- Verify NOTION_API_KEY is correct
- Check database IDs are valid 32-character hex
- Ensure Notion integration has database access

### "CORS error in browser"

- Update ALLOWED_ORIGIN environment variable
- Check .htaccess CORS headers
- Verify frontend domain matches exactly

### "Rate limiting not working"

- Check MySQL connection
- Verify rate_limit_cache table was created
- Check database user has CREATE TABLE privilege

### "Session tokens not persisting"

- Verify Notion database has Session Token property
- Check property type is Text/Rich Text
- Ensure API key has write permissions

## 📝 Notion Database Schema

### Store Profile Properties

| Property Name   | Type     | Required | Description          |
| --------------- | -------- | -------- | -------------------- |
| Store ID        | Text     | Yes      | Unique identifier    |
| Store Name      | Text     | Yes      | Display name         |
| PIN Hash        | Text     | Yes      | Argon2id hash        |
| Role            | Select   | Yes      | staff/manager/admin  |
| Session Token   | Text     | No       | Current session      |
| Latitude        | Number   | No       | Store location       |
| Longitude       | Number   | No       | Store location       |
| Geofence Radius | Number   | No       | Meters (default 100) |
| Force Logout    | Checkbox | No       | Remote logout        |
| Last Login      | Date     | No       | Timestamp            |
| Last Logout     | Date     | No       | Timestamp            |

### Analytics & Logs Properties

| Property Name | Type   | Required | Description      |
| ------------- | ------ | -------- | ---------------- |
| Event Type    | Select | Yes      | login/logout/etc |
| Store ID      | Text   | Yes      | Associated store |
| Timestamp     | Date   | Yes      | Event time       |
| Metadata      | Text   | No       | JSON metadata    |

## 🔄 Updating the API

1. Backup current files
2. Upload new files via FTP/File Manager
3. Clear PHP OpCache if available
4. Test endpoints
5. Monitor error logs

## 📈 Monitoring

Enable error logging in production:

```php
// Add to config.php for production logging
ini_set('error_log', '/path/to/logs/php-errors.log');
```

Check logs regularly:

```bash
tail -f /path/to/logs/php-errors.log
```

## 🆘 Support

Common issues and solutions:

1. **500 Internal Server Error**: Check PHP error logs
2. **401 Unauthorized**: Verify session token is valid
3. **423 Locked**: Rate limit exceeded, wait 15 minutes
4. **403 Forbidden**: Check geofence coordinates

For Hostinger-specific issues, contact their support with error details.

## 📚 Additional Resources

- [Notion API Documentation](https://developers.notion.com/)
- [PHP Password Hashing](https://www.php.net/manual/en/function.password-hash.php)
- [Hostinger PHP Configuration](https://support.hostinger.com/en/articles/1583223-how-to-manage-php-settings)
- [CORS Configuration](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
