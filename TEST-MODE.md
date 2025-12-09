# 🧪 Test Mode Guide

## Quick Start

### Run Apps in Test Mode

**Admin App:**

```bash
cd packages/admin-app
npm run test:mode
```

**Store App:**

```bash
cd packages/store-app
npm run test:mode
```

## Features

### ⚡ Auto-Login

When `VITE_ENABLE_AUTO_LOGIN=true`, apps will automatically log in after 500ms

### 🚀 Quick Login Button

- Appears in both development and test modes
- Pre-fills credentials
- One-click login

### 🎯 Test Credentials

**Admin App:**

- Email: `admin@test.com`
- Password: `Test123!`

**Store App:**

- PIN: `1234`
- Store ID: `test-store-001`

## Configuration

### Admin App (.env.test)

```bash
VITE_APP_MODE=test
VITE_API_URL=http://localhost:3000/api
VITE_APP_NAME=Admin Dashboard (TEST MODE)
VITE_ENABLE_AUTO_LOGIN=true
VITE_TEST_EMAIL=admin@test.com
VITE_TEST_PASSWORD=Test123!
```

### Store App (.env.test)

```bash
VITE_APP_MODE=test
VITE_API_URL=http://localhost:8000/api
VITE_APP_NAME=Store Operations App (TEST MODE)
VITE_ENABLE_AUTO_LOGIN=true
VITE_TEST_PIN=1234
VITE_TEST_STORE_ID=test-store-001
```

## Modes Comparison

| Mode                         | Quick Login | Auto-Login  | Production Build |
| ---------------------------- | ----------- | ----------- | ---------------- |
| Development (`npm run dev`)  | ✅ Yes      | ❌ No       | ❌ No            |
| Test (`npm run test:mode`)   | ✅ Yes      | ✅ Optional | ❌ No            |
| Production (`npm run build`) | ❌ No       | ❌ No       | ✅ Yes           |

## Custom Test Credentials

Edit `.env.test` files to use different credentials:

```bash
# Admin App
VITE_TEST_EMAIL=custom@test.com
VITE_TEST_PASSWORD=CustomPass123!

# Store App
VITE_TEST_PIN=9876
VITE_TEST_STORE_ID=store-xyz
```

## Disable Auto-Login

Set in `.env.test`:

```bash
VITE_ENABLE_AUTO_LOGIN=false
```

Quick Login button will still appear, but won't auto-login on page load.

## Build Test Version

Create a build with test mode enabled:

```bash
npm run build:test
```

This creates a production-optimized build that includes test mode features.
