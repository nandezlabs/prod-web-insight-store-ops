# Local Development Server

## Quick Start

```bash
cd packages/store-app/api/serverless
npm run dev
```

The server will start at `http://localhost:8888`

## Environment Setup

Make sure your `.env` files are configured:

**Admin App** (`.env`):

```env
VITE_API_URL=http://localhost:8888/api
```

**Store App** (`.env`):

```env
VITE_API_URL=http://localhost:8888/api
```

**Serverless Functions** (`/packages/store-app/api/serverless/.env`):

```env
NOTION_API_KEY=secret_xxx
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_32_char_encryption_key_here
# See .env.example for full configuration
```

## Available Endpoints

Once running, the following endpoints are available:

### Authentication

- `POST /api/auth/login` - Store user login
- `POST /api/auth/logout` - Store user logout
- `GET /api/auth/validate` - Validate JWT token
- `POST /api/auth/validate` - Validate JWT token

### Store Operations

- `GET /api/store/checklist` - Get checklists
- `POST /api/store/checklist` - Submit checklist
- `GET /api/store/inventory` - Get inventory items
- `POST /api/store/replacement` - Submit replacement request

### Admin Operations

- `GET /api/admin/dashboard` - Get analytics data
- `POST /api/admin/force-logout` - Force logout a store
- `GET /api/admin/forms` - Get forms
- `POST /api/admin/forms` - Create/update forms

## Health Check

```bash
curl http://localhost:8888/health
```

## Troubleshooting

### Server won't start

**Issue**: `Cannot find module './auth-login.js'`

**Solution**: The dev-server imports `.ts` files directly. Make sure line 35-43 in `dev-server.ts` imports `.ts` extensions:

```typescript
const functions: Record<string, any> = {
  "auth-login": await import("./auth-login.ts"),
  "auth-logout": await import("./auth-logout.ts"),
  // ... etc
};
```

### Port already in use

**Solution**: Kill existing process:

```bash
lsof -ti:8888 | xargs kill -9
```

Or use a different port:

```bash
PORT=9999 npm run dev
```

### CORS errors

**Solution**: Add your frontend URL to `ALLOWED_ORIGINS` in `.env`:

```env
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

## Production Deployment

For production, deploy to Vercel or Netlify. See main README.md for deployment instructions.

## NPM Scripts

- `npm run dev` - Start development server with tsx (hot reload)
- `npm run test` - Run tests
- `npm start` - Start production build (requires compilation)
