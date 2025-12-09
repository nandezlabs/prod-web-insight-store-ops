# Analytics Dashboard

Comprehensive analytics and reporting system with interactive charts, KPI tracking, and data export capabilities.

## 📁 File Structure

```
src/features/analytics/
├── components/
│   ├── AnalyticsDashboard.tsx    # Main dashboard page
│   ├── KPICards.tsx              # 4 key metric cards with trends
│   ├── CompletionChart.tsx       # Line/bar chart with series toggle
│   ├── StoreComparison.tsx       # Horizontal bar chart by store
│   ├── ChecklistBreakdown.tsx    # Pie/donut chart by type
│   ├── DateRangePicker.tsx       # Date filter with presets
│   ├── ExportReport.tsx          # CSV/PDF export
│   └── index.ts                  # Component exports
├── stores/
│   └── analyticsStore.ts         # Zustand state management
├── services/
│   └── analyticsService.ts       # API integration + mock data
├── types.ts                      # TypeScript interfaces
└── index.ts                      # Feature exports
```

## ✨ Features

### KPI Cards (4 Metrics)

- **Total Checklists Completed**: Count of all completed checklists
- **Average Completion Rate**: Percentage of checklists completed
- **On-Time Completion**: Percentage completed by deadline
- **Active Stores**: Number of stores with activity

**Features:**

- Change indicators (↑ ↓ →)
- Color-coded trends (green positive, red negative, gray neutral)
- Comparison to previous period
- Responsive grid layout (1-2-4 columns)

### Date Range Picker

**6 Preset Ranges:**

1. Last 7 days
2. Last 30 days
3. Last 90 days
4. This month
5. Last month
6. Custom range

**Custom Range:**

- Calendar-style date inputs
- Start/end date validation
- Apply/Cancel buttons
- Visual date display

### Completion Chart

**Chart Types:**

- **Line Chart**: Trend visualization
- **Bar Chart**: Volume comparison
- Toggle between types with icon buttons

**Series:**

- Opening Checklist (blue)
- Daily Cleaning (green)
- Weekly Maintenance (orange)

**Features:**

- Series toggle via legend click
- Hover tooltips with exact values
- Responsive sizing
- Accessible data table alternative
- Keyboard navigation

### Store Comparison

**Horizontal Bar Chart:**

- One bar per store
- Sorted by completion count (descending)
- Top 10 stores displayed
- "View all" link for full list

**Color Coding:**

- Green (≥90%): Excellent performance
- Blue (80-89%): Good performance
- Orange (70-79%): Needs improvement
- Red (<70%): Action required

**Features:**

- Hover tooltips (completions + rate)
- Color legend
- Data table alternative

### Checklist Breakdown

**Pie/Donut Chart:**

- Slice per checklist type
- Percentage labels on slices
- Color-coded segments
- Center donut hole

**Interaction:**

- Click slice to filter
- Active state highlighting
- Legend with counts

**Summary Cards:**

- 2x2 grid below chart
- Shows count and percentage
- Click to select type
- Ring highlight when active

### Export Report

**Format Options:**

- **CSV**: Spreadsheet format (Excel-compatible)
- **PDF**: Printable report with charts

**Features:**

- Dropdown menu with format icons
- Progress bar during export
- Includes current filters
- Auto-download file
- Timestamped filename

**Export Process:**

1. Click "Export Report"
2. Select format (CSV/PDF)
3. Watch progress bar (0-100%)
4. File downloads automatically

## 📊 Data Types

### AnalyticsData

```typescript
{
  totalCompleted: number;
  avgCompletionRate: number;
  onTimeRate: number;
  activeStores: number;
  completionTrend: DataPoint[];
  storeComparison: StoreMetric[];
  typeBreakdown: TypeMetric[];
  previousPeriod?: PeriodComparison;
}
```

### DataPoint (Chart Data)

```typescript
{
  date: string;           // YYYY-MM-DD
  count: number;          // Total count
  opening?: number;       // Opening checklist count
  daily?: number;         // Daily cleaning count
  weekly?: number;        // Weekly maintenance count
}
```

### StoreMetric

```typescript
{
  storeId: string;
  storeName: string;
  completionCount: number;
  completionRate: number; // 0-100
}
```

### TypeMetric

```typescript
{
  type: string;           // Checklist type name
  count: number;          // Total count
  percentage: number;     // 0-100
  color?: string;         // Hex color for chart
}
```

## 🔧 State Management (Zustand)

### Store Structure

```typescript
{
  data: AnalyticsData | null;
  isLoading: boolean;
  error: string | null;
  filters: {
    dateRange: {
      startDate: Date;
      endDate: Date;
      label?: string;
    };
    storeIds?: string[];
    checklistTypes?: string[];
  };
}
```

### Actions

- `fetchAnalytics()` - Load analytics data
- `setDateRange(range)` - Update date filter and refresh
- `setDateRangePreset(preset)` - Apply preset and refresh
- `setStoreFilter(storeIds)` - Filter by stores
- `setChecklistTypeFilter(types)` - Filter by types
- `clearFilters()` - Reset to defaults
- `refreshData()` - Reload current data

### Persistence

- Filters persisted to localStorage
- Date range remembered between sessions
- Data fetched fresh on mount

## 🌐 API Integration

### Service Methods

```typescript
// Get analytics data
await analyticsService.getAnalyticsData(filters);

// Export data
await analyticsService.exportData(format, filters);

// Get date range preset
const range = analyticsService.getDateRangePreset("last30days");
```

### Mock Data

**12 Stores** with varying performance:

- Downtown Store (95.2%, 145 completions)
- Westside Mall (88.7%, 132 completions)
- Airport Location (91.3%, 128 completions)
- University District (85.4%, 121 completions)
- ... 8 more stores

**4 Checklist Types:**

- Opening Checklist (38.5%, 342 count)
- Daily Cleaning (33.6%, 298 count)
- Weekly Maintenance (21.0%, 186 count)
- Inventory Count (7.0%, 62 count)

**Trend Data:**

- Generated for date range
- Random realistic values
- 20-70 completions per day
- Breakdown by type

## 🎨 Design System

### Layout

- **Page**: Max-width 7xl (1280px), centered
- **Grid**: Responsive (1-2-4 columns)
- **Spacing**: 6-unit vertical gaps
- **Cards**: White bg, border, rounded-lg, shadow-sm

### Colors

**Chart Colors:**

- Blue (#3b82f6): Opening checklists, primary
- Green (#10b981): Daily cleaning, success, ≥90%
- Orange (#f59e0b): Weekly maintenance, warning, 70-79%
- Purple (#8b5cf6): Inventory, accent
- Red (#ef4444): <70% performance

**KPI Trends:**

- Green: Positive change
- Red: Negative change
- Gray: No change

### Typography

- **Page Title**: 3xl, bold
- **Card Title**: lg, semibold
- **Metrics**: 3xl, bold
- **Body**: base
- **Metadata**: sm, muted

## 📦 Dependencies

### Core Libraries

- `recharts` (^2.10.0) - Chart library
- `date-fns` (^3.0.0) - Date manipulation
- `jspdf` (^2.5.0) - PDF generation
- `zustand` (^4.4.0) - State management
- `axios` - HTTP client

### Recharts Components Used

- `LineChart`, `Line` - Trend visualization
- `BarChart`, `Bar` - Volume comparison
- `PieChart`, `Pie` - Type breakdown
- `XAxis`, `YAxis` - Chart axes
- `CartesianGrid` - Grid lines
- `Tooltip` - Hover information
- `Legend` - Series labels
- `ResponsiveContainer` - Responsive sizing

## ♿ Accessibility

### Chart Descriptions

- `role="img"` on chart containers
- `aria-label` with descriptive text
- Data table alternatives (expandable)

### Keyboard Navigation

- Tab through all interactive elements
- Enter/Space to activate buttons
- Arrow keys in date pickers
- Focus visible indicators

### Screen Readers

- Chart summaries
- Tooltip content announced
- Data tables for raw data
- Descriptive labels

### Visual

- High contrast colors
- Color + shape indicators
- Large touch targets (44x44px min)
- Clear focus states

## 🚀 Usage

```tsx
import { AnalyticsDashboard } from "@/features/analytics";

// In your router
<Route path="/analytics" element={<AnalyticsDashboard />} />;
```

### Individual Components

```tsx
import {
  KPICards,
  CompletionChart,
  StoreComparison,
  ChecklistBreakdown,
  DateRangePicker,
  ExportReport,
} from "@/features/analytics/components";

// Use separately
<KPICards
  totalCompleted={1000}
  avgCompletionRate={87.5}
  onTimeRate={92.3}
  activeStores={24}
  previousPeriod={{
    totalCompleted: 950,
    avgCompletionRate: 84.2,
    onTimeRate: 89.1,
    activeStores: 23,
  }}
/>;
```

## 📈 Chart Examples

### Completion Chart

- **Line mode**: Shows trends over time
- **Bar mode**: Shows daily volumes
- **Series toggle**: Click legend to show/hide
- **Tooltip**: Hover for exact values

### Store Comparison

- **Top performers**: Green bars
- **Good performance**: Blue bars
- **Needs work**: Orange/red bars
- **Click store**: View details

### Type Breakdown

- **Pie chart**: Overall distribution
- **Click slice**: Filter by type
- **Summary cards**: Quick stats
- **Legend**: Toggle visibility

## 🔄 Data Flow

1. **Component Mount**:

   - Load filters from localStorage
   - Fetch analytics data

2. **Filter Change**:

   - Update filters in store
   - Auto-refresh data
   - Show loading state

3. **Export**:

   - Generate file on server
   - Show progress bar
   - Download when ready

4. **Refresh**:
   - Re-fetch current data
   - Update all charts
   - Maintain filters

## 🎯 User Workflows

### View Analytics

1. Navigate to Analytics Dashboard
2. See last 30 days by default
3. Review KPI cards for overview
4. Explore charts for details

### Change Date Range

1. Click date range preset or custom
2. For custom: select start/end dates
3. Click Apply
4. Charts update automatically

### Export Report

1. Click "Export Report" button
2. Choose CSV or PDF
3. Wait for progress bar
4. File downloads automatically

### Filter by Type

1. Click slice in breakdown chart
2. Other charts filter to that type
3. KPIs recalculate
4. Click again to clear

## 🔄 Future Enhancements

- [ ] Real-time updates via WebSocket
- [ ] Custom KPI builder
- [ ] Scheduled report emails
- [ ] Comparison mode (period vs period)
- [ ] Drill-down to checklist details
- [ ] Advanced filters (user, status, etc.)
- [ ] Dashboard templates
- [ ] Chart annotations
- [ ] Goal tracking
- [ ] Predictive analytics
- [ ] Mobile app charts
- [ ] Share dashboard link
- [ ] Custom color schemes
- [ ] Chart image download
- [ ] Excel export with formatting
