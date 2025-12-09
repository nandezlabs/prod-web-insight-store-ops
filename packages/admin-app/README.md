# Admin Dashboard

A modern, enterprise-grade admin dashboard built with React 18, TypeScript, and Vite. Desktop-optimized interface for managing stores, inventory, forms, replacements, and P&L reports.

## Tech Stack

- **Framework**: React 18.2+
- **Build Tool**: Vite 5.0+
- **Language**: TypeScript (strict mode)
- **Styling**: TailwindCSS 3.4+
- **UI Components**: Radix UI
- **Routing**: React Router v6.20+
- **State Management**:
  - Zustand 4.4+ (client state)
  - TanStack React Query 5.14+ (server state)
- **Charts**: Recharts 2.10+
- **Icons**: Lucide React 0.294+

## Features

### Authentication

- Login page with form validation
- Persistent auth state (localStorage)
- Protected routes
- Mock authentication (customizable)

### Dashboard (Analytics)

- Revenue overview with line charts
- Monthly comparison with bar charts
- Key metrics cards (Revenue, Orders, Customers, Conversion)
- Responsive grid layout

### Forms Management

- View all forms
- Response tracking
- Create/Edit functionality
- Last updated timestamps

### Inventory

- Product list with categories
- Stock status indicators (in-stock, low-stock, out-of-stock)
- Quantity tracking
- Searchable table view

### Replacement Requests

- Request status management (pending, approved, rejected)
- Approve/reject actions
- Summary statistics
- Store and item details

### Stores

- Store directory
- Manager information
- Location details
- Active/inactive status

### P&L Reports

- Financial overview (Revenue, Costs, Profit)
- Store performance comparison
- Profit margin analysis
- Trend indicators

## Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── AppShell.tsx      # Main layout wrapper
│   │   ├── Sidebar.tsx       # Navigation sidebar
│   │   └── Header.tsx        # Top header with user menu
│   └── ui/
│       ├── Button.tsx        # Reusable button component
│       ├── Card.tsx          # Card components
│       └── Input.tsx         # Form input component
├── features/
│   ├── analytics/
│   │   └── pages/Dashboard.tsx
│   ├── auth/
│   │   └── pages/LoginPage.tsx
│   ├── forms/
│   │   └── pages/FormsPage.tsx
│   ├── inventory/
│   │   └── pages/InventoryPage.tsx
│   ├── replacements/
│   │   └── pages/ReplacementsPage.tsx
│   ├── stores/
│   │   └── pages/StoresPage.tsx
│   └── pl-reports/
│       └── pages/PLReportsPage.tsx
├── services/
│   └── api.ts                # API client with axios
├── store/
│   └── authStore.ts          # Zustand auth store
├── types/
│   └── index.ts              # TypeScript type definitions
├── utils/
│   └── index.ts              # Helper functions
├── App.tsx                   # Root component with routing
├── main.tsx                  # Application entry point
└── index.css                 # Global styles + Tailwind

```

## Configuration

### TypeScript

- Strict mode enabled
- Path aliases: `@/` → `src/`
- Target: ES2020
- Bundler module resolution

### Vite

- Route-based code splitting
- Vendor chunk optimization:
  - `react-vendor`: React, React DOM, React Router
  - `radix-ui`: All Radix UI components
  - `charts`: Recharts library
  - `state`: Zustand, TanStack Query

### TailwindCSS

- Custom color system using HSL variables
- Dark mode support (class strategy)
- Custom colors: background, foreground, card, primary, muted, accent, destructive
- Responsive breakpoints: sm, md, lg, xl, 2xl

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn

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

# Lint code
npm run lint
```

### Development

The app will be available at `http://localhost:5173` (default Vite port).

**Default Login:**

- Email: `admin@example.com`
- Password: Any value (mock auth)

### Building for Production

```bash
npm run build
```

Output will be in the `dist/` directory. The build is optimized with:

- Code splitting by route
- Vendor chunk optimization
- Minification
- Tree shaking

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_API_URL=http://localhost:3000/api
```

## Code Style

- ESLint configured for React/TypeScript
- Prettier recommended for formatting
- Component naming: PascalCase
- File naming: PascalCase for components, camelCase for utilities
- Props interfaces: Named exports with `Props` suffix

## State Management

### Client State (Zustand)

```typescript
// Example: authStore
const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: async (email, password) => {
        /* ... */
      },
      logout: () => {
        /* ... */
      },
    }),
    { name: "auth-storage" }
  )
);
```

### Server State (TanStack Query)

```typescript
// Example: fetching data
const { data, isLoading } = useQuery({
  queryKey: ["forms"],
  queryFn: () => api.get("/forms"),
});
```

## API Integration

The `api.ts` service provides a configured axios instance:

```typescript
import api from "@/services/api";

// GET request
const response = await api.get("/endpoint");

// POST request
const response = await api.post("/endpoint", { data });
```

Base URL is configured from `VITE_API_URL` environment variable.

## UI Components

Built with Radix UI primitives for accessibility:

- **Button**: 4 variants (default, outline, ghost, destructive), 3 sizes
- **Card**: Container with header, title, and content sections
- **Input**: Styled form input with error states

All components support className prop for custom styling.

## Charts

Recharts components used:

- `LineChart`: Time series data
- `BarChart`: Comparison data
- `ResponsiveContainer`: Responsive chart wrapper

## Deployment

### Vercel

```bash
npm run build
vercel --prod
```

### Netlify

```bash
npm run build
netlify deploy --prod --dir=dist
```

### Docker

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
CMD ["npm", "run", "preview"]
```

## Performance

- Lighthouse Score: 90+ (Performance, Accessibility, Best Practices)
- Code splitting reduces initial bundle size
- Lazy loading for routes (future enhancement)
- Optimized re-renders with React.memo (where appropriate)

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## License

MIT

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

---

**Created by:** Admin Dashboard Team  
**Last Updated:** December 2024
