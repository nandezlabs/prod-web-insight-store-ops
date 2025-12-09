# Design Reference - MyTasks.Website

Based on analysis of https://mytasks.website

## Key Design Elements

### Color Scheme

- **Primary Background**: Clean white/light gray
- **Cards**: White with subtle shadows
- **Accent Colors**:
  - Blue for primary actions
  - Green for positive metrics
  - Red for warnings/alerts
  - Yellow/Orange for attention items

### Layout Structure

#### Dashboard Layout

- **Top Bar**: Date, Period indicators (Q4 • P13 • W2)
- **Metric Cards**: Grid layout with equal-sized cards
  - Icon on left
  - Metric value large and bold
  - Label/description below
  - Clean borders/shadows

#### Navigation

- **Sidebar**: Left-side navigation (visible in screenshots)
  - Store Team
  - Overview
  - Operations

### Component Patterns

#### Metric Cards

```
┌─────────────────┐
│ [Icon]          │
│ $0.00           │  <- Large value
│ PROJECTED SALES │  <- Label
└─────────────────┘
```

#### Score Cards (GEM Score Pattern)

- Circular progress indicators
- Percentage in center
- Current vs Target comparison
- Color-coded status messages
- Clean typography hierarchy

#### Leaderboard Component

- Numbered ranking (1, 2, 3)
- User names
- Point/metric values
- Comment counts with icon
- Trophy/medal icons for winners

#### Feedback/Comments Section ("What Guests Are Saying")

- Quote-style layout
- User avatar/icon
- User name
- Date stamp
- Clean spacing between items

### Typography

- **Headers**: Bold, all caps for section titles
- **Metrics**: Large, bold numbers
- **Labels**: Uppercase, medium weight
- **Body**: Regular weight, clean sans-serif

### Spacing & Grid

- Consistent padding in cards
- Equal-height metric cards in grid
- Clean gutters between elements
- Responsive grid (appears to be 3-4 columns)

### Icons

- Simple, line-based icons
- Consistent size across components
- Left-aligned with text in cards
- Used for visual hierarchy

### UI Patterns to Implement

1. **Today's Overview Section**

   - Date display with period info
   - Grid of metric cards showing key numbers
   - Hover states on cards

2. **Performance Metrics**

   - Circular progress charts
   - Target vs Current comparison
   - Status messages with color coding

3. **Social Proof Section**

   - Contest leaderboards
   - Customer feedback display
   - Rating/comment counts

4. **Card-Based Information Architecture**
   - Everything in clean, bordered cards
   - Consistent card styling
   - Shadow for depth

## Recommendations for Insight App

### Implement Similar Patterns:

1. **Clean metric cards** for dashboard KPIs
2. **Circular progress indicators** for completion rates
3. **Leaderboard components** for store rankings
4. **Comment/feedback sections** for replacement requests
5. **Date/period selector** at top of dashboard
6. **Icon-driven navigation** in sidebar
7. **Color-coded status** throughout (green=good, red=alert)

### Design Principles to Follow:

- ✅ Clean, minimalist design
- ✅ Generous whitespace
- ✅ Clear visual hierarchy
- ✅ Consistent card patterns
- ✅ Icon + text combinations
- ✅ Color for meaning (not decoration)
- ✅ Large, readable metrics
- ✅ Responsive grid layouts
