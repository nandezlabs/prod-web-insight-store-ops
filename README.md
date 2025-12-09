# Insight - Store Operations Platform

[![Production](https://img.shields.io/badge/status-production-green)](https://github.com/nandezlabs/prod-web-insight-store-ops)
[![React](https://img.shields.io/badge/React-18-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.3-blue)](https://www.typescriptlang.org/)
[![Notion API](https://img.shields.io/badge/Notion-API-black)](https://developers.notion.com/)

A complete store operations management platform with Notion integration. Manage users, stores, inventory, tasks, P&L reports, and real-time messaging in one unified system.

**Repository**: [nandezlabs/prod-web-insight-store-ops](https://github.com/nandezlabs/prod-web-insight-store-ops)

## 🏗️ Monorepo Structure

```
Insight/
├── packages/
│   ├── admin-app/           # Desktop admin dashboard (React + TypeScript)
│   ├── store-app/           # Tablet store operations app (React + TypeScript + PWA)
│   ├── shared-types/        # Common TypeScript type definitions
│   └── shared-utils/        # Shared utility functions
├── package.json             # Root workspace configuration
└── README.md               # This file
```

## 📦 Packages

### @insight/admin-app

Desktop-optimized admin dashboard for managing stores, inventory, forms, replacements, and P&L reports.

**Tech Stack:**

- React 18, TypeScript, Vite
- TailwindCSS, Radix UI
- Zustand, TanStack Query
- Recharts for analytics

**Port:** 5173

### @insight/store-app

Tablet-optimized PWA for store operations with offline support.

**Tech Stack:**

- React 18, TypeScript, Vite
- TailwindCSS, Framer Motion
- Zustand, IndexedDB
- Service Workers for offline

**Port:** 3000

### @insight/shared-types

Common TypeScript type definitions shared across applications.

**Includes:**

- Authentication types
- User, Store, Form types
- Inventory, Checklist, Replacement types
- Analytics and API types

### @insight/shared-utils

Shared utility functions for common operations.

**Includes:**

- Date formatting and validation
- Form validation
- Currency and number formatting
- Storage utilities (localStorage/sessionStorage)
- Crypto utilities
- Geolocation helpers

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm 9+

### Installation

```bash
# Install all dependencies for all packages
npm install
```

This will automatically install dependencies for all packages in the workspace.

### Development

```bash
# Run both apps in development mode
npm run dev

# Run admin app only
npm run dev:admin

# Run store app only
npm run dev:store
```

### Building

```bash
# Build all packages
npm run build

# Build specific packages
npm run build:types      # Build shared-types
npm run build:utils      # Build shared-utils
npm run build:admin      # Build admin-app
npm run build:store      # Build store-app
```

### Running Individual Apps

#### Admin App

```bash
cd packages/admin-app
npm run dev              # http://localhost:5173
npm run build
npm run preview
```

#### Store App

```bash
cd packages/store-app
npm run dev              # http://localhost:3000
npm run build
npm run preview
```

## 📚 Documentation

- [ARCHITECTURE.md](./ARCHITECTURE.md) - System architecture overview
- [PRODUCTION_READINESS_REPORT.md](./PRODUCTION_READINESS_REPORT.md) - Production status
- [REFACTORING-SUMMARY.md](./REFACTORING-SUMMARY.md) - Code refactoring details
- [SETUP-GUIDE.md](./SETUP-GUIDE.md) - Quick setup guide

### Package Documentation

- [Admin App README](./packages/admin-app/README.md)
- [Store App README](./packages/store-app/README.md)
- [Shared Types README](./packages/shared-types/README.md)
- [Shared Utils README](./packages/shared-utils/README.md)

## 🛠️ Development Workflow

### Adding Dependencies

```bash
# Add to specific package
npm install <package> -w @insight/admin-app
npm install <package> -w @insight/store-app

# Add to root (dev dependencies only)
npm install -D <package>
```

### Using Shared Packages

In `admin-app` or `store-app`:

```typescript
// Import types
import { AuthUser, FormField } from "@insight/shared-types";

// Import utilities
import { formatDate, isValidEmail } from "@insight/shared-utils";
```

### Creating New Shared Utilities

1. Add to `packages/shared-utils/src/`
2. Export from `packages/shared-utils/src/index.ts`
3. Build: `npm run build:utils`
4. Use in apps: Import from `@insight/shared-utils`

## 🎯 Key Features

### Admin App

- ✅ Desktop-optimized interface
- ✅ Authentication with JWT
- ✅ Dashboard analytics
- ✅ Form builder
- ✅ Inventory management
- ✅ Replacement request tracking
- ✅ Store management
- ✅ P&L reports

### Store App

- ✅ Tablet-optimized UI
- ✅ PWA with offline support
- ✅ PIN-based authentication
- ✅ Checklist management
- ✅ Inventory tracking
- ✅ Replacement requests
- ✅ Dynamic forms
- ✅ Service worker caching

## 🔧 Configuration

Each package has its own configuration:

### Environment Variables

**Admin App** (`.env`):

```env
VITE_API_URL=http://localhost:3000/api
```

**Store App** (`.env`):

```env
VITE_API_URL=http://localhost:8000/api
```

**Serverless Functions** (`/packages/store-app/api/serverless/.env`):

```env
NOTION_API_KEY=secret_xxx
JWT_SECRET=your_jwt_secret
# See .env.example for full list
```

## 📊 Bundle Sizes

- **Admin App:** 511 KB (151 KB gzipped)
- **Store App:** 160 KB (52 KB gzipped)
- **Shared Types:** < 1 KB (types only)
- **Shared Utils:** ~10 KB (tree-shakeable)

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests for specific package
npm test -w @insight/admin-app
npm test -w @insight/store-app
```

## 📝 License

MIT

## 👥 Contributing

1. Create feature branch
2. Make changes in appropriate package
3. Update shared packages if needed
4. Test thoroughly
5. Submit PR

## 🔗 Related Projects

- Serverless API functions in `/packages/store-app/api/serverless/`
- PHP API (legacy) in `/packages/store-app/api/`

## Recent Improvements (2025)

- Shared UI package (`@insight/ui`) for Button, Input, Card, etc.
- Unified imports and removed local conflicts in admin-app and store-app
- Store Profile Management Page for viewing/editing PINs
- Storybook setup for live component docs and a11y checks
- Skeleton loaders and virtual scrolling for large lists
- Expanded onboarding, architecture, and accessibility docs
- Automated tests for shared UI components
- Example CI/CD workflow for lint, type, test, accessibility, and bundle size
- Bundle optimization guide and accessibility checklist

## Deployment & Automation (2025)

- Vercel and Netlify setup guides for admin-app, store-app, and serverless functions
- Example GitHub Actions workflows for deploy and rollback
- Automated rollbacks on failed deployments
- Instructions for adding secrets and monitoring deployments
