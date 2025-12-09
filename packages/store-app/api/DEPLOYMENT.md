# Deployment Checklist

Complete checklist for deploying the Store App PHP API to Hostinger.

## 📋 Pre-Deployment

### Local Testing

- [ ] Test all API endpoints locally
- [ ] Verify PIN hash generation
- [ ] Validate encryption/decryption
- [ ] Test rate limiting
- [ ] Check geofence calculations
- [ ] Verify Notion API integration

### Environment Preparation

- [ ] Create Hostinger hosting account
- [ ] Enable SSL certificate (HTTPS)
- [ ] Set up MySQL database
- [ ] Configure PHP version (7.4+)
- [ ] Install required PHP extensions

## 🔧 Hostinger Setup

### 1. Database Configuration

- [ ] Create MySQL database via Hostinger control panel
- [ ] Create database user with strong password
- [ ] Grant all privileges to user
- [ ] Import schema.sql
- [ ] Verify tables created successfully
- [ ] Test database connection

### 2. File Upload

- [ ] Upload all files to `public_html/api/`
- [ ] Set file permissions:
  - [ ] Directories: 755
  - [ ] PHP files: 644
  - [ ] .htaccess: 644
- [ ] Verify file structure is intact
- [ ] Delete .env.example from server

### 3. Environment Variables

In Hostinger → Advanced → PHP Configuration → PHP Options:

- [ ] `NOTION_API_KEY` - Notion integration token
- [ ] `DB_STORE_PROFILE` - Store Profile database ID
- [ ] `DB_CHECKLISTS` - Checklists database ID
- [ ] `DB_INVENTORY` - Inventory database ID
- [ ] `DB_REPLACEMENTS` - Replacements database ID
- [ ] `DB_FORM_DEFINITIONS` - Form Definitions database ID
- [ ] `DB_MARKET_INTEL` - Market Intel database ID
- [ ] `DB_ANALYTICS_LOGS` - Analytics & Logs database ID
- [ ] `ENCRYPTION_KEY` - Generated 32-byte key (base64)
- [ ] `DB_HOST` - Usually `localhost`
- [ ] `DB_NAME` - Your database name
- [ ] `DB_USER` - Database username
- [ ] `DB_PASSWORD` - Database password
- [ ] `ALLOWED_ORIGIN` - Frontend domain (https://...)
- [ ] `DEBUG_MODE` - Set to `false`

### 4. Generate Keys

Run locally and add to environment:

```bash
# Generate encryption key
php generate-key.php

# Generate PIN hash for each store
php generate-pin.php 1234
```

- [ ] Encryption key added to environment
- [ ] PIN hashes generated for all stores

## 🗄️ Notion Configuration

### Store Profile Database

Create properties:

- [ ] Store ID (Text)
- [ ] Store Name (Text)
- [ ] PIN Hash (Text)
- [ ] Role (Select: staff, manager, admin)
- [ ] Session Token (Text)
- [ ] Latitude (Number)
- [ ] Longitude (Number)
- [ ] Geofence Radius (Number)
- [ ] Force Logout (Checkbox)
- [ ] Last Login (Date)
- [ ] Last Logout (Date)

### Analytics & Logs Database

Create properties:

- [ ] Event Type (Select: login, logout, create, update, delete)
- [ ] Store ID (Text)
- [ ] Timestamp (Date)
- [ ] Metadata (Text)

### Other Databases

Add to all operational databases:

- [ ] Store ID (Text) - for filtering by store

### Initial Data

- [ ] Create at least one store profile
- [ ] Add Store ID, Name, and PIN Hash
- [ ] Set coordinates and geofence radius
- [ ] Set role to 'manager' or 'admin'
- [ ] Verify all properties are correct

### API Integration

- [ ] Get Notion API key from https://www.notion.so/my-integrations
- [ ] Share all databases with the integration
- [ ] Copy database IDs from URLs
- [ ] Test connection with NotionClient

## 🧪 Testing

### API Endpoints

Test each endpoint with curl or Postman:

```bash
# Base URL
BASE_URL="https://yourdomain.com/api"

# 1. Test login
curl -X POST "$BASE_URL/auth.php?action=login" \
  -H "Content-Type: application/json" \
  -d '{"storeId":"STORE-001","pin":"1234","latitude":40.7128,"longitude":-74.0060}'
```

- [ ] Login with valid credentials
- [ ] Login with invalid PIN
- [ ] Login with wrong store ID
- [ ] Login outside geofence
- [ ] Trigger rate limiting (6 failed attempts)
- [ ] Validate session token
- [ ] Logout
- [ ] Validate invalidated session

### Notion Proxy

- [ ] Query database with valid session
- [ ] Query without session token (should fail)
- [ ] Create page
- [ ] Update page
- [ ] Get page
- [ ] Test role-based access control

### Security

- [ ] Verify HTTPS redirect works
- [ ] Check security headers in response
- [ ] Test CORS with frontend domain
- [ ] Test CORS with unauthorized domain (should fail)
- [ ] Verify .htaccess is active
- [ ] Check PHP errors are hidden

### Performance

- [ ] Test response times (< 1 second)
- [ ] Verify database queries are optimized
- [ ] Check Notion API rate limits
- [ ] Test concurrent requests

## 🔒 Security Hardening

### Server Configuration

- [ ] Disable directory listing
- [ ] Hide PHP version
- [ ] Disable dangerous PHP functions
- [ ] Set appropriate PHP memory limits
- [ ] Configure session security
- [ ] Enable OpCache for performance

### File Security

- [ ] Remove generate-pin.php from server
- [ ] Remove generate-key.php from server
- [ ] Verify .htaccess protects config.php
- [ ] Check .env files are not accessible
- [ ] Ensure backup files are excluded

### Monitoring

- [ ] Set up error logging
- [ ] Configure log rotation
- [ ] Monitor rate limit table size
- [ ] Set up uptime monitoring
- [ ] Configure alert notifications

## 🚀 Frontend Integration

### Update Configuration

In your frontend code:

```typescript
// src/features/auth/services/authService.ts
const API_BASE_URL = "https://yourdomain.com/api";
```

- [ ] Update API base URL
- [ ] Test login flow
- [ ] Verify session persistence
- [ ] Test logout functionality
- [ ] Check error handling
- [ ] Verify rate limiting UI
- [ ] Test geolocation integration

### CORS Verification

- [ ] Frontend can make requests
- [ ] Credentials are included
- [ ] Preflight requests work
- [ ] Error messages display correctly

## 📊 Post-Deployment

### Verification

- [ ] Test full user flow (login → use app → logout)
- [ ] Verify Notion data updates
- [ ] Check audit logs are created
- [ ] Monitor server logs for errors
- [ ] Test on actual tablet device
- [ ] Verify geolocation works on device

### Documentation

- [ ] Document environment variables
- [ ] Save encryption key securely
- [ ] Document Notion database schema
- [ ] Create runbook for common issues
- [ ] Document backup procedures

### Backup

- [ ] Backup database
- [ ] Backup PHP files
- [ ] Backup environment variables (securely)
- [ ] Document restore procedures

## 🔄 Maintenance

### Regular Tasks

- [ ] Monitor error logs weekly
- [ ] Clean up rate limit table monthly
- [ ] Review audit logs monthly
- [ ] Update dependencies quarterly
- [ ] Rotate encryption keys annually
- [ ] Review and update PIN hashes as needed

### Monitoring Setup

- [ ] Uptime monitoring (e.g., UptimeRobot)
- [ ] Error tracking (logs)
- [ ] Performance monitoring
- [ ] Database size monitoring
- [ ] API usage tracking

## 🆘 Emergency Procedures

### If Compromised

1. [ ] Force logout all users (set Force Logout flag in Notion)
2. [ ] Rotate encryption key
3. [ ] Reset all PIN hashes
4. [ ] Review audit logs
5. [ ] Update ALLOWED_ORIGIN if needed
6. [ ] Check for unauthorized database changes

### If Database Down

1. [ ] Check database connection
2. [ ] Verify credentials
3. [ ] Check disk space
4. [ ] Review error logs
5. [ ] Contact Hostinger support

### If Notion API Down

1. [ ] Check Notion status page
2. [ ] Verify API key is valid
3. [ ] Check rate limits
4. [ ] Review error logs
5. [ ] Implement fallback if needed

## ✅ Final Checklist

Before going live:

- [ ] All environment variables set correctly
- [ ] HTTPS enforced and working
- [ ] Database configured and accessible
- [ ] Notion integration working
- [ ] All tests passing
- [ ] Error logging configured
- [ ] Frontend updated with API URL
- [ ] CORS configured correctly
- [ ] Debug mode disabled
- [ ] Backup procedures in place
- [ ] Documentation complete
- [ ] Team trained on system

## 📞 Support Contacts

- Hostinger Support: https://www.hostinger.com/support
- Notion Support: https://www.notion.so/help
- PHP Documentation: https://www.php.net/docs.php

---

**Date Deployed:** ******\_\_\_******

**Deployed By:** ******\_\_\_******

**Version:** 1.0.0
