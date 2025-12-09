# Store Operations App

A tablet-optimized React application for store operations with offline support.

## Features

- ⚡ **Fast**: Built with Vite for lightning-fast development and optimized production builds
- 📱 **Touch-Optimized**: Large touch targets (44-56px) for comfortable tablet use
- 🎨 **Beautiful UI**: TailwindCSS with custom 8px grid system
- 📴 **Offline Support**: Service workers and IndexedDB for offline functionality
- 🔒 **Type-Safe**: Full TypeScript with strict mode enabled
- 🎯 **Small Bundle**: Optimized to stay under 10MB target

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first styling
- **Zustand** - State management
- **React Router** - Navigation
- **IndexedDB (idb)** - Offline data storage
- **Workbox** - Service worker utilities

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Environment Setup

1. Copy `.env.example` to `.env`
2. Update the `VITE_API_URL` with your backend API URL

## Project Structure

```
src/
├── components/       # Reusable UI components
├── features/         # Feature modules (auth, tasks, etc.)
├── stores/           # Zustand state management
├── services/         # API clients and database
├── utils/            # Helper functions
├── App.tsx           # Root component
└── main.tsx          # Entry point
```

## Development

### Key Commands

- `npm run dev` - Start development server (port 3000)
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

### Design System

- **Grid**: 8px base unit
- **Touch Targets**: Minimum 44px (iOS), 48px (Android), 56px (comfortable)
- **Colors**: Primary (blue) and Secondary (purple) palettes
- **Typography**: Optimized for readability on tablets

### Offline Support

The app uses:

- Service Workers for caching assets and API responses
- IndexedDB for persistent local data storage
- Network-first strategy for API calls with fallback to cache

## Performance

Target metrics:

- Bundle size: < 10MB
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Score: > 90

## License

MIT
