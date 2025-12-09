# @insight/shared-types

Shared TypeScript type definitions for the Insight monorepo.

## Overview

This package contains all common TypeScript types, interfaces, and type definitions used across the admin-app and store-app packages.

## Installation

This package is part of the Insight monorepo and is automatically linked via workspaces.

```bash
# In admin-app or store-app
npm install @insight/shared-types
```

## Usage

```typescript
import { AuthUser, FormField, InventoryItem } from "@insight/shared-types";

const user: AuthUser = {
  id: "123",
  name: "John Doe",
  email: "john@example.com",
  role: "admin",
};
```

## Available Types

### Authentication

- `AuthUser`
- `LoginCredentials`
- `PinLoginCredentials`
- `AuthResponse`
- `JWTPayload`
- `AuthState`
- `GeolocationCoordinates`

### Users

- `User`
- `StoreUser`
- `AdminUser`

### Stores

- `Store`
- `StoreProfile`

### Forms

- `Form`
- `FormField`
- `FormResponse`
- `DynamicFormField`
- `FormValidationResult`
- `FieldType`

### Inventory

- `InventoryItem`
- `InventoryFilters`
- `InventoryUpdateRequest`
- `StockStatus`

### Checklists

- `ChecklistTask`
- `ChecklistSubmission`
- `ChecklistTaskResponse`
- `ChecklistFilters`
- `ChecklistSection`
- `ChecklistType`
- `TaskStatus`

### Replacements

- `ReplacementRequest`
- `ReplacementFilters`
- `ReplacementStats`
- `ReplacementStatus`
- `ReplacementPriority`

### Analytics

- `AnalyticsLog`
- `DashboardStats`
- `ChartDataPoint`
- `PLReport`

### API

- `ApiResponse<T>`
- `PaginatedResponse<T>`
- `ApiError`
- `RateLimitInfo`
- `CorsHeaders`

## Development

```bash
# Build types
npm run build

# Watch mode
npm run dev

# Clean build artifacts
npm run clean
```

## License

MIT
