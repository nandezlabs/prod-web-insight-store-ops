# 🚀 Quick Start Guide - Running Your Apps

## Current Status ✅

Both apps are ready to run! The TypeScript errors you see are **expected** and only apply to the serverless functions (for deployment to Vercel/Netlify). They don't affect your local development.

---

## 📍 Where to Enter Your API Keys

### Option 1: Frontend Apps (Currently Active)

Your apps already have `.env` files configured:

#### **Admin App** (`/admin-app/.env`)

```bash
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Admin Dashboard
VITE_APP_VERSION=1.0.0
```

#### **Store App** (`/store-app/.env`)

```bash
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Store Operations App
VITE_APP_VERSION=0.0.1
```

**To update these:**

```bash
# Edit the files directly:
code admin-app/.env
code store-app/.env
```

---

### Option 2: Serverless Functions (For Production Deployment)

When you deploy the serverless functions to Vercel or Netlify, you'll need to set these environment variables:

**Location:** `/store-app/api/serverless/.env.example` (copy to `.env` for local testing)

**Required Variables:**

```bash
# Notion API Configuration
NOTION_API_KEY=secret_your_notion_api_key_here

# Notion Database IDs
DB_STORE_USERS=your_store_users_database_id_here
DB_CHECKLISTS=your_checklists_database_id_here
DB_INVENTORY=your_inventory_database_id_here
DB_REPLACEMENTS=your_replacements_database_id_here
DB_FORMS=your_forms_database_id_here
DB_ANALYTICS_LOGS=your_analytics_logs_database_id_here

# Security Keys
JWT_SECRET=your_jwt_secret_min_32_characters_long
ENCRYPTION_KEY=exactly_32_characters_for_aes256

# CORS Configuration
ALLOWED_ORIGINS=http://localhost:3000,https://yourdomain.com
```

---

## 🏃 How to Run Your Apps

### Admin App

```bash
cd admin-app
npm install          # Only needed first time
npm run dev          # Starts on http://localhost:5173
```

### Store App

```bash
cd store-app
npm install          # Only needed first time
npm run dev          # Starts on http://localhost:3000
```

---

## ❌ About Those TypeScript Errors

The errors you see are in `/store-app/api/serverless/` - these are **serverless backend functions** for production deployment. They're supposed to have these errors because:

1. **Missing dependencies** - Run `npm install` in the serverless folder to fix:

   ```bash
   cd store-app/api/serverless
   npm install
   ```

2. **These don't affect your frontend apps** - The React apps in `admin-app` and `store-app` run independently.

3. **Only needed for production** - When you deploy to Vercel/Netlify, they'll install dependencies automatically.

---

## ✅ What You Can Do Right Now

### 1. Run Both Apps Locally (No API Keys Needed)

```bash
# Terminal 1
cd admin-app && npm run dev

# Terminal 2
cd store-app && npm run dev
```

The apps will run with mock data and local state management.

---

### 2. Set Up Notion Integration (For Real Data)

**Step 1:** Get Notion API Key

1. Go to https://www.notion.so/my-integrations
2. Click "New integration"
3. Name it "Insight Store Manager"
4. Copy the **Internal Integration Token** (starts with `secret_`)

**Step 2:** Create Notion Databases
Follow the schemas in `/store-app/api/serverless/README.md`:

- Store Users
- Checklists
- Inventory
- Replacements
- Forms
- Analytics Logs

**Step 3:** Configure Serverless Functions

```bash
cd store-app/api/serverless
cp .env.example .env
# Edit .env with your Notion keys
```

**Step 4:** Deploy

```bash
# Option A: Vercel
vercel

# Option B: Netlify
netlify deploy --prod
```

**Step 5:** Update Frontend Apps
Update your frontend `.env` files to point to deployed functions:

```bash
# admin-app/.env
VITE_API_URL=https://your-deployment.vercel.app/api

# store-app/.env
VITE_API_URL=https://your-deployment.vercel.app/api
```

---

## 🔧 Fixing the Serverless TypeScript Errors (Optional)

If you want to clear the errors for development:

```bash
cd store-app/api/serverless
npm install
```

This installs:

- `@notionhq/client` - Notion API SDK
- `@types/node` - Node.js type definitions
- `vitest` - Testing framework

---

## 📝 Summary

**To just run the apps:**

- ✅ Both `.env` files already exist
- ✅ No API keys needed for local development
- ✅ Just run `npm run dev` in each app

**To connect to Notion:**

- 📍 Get API key from https://www.notion.so/my-integrations
- 📍 Add to `/store-app/api/serverless/.env`
- 📍 Deploy serverless functions
- 📍 Update frontend `.env` files with deployment URL

**TypeScript errors:**

- ⚠️ Only affect serverless functions
- ⚠️ Don't prevent frontend apps from running
- ⚠️ Fixed by running `npm install` in serverless folder

# Architecture & Onboarding (2025 Update)

## Monorepo Structure

- `admin-app/` – Admin dashboard (React, Vite)
- `store-app/` – Store-facing app (React, Vite)
- `packages/ui/` – Shared UI components (Button, Input, Card, etc.)
- `packages/shared-types/` – Shared TypeScript types
- `packages/shared-utils/` – Shared utility functions

## Getting Started

1. Clone the repo
2. Install dependencies:
   ```sh
   npm install
   ```
3. Start development:
   ```sh
   npm run dev --workspace packages/admin-app
   npm run dev --workspace packages/store-app
   ```

## Adding Shared UI Components

- Add new components to `packages/ui/src/`
- Export them in `packages/ui/src/index.ts`
- Document and preview in Storybook

## Testing

- Use Vitest for unit tests
- Add tests in `__tests__` folders

## CI/CD

- Automated checks for lint, type, test, accessibility, and bundle size
- See `.github/workflows/` for pipeline config

## Accessibility & Performance

- Use Storybook a11y addon and Lighthouse for audits
- Follow WCAG 2.1 AA guidelines

## Contributing

- Follow code style and PR guidelines in `CONTRIBUTING.md`
