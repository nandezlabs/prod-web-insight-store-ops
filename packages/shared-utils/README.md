# @insight/shared-utils

Shared utility functions for the Insight monorepo.

## Overview

This package contains common utility functions used across the admin-app and store-app packages.

## Installation

This package is part of the Insight monorepo and is automatically linked via workspaces.

```bash
# In admin-app or store-app
npm install @insight/shared-utils
```

## Usage

```typescript
import {
  formatDate,
  isValidEmail,
  formatCurrency,
  getCurrentPosition,
} from "@insight/shared-utils";

// Date formatting
const formatted = formatDate(new Date()); // "2024/03/15 10:30 AM"

// Validation
const valid = isValidEmail("user@example.com"); // true

// Currency formatting
const price = formatCurrency(1234.56); // "$1,234.56"

// Geolocation
const coords = await getCurrentPosition();
```

## Available Utilities

### Date Utilities

- `formatDate(date)` - Format with time
- `formatDateLong(date)` - Format with weekday
- `formatDateFull(date)` - Full date/time format
- `formatDateISO(date)` - ISO 8601 format
- `formatRelativeTime(date)` - Relative time (e.g., "2 hours ago")
- `parseDate(string)` - Safe date parsing
- `isToday(date)` - Check if date is today

### Validation Utilities

- `isValidEmail(email)` - Email validation
- `isValidPin(pin)` - 4-digit PIN validation
- `isValidPassword(password)` - Password strength
- `getPasswordErrors(password)` - Get validation errors
- `isValidPhone(phone)` - US phone validation
- `isValidUrl(url)` - URL validation
- `isRequired(value)` - Required field check
- `isInRange(value, min, max)` - Number range check
- `hasMinLength(value, min)` - Min length check
- `hasMaxLength(value, max)` - Max length check

### Formatting Utilities

- `formatCurrency(amount, currency?)` - Currency formatting
- `formatNumber(num)` - Number with commas
- `formatPercent(value, decimals?)` - Percentage
- `formatPhone(phone)` - US phone format
- `truncate(text, maxLength)` - Truncate with ellipsis
- `capitalize(text)` - Capitalize first letter
- `toTitleCase(text)` - Convert to title case
- `getInitials(name)` - Get initials from name
- `formatFileSize(bytes)` - File size formatting
- `slugify(text)` - Create URL-friendly slug

### Storage Utilities

- `getLocalStorage<T>(key, defaultValue)` - Safe localStorage get
- `setLocalStorage<T>(key, value)` - Safe localStorage set
- `removeLocalStorage(key)` - Remove from localStorage
- `clearLocalStorage()` - Clear all localStorage
- `isLocalStorageAvailable()` - Check availability
- `getSessionStorage<T>(key, defaultValue)` - Safe sessionStorage get
- `setSessionStorage<T>(key, value)` - Safe sessionStorage set
- `getStorageSize()` - Get storage size in bytes

### Crypto Utilities

- `generateRandomString(length)` - Random string
- `generateUUID()` - UUID v4 generation
- `simpleHash(str)` - Simple hash function
- `base64Encode(str)` - Base64 encoding
- `base64Decode(str)` - Base64 decoding
- `generateToken(length?)` - Secure random token
- `maskString(str, visibleChars?)` - Mask sensitive data

### Geolocation Utilities

- `getCurrentPosition()` - Get current coordinates
- `calculateDistance(coords1, coords2)` - Distance in meters
- `isWithinRadius(point, center, radius)` - Geofence check
- `formatCoordinates(coords)` - Format as string
- `isGeolocationSupported()` - Check support
- `watchPosition(callback, errorCallback?)` - Watch position changes
- `clearWatch(watchId)` - Clear position watch

## Development

```bash
# Build utilities
npm run build

# Watch mode
npm run dev

# Clean build artifacts
npm run clean
```

## License

MIT
