# Serverless Authentication Functions

This directory contains serverless functions for store authentication, deployed to Vercel or Netlify.

## Endpoints

### Authentication Endpoints

#### 1. Login - `POST /api/auth/login`

Authenticates store users with PIN and returns JWT token.

#### 2. Logout - `POST /api/auth/logout`

Logs out authenticated users and tracks logout reason.

#### 3. Validate Session - `GET|POST /api/auth/validate`

Validates JWT token and returns user information with current store status.

### Store Endpoints

#### 4. Get Checklist - `GET /api/store/checklist`

Retrieves checklist tasks filtered by section and type.

#### 5. Submit Checklist - `POST /api/store/checklist`

Submits completed checklist with task responses.

#### 6. Get Inventory - `GET /api/store/inventory`

Retrieves active inventory items with optional category filtering.

#### 7. Submit Replacement Request - `POST /api/store/replacement`

Creates replacement request for inventory items.

### Admin Endpoints

#### 8. Dashboard Stats - `GET /api/admin/dashboard`

Retrieves aggregated statistics for admin dashboard (requires admin role).

## Features

- ✅ PIN-based authentication
- ✅ JWT token generation & validation
- ✅ Rate limiting (10-100 requests/hour depending on endpoint)
- ✅ CORS support
- ✅ Analytics logging
- ✅ Secure PIN verification
- ✅ Status validation
- ✅ Logout tracking with reasons
- ✅ Checklist management
- ✅ Inventory filtering
- ✅ Replacement request tracking
- ✅ Admin dashboard statistics
- ✅ Geofence data support

## Deployment

### Vercel

1. Install Vercel CLI:

```bash
npm i -g vercel
```

2. Deploy:

```bash
cd store-app/api/serverless
vercel
```

3. Set environment variables in Vercel dashboard:

```
NOTION_API_KEY=secret_xxx
DB_STORE_USERS=database_id_xxx
DB_CHECKLISTS=database_id_xxx
DB_INVENTORY=database_id_xxx
DB_REPLACEMENTS=database_id_xxx
JWT_SECRET=your_jwt_secret_32_chars_min
ENCRYPTION_KEY=your_encryption_key_32_chars
ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com
DB_ANALYTICS_LOGS=database_id_xxx
```

4. Access endpoint:

```
POST https://your-project.vercel.app/api/auth/login
```

### Netlify

1. Install Netlify CLI:

```bash
npm i -g netlify-cli
```

2. Create `netlify.toml` in project root:

```toml
[build]
  functions = "store-app/api/serverless"

[functions]
  node_bundler = "esbuild"

[[redirects]]
  from = "/api/auth/login"
  to = "/.netlify/functions/auth-login"
  status = 200
```

3. Deploy:

```bash
netlify deploy --prod
```

4. Set environment variables in Netlify dashboard or via CLI:

```bash
netlify env:set NOTION_API_KEY "secret_xxx"
netlify env:set DB_STORE_USERS "database_id_xxx"
netlify env:set DB_CHECKLISTS "database_id_xxx"
netlify env:set DB_INVENTORY "database_id_xxx"
netlify env:set DB_REPLACEMENTS "database_id_xxx"
netlify env:set JWT_SECRET "your_jwt_secret"
netlify env:set ENCRYPTION_KEY "your_encryption_key"
netlify env:set ALLOWED_ORIGINS "https://yourdomain.com"
netlify env:set DB_ANALYTICS_LOGS "database_id_xxx"
```

5. Access endpoint:

```
POST https://your-site.netlify.app/api/auth/login
```

## API Usage

### 1. Login

**Request:**

```bash
curl -X POST https://your-domain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "storeId": "STORE-001",
    "pin": "1234"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "store": {
    "id": "notion-page-id",
    "storeId": "STORE-001",
    "name": "Downtown Store",
    "role": "manager"
  }
}
```

### 2. Logout

**Request:**

```bash
curl -X POST https://your-domain.com/api/auth/logout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "reason": "manual"
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

**Logout Reasons:**

- `manual` - User clicked logout
- `geofence` - User left geofenced area
- `admin` - Admin forced logout

### 3. Validate Session

**Request:**

```bash
curl -X GET https://your-domain.com/api/auth/validate \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "success": true,
  "valid": true,
  "store": {
    "id": "notion-page-id",
    "storeId": "STORE-001",
    "name": "Downtown Store",
    "role": "Manager",
    "status": "Active",
    "geofence": {
      "latitude": 40.7128,
      "longitude": -74.006,
      "radius": 100
    }
  },
  "expiresAt": "2025-12-09T12:00:00.000Z"
}
```

### 4. Get Checklist

**Request:**

```bash
curl -X GET "https://your-domain.com/api/store/checklist?section=opening&type=daily" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Query Parameters:**

- `section` (required): opening, closing, or midday
- `type` (required): daily, weekly, or period

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "task-id-1",
      "section": "opening",
      "type": "daily",
      "taskName": "Unlock doors",
      "taskOrder": 1,
      "description": "Unlock front and back doors",
      "status": "Pending"
    },
    {
      "id": "task-id-2",
      "section": "opening",
      "type": "daily",
      "taskName": "Turn on lights",
      "taskOrder": 2
    }
  ],
  "count": 2
}
```

### 5. Submit Checklist

**Request:**

```bash
curl -X POST https://your-domain.com/api/store/checklist \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "checklistId": "checklist-opening-daily",
    "responses": [
      {
        "taskId": "task-id-1",
        "completed": true,
        "notes": "Completed at 8:00 AM"
      },
      {
        "taskId": "task-id-2",
        "completed": true
      }
    ],
    "completionTime": 15
  }'
```

**Success Response (200):**

```json
{
  "success": true,
  "message": "Checklist submitted successfully",
  "tasksUpdated": 2
}
```

### 6. Get Inventory

**Request:**

```bash
# Get all active inventory
curl -X GET https://your-domain.com/api/store/inventory \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Filter by category
curl -X GET "https://your-domain.com/api/store/inventory?category=entree" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Success Response (200):**

```json
{
  "success": true,
  "data": [
    {
      "id": "item-id-1",
      "itemCode": "ENT-001",
      "itemName": "Chicken Bowl",
      "category": "entree",
      "status": "Active",
      "standardAmount": 50,
      "unit": "servings",
      "notes": "Popular item"
    }
  ],
  "count": 1,
  "filters": {
    "status": "Active",
    "category": "entree"
  }
}
```

### 7. Submit Replacement Request

**Request:**

```bash
curl -X POST https://your-domain.com/api/store/replacement \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -d '{
    "itemId": "item-id-1",
    "reason": "Item damaged during delivery",
    "priority": "High"
  }'
```

**Priority Options:**

- `Low` - Can wait for next delivery
- `Medium` - Needed within 24-48 hours
- `High` - Urgent replacement needed

**Success Response (201):**

```json
{
  "success": true,
  "requestId": "550e8400-e29b-41d4-a716-446655440000",
  "message": "Replacement request submitted successfully"
}
```

### 8. Admin Dashboard Stats

**Request:**

```bash
curl -X GET https://your-domain.com/api/admin/dashboard \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Note:** Requires admin or superadmin role in JWT token.

**Success Response (200):**

```json
{
  "success": true,
  "data": {
    "checklists": {
      "completedToday": 12,
      "completedThisWeek": 84,
      "averageCompletionTime": 18.5
    },
    "stores": {
      "totalActive": 15
    },
    "replacements": {
      "pendingRequests": 3
    }
  },
  "generatedAt": "2025-12-08T10:30:00.000Z"
}
```

### Common Error Responses

**400 - Bad Request**

```json
{
  "success": false,
  "error": "Store ID and PIN are required"
}
```

**401 - Unauthorized**

```json
{
  "success": false,
  "error": "Invalid PIN"
}
```

OR

```json
{
  "success": false,
  "error": "Invalid or expired token"
}
```

**403 - Forbidden**

```json
{
  "success": false,
  "error": "Store account is not active"
}
```

**404 - Not Found**

```json
{
  "success": false,
  "error": "Store not found"
}
```

**429 - Too Many Requests**

```json
{
  "success": false,
  "error": "Too many login attempts. Please try again in 15 minutes."
}
```

**500 - Internal Server Error**

```json
{
  "success": false,
  "error": "Internal server error"
}
```

## Environment Variables

| Variable            | Required | Description                                     |
| ------------------- | -------- | ----------------------------------------------- |
| `NOTION_API_KEY`    | ✅       | Notion integration API key                      |
| `DB_STORE_USERS`    | ✅       | Notion database ID for store users              |
| `DB_CHECKLISTS`     | ✅       | Notion database ID for checklist tasks          |
| `DB_INVENTORY`      | ✅       | Notion database ID for inventory items          |
| `DB_REPLACEMENTS`   | ✅       | Notion database ID for replacement requests     |
| `JWT_SECRET`        | ✅       | Secret key for JWT signing (min 32 chars)       |
| `ENCRYPTION_KEY`    | ✅       | Key for PIN encryption (32 chars)               |
| `ALLOWED_ORIGINS`   | ✅       | Comma-separated list of allowed CORS origins    |
| `DB_ANALYTICS_LOGS` | ⚠️       | Optional: Notion database ID for analytics logs |

## Notion Database Schema

### Store Users Database

Required properties:

- **Store ID** (Rich Text) - Unique store identifier
- **Store Name** (Title) - Display name
- **PIN Hash** (Rich Text) - Encrypted PIN hash
- **Status** (Select) - Options: Active, Inactive
- **Role** (Select) - Options: Manager, User, Admin, SuperAdmin
- **Last Login** (Date) - Updated on each successful login
- **Latitude** (Number) - Optional: Store latitude for geofencing
- **Longitude** (Number) - Optional: Store longitude for geofencing
- **Geofence Radius (meters)** (Number) - Optional: Radius in meters (default: 100)

### Checklists Database

Required properties:

- **Task Name** (Title) - Name of the checklist task
- **Section** (Select) - Options: opening, closing, midday
- **Type** (Select) - Options: daily, weekly, period
- **Task Order** (Number) - Order in which tasks should appear
- **Description** (Rich Text) - Optional: Detailed task description
- **Status** (Select) - Options: Pending, Done
- **Completed At** (Date) - Timestamp when task was completed
- **Completed By** (Rich Text) - Store name and ID who completed
- **Notes** (Rich Text) - Optional: Completion notes
- **Completion Time (minutes)** (Number) - Optional: Time taken to complete

### Inventory Database

Required properties:

- **Item Name** (Title) - Name of inventory item
- **Item Code** (Rich Text) - Unique item identifier
- **Category** (Select) - Options: entree, bowl, sides, drinks, etc.
- **Status** (Select) - Options: Active, Inactive, Discontinued
- **Standard Amount** (Number) - Optional: Standard quantity
- **Unit** (Select) - Optional: servings, items, pounds, etc.
- **Notes** (Rich Text) - Optional: Additional information

### Replacements Database

Required properties:

- **Request ID** (Title) - Unique UUID for the request
- **Original Item** (Relation) - Link to Inventory database
- **Requested By** (Rich Text) - Store name and ID
- **Request Date** (Date) - When request was created
- **Reason** (Rich Text) - Why replacement is needed
- **Priority** (Select) - Options: Low, Medium, High
- **Status** (Select) - Options: Pending, Approved, Fulfilled, Rejected

### Analytics Logs Database (Optional)

Properties:

- **Event** (Title) - Event type: login, logout, form_submit, item_replace
- **Store ID** (Rich Text)
- **Store Name** (Rich Text)
- **Timestamp** (Date)
- **Metadata** (Rich Text) - JSON with event-specific data

## Security Considerations

1. **Rate Limiting**: In-memory storage resets on function cold starts. For production, use:

   - Redis (Upstash for serverless)
   - Vercel KV
   - Netlify Blob stores

2. **JWT Tokens**:

   - 24-hour expiration
   - Store in httpOnly cookies for better security
   - Implement token refresh mechanism

3. **PIN Storage**:

   - Never store plain text PINs
   - Use same encryption as PHP implementation
   - Consider additional salt per store

4. **CORS**:

   - Whitelist specific origins
   - Don't use wildcards in production

5. **Logging**:
   - Log all authentication attempts
   - Monitor for brute force attacks
   - Set up alerts for unusual patterns

## Testing

### Local Testing with Vercel

```bash
cd store-app/api/serverless
npm install
vercel dev
```

Test endpoint: `http://localhost:3000/api/auth/login`

### Local Testing with Netlify

```bash
netlify dev
```

Test endpoint: `http://localhost:8888/api/auth/login`

## Integration with Store App

Update `store-app/src/services/api.ts`:

```typescript
const API_URL = import.meta.env.VITE_API_URL || "https://your-domain.com";

export async function login(storeId: string, pin: string) {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ storeId, pin }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Login failed");
  }

  return response.json();
}
```

## Monitoring

Track these metrics:

- Login/logout success rates
- Failed login attempts by IP
- Average response time per endpoint
- Rate limit hits
- Function cold starts
- Error rates by endpoint
- Token expiration patterns

## Troubleshooting

**Issue**: "Store not found" for valid store

- Check DB_STORE_USERS database ID is correct
- Verify Store ID matches exactly (case-sensitive)
- Ensure Notion integration has access to database

**Issue**: "Invalid PIN" for correct PIN

- Verify ENCRYPTION_KEY matches the one used to encrypt PINs
- Check PIN Hash format in Notion (should be `iv:encrypted`)
- Re-encrypt PINs if key changed

**Issue**: "Invalid or expired token"

- Check JWT_SECRET matches across all functions
- Verify token hasn't expired (24-hour limit)
- Ensure Authorization header format: `Bearer <token>`

**Issue**: Rate limiting too aggressive

- Adjust limits in checkRateLimit function
- Implement persistent storage (Redis)
- Add IP whitelist for internal testing

**Issue**: CORS errors

- Add frontend domain to ALLOWED_ORIGINS
- Check origin is sent in request headers
- Verify no typos in domain names
