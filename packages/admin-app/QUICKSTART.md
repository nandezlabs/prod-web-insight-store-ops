# Quick Start Guide

## Get Started in 3 Steps

### 1. Install Dependencies

```bash
cd apps/admin-app
npm install
```

### 2. Start Development Server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### 3. Login

Use these default credentials:

- **Email**: `admin@example.com`
- **Password**: Any value (mock authentication)

## Available Features

✅ **Dashboard** - Analytics overview with charts  
✅ **Forms** - Manage and view form templates  
✅ **Inventory** - Track products and stock levels  
✅ **Replacements** - Handle replacement requests  
✅ **Stores** - Manage store locations  
✅ **P&L Reports** - Financial reporting and analysis

## Project Structure

```
src/
├── components/     # Reusable UI components
├── features/       # Feature-based modules
├── services/       # API and external services
├── store/          # State management (Zustand)
├── types/          # TypeScript definitions
└── utils/          # Helper functions
```

## Key Technologies

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **Radix UI** - Accessible components
- **Recharts** - Data visualization
- **React Router** - Navigation
- **Zustand** - State management

## Development Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Next Steps

1. **Connect to API**: Update `VITE_API_URL` in `.env` file
2. **Customize Auth**: Replace mock auth in `src/store/authStore.ts`
3. **Add Real Data**: Update services in `src/services/api.ts`
4. **Deploy**: Build and deploy to your hosting platform

## Need Help?

- Check the [README.md](./README.md) for detailed documentation
- Review component examples in `src/components/`
- Explore feature modules in `src/features/`

---

**Happy Coding!** 🚀
