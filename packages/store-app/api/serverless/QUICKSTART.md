# Quick Deploy Guide - Serverless Auth

## Prerequisites

- Vercel or Netlify account
- Notion workspace with integration
- Node.js 18+ installed

## Endpoints Included

### Authentication

1. **POST /api/auth/login** - Authenticate with PIN
2. **POST /api/auth/logout** - Logout with reason tracking
3. **GET|POST /api/auth/validate** - Validate JWT token

### Store Operations

4. **GET /api/store/checklist** - Get checklist tasks
5. **POST /api/store/checklist** - Submit completed checklist
6. **GET /api/store/inventory** - Get inventory items
7. **POST /api/store/replacement** - Submit replacement request

### Admin

8. **GET /api/admin/dashboard** - Get dashboard statistics

## Step 1: Install Dependencies

```bash
cd store-app/api/serverless
npm install
```

## Step 2: Set Up Notion

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "Store Auth" and select your workspace
4. Copy the Internal Integration Token (starts with `secret_`)

## Step 3: Create Notion Databases

### Database 1: Store Users

| Property Name            | Type      | Options                          |
| ------------------------ | --------- | -------------------------------- |
| Store Name               | Title     | -                                |
| Store ID                 | Rich Text | -                                |
| PIN Hash                 | Rich Text | -                                |
| Status                   | Select    | Active, Inactive                 |
| Role                     | Select    | Manager, User, Admin, SuperAdmin |
| Last Login               | Date      | -                                |
| Latitude                 | Number    | Optional for geofencing          |
| Longitude                | Number    | Optional for geofencing          |
| Geofence Radius (meters) | Number    | Optional (default: 100)          |

### Database 2: Checklists

| Property Name             | Type      | Options                  |
| ------------------------- | --------- | ------------------------ |
| Task Name                 | Title     | -                        |
| Section                   | Select    | opening, closing, midday |
| Type                      | Select    | daily, weekly, period    |
| Task Order                | Number    | -                        |
| Description               | Rich Text | Optional                 |
| Status                    | Select    | Pending, Done            |
| Completed At              | Date      | -                        |
| Completed By              | Rich Text | -                        |
| Notes                     | Rich Text | Optional                 |
| Completion Time (minutes) | Number    | Optional                 |

### Database 3: Inventory

| Property Name   | Type      | Options                        |
| --------------- | --------- | ------------------------------ |
| Item Name       | Title     | -                              |
| Item Code       | Rich Text | -                              |
| Category        | Select    | entree, bowl, sides, drinks    |
| Status          | Select    | Active, Inactive, Discontinued |
| Standard Amount | Number    | Optional                       |
| Unit            | Select    | servings, items, pounds        |
| Notes           | Rich Text | Optional                       |

### Database 4: Replacements

| Property Name | Type      | Options                      |
| ------------- | --------- | ---------------------------- |
| Request ID    | Title     | -                            |
| Original Item | Relation  | Link to Inventory database   |
| Requested By  | Rich Text | -                            |
| Request Date  | Date      | -                            |
| Reason        | Rich Text | -                            |
| Priority      | Select    | Low, Medium, High            |
| Status        | Select    | Pending, Approved, Fulfilled |

### Database 5: Analytics Logs (Optional)

| Property Name | Type      | Options |
| ------------- | --------- | ------- |
| Event         | Title     | -       |
| Store ID      | Rich Text | -       |
| Store Name    | Rich Text | -       |
| Timestamp     | Date      | -       |
| Metadata      | Rich Text | -       |

**Important:** Share all databases with your integration!

## Step 4: Encrypt a PIN

Create a test PIN hash using the PHP tools or Node.js:

```javascript
const crypto = require("crypto");

function encryptPIN(pin, key) {
  const hash = crypto.createHash("sha256").update(pin).digest("hex");
  const iv = crypto.randomBytes(16);
  const keyBuffer = Buffer.from(key, "utf-8").subarray(0, 32);
  const cipher = crypto.createCipheriv("aes-256-cbc", keyBuffer, iv);
  let encrypted = cipher.update(hash, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
}

// Example: Generate PIN hash for "1234"
const ENCRYPTION_KEY = "your_32_character_encryption_key!";
const pinHash = encryptPIN("1234", ENCRYPTION_KEY);
console.log("PIN Hash:", pinHash);
```

Add this hash to the "PIN Hash" field in your Notion database.

## Step 5: Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel

# Set environment variables in dashboard:
# - NOTION_API_KEY
# - DB_STORE_USERS
# - DB_CHECKLISTS
# - DB_INVENTORY
# - DB_REPLACEMENTS
# - JWT_SECRET
# - ENCRYPTION_KEY
# - ALLOWED_ORIGINS
# - DB_ANALYTICS_LOGS (optional)
```

## Step 6: Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod

# Set environment variables:
netlify env:set NOTION_API_KEY "secret_xxx"
netlify env:set DB_STORE_USERS "database_id_xxx"
netlify env:set DB_CHECKLISTS "database_id_xxx"
netlify env:set DB_INVENTORY "database_id_xxx"
netlify env:set DB_REPLACEMENTS "database_id_xxx"
netlify env:set JWT_SECRET "your_jwt_secret_32_chars_min"
netlify env:set ENCRYPTION_KEY "your_encryption_key_32_chars"
netlify env:set ALLOWED_ORIGINS "https://yourdomain.com"
netlify env:set DB_ANALYTICS_LOGS "database_id_xxx"
```

## Step 7: Test

**Test Login:**

```bash
curl -X POST https://your-deployment.vercel.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"storeId":"STORE-001","pin":"1234"}'
```

Expected response:

```json
{
  "success": true,
  "token": "eyJhbGci...",
  "store": {
    "id": "notion-page-id",
    "storeId": "STORE-001",
    "name": "Downtown Store",
    "role": "manager"
  }
}
```

**Test Logout:**

```bash
curl -X POST https://your-deployment.vercel.app/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"reason":"manual"}'
```

**Test Validate:**

```bash
curl -X GET https://your-deployment.vercel.app/api/auth/validate \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test Get Checklist:**

```bash
curl -X GET "https://your-deployment.vercel.app/api/store/checklist?section=opening&type=daily" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test Submit Checklist:**

```bash
curl -X POST https://your-deployment.vercel.app/api/store/checklist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "checklistId": "opening-daily",
    "responses": [{"taskId": "task-id-1", "completed": true}],
    "completionTime": 15
  }'
```

**Test Get Inventory:**

```bash
curl -X GET "https://your-deployment.vercel.app/api/store/inventory?category=entree" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**Test Replacement Request:**

```bash
curl -X POST https://your-deployment.vercel.app/api/store/replacement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "itemId": "item-id-1",
    "reason": "Damaged item",
    "priority": "High"
  }'
```

**Test Admin Dashboard:**

```bash
curl -X GET https://your-deployment.vercel.app/api/admin/dashboard \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

## Step 8: Update Frontend

In `store-app/.env`:

```env
VITE_API_URL=https://your-deployment.vercel.app
```

Or for Netlify:

```env
VITE_API_URL=https://your-site.netlify.app
```

## Troubleshooting

**"Cannot find module '@notionhq/client'"**

- Run `npm install` in the serverless folder

**"Store not found"**

- Verify DB_STORE_USERS database ID is correct
- Check Store ID matches exactly (case-sensitive)
- Ensure database is shared with integration

**"Invalid PIN"**

- Verify ENCRYPTION_KEY matches the one used to encrypt
- Check PIN Hash format in Notion
- Re-encrypt PIN if key changed

**CORS errors**

- Add frontend domain to ALLOWED_ORIGINS
- Use comma-separated list: `https://domain1.com,https://domain2.com`

**Rate limiting issues**

- For production, upgrade to Redis-based storage
- Upstash Redis works great with serverless
- Or use Vercel KV / Netlify Blobs

## Security Checklist

- [ ] Use strong JWT_SECRET (32+ random characters)
- [ ] Use strong ENCRYPTION_KEY (exactly 32 characters)
- [ ] Keep API keys in environment variables only
- [ ] Enable HTTPS only (no HTTP)
- [ ] Set specific ALLOWED_ORIGINS (no wildcards)
- [ ] Monitor login attempts and failures
- [ ] Set up alerts for unusual patterns
- [ ] Regularly rotate secrets
- [ ] Use different keys per environment

## Monitoring

Track these metrics in your deployment platform:

- Login success rate
- Failed login attempts
- Average response time
- Function invocations
- Error rate
- Cold start frequency

Set up alerts for:

- Error rate > 5%
- Response time > 2s
- Failed logins spike
- Unusual IP patterns

---

**Need help?** Check the full documentation in `README.md`
