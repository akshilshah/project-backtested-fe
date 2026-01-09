# Trading Management System - Implementation Plan

## Project Overview
Building a premium trading management system frontend using the Minimal UI theme (v7.6.1).

**Tech Stack:** React 19, TypeScript, Vite, MUI v7, Framer Motion, React Hook Form, Zod
**Theme:** Minimal UI (already integrated)
**API:** REST API with JWT authentication
**Design Focus:** Trade-focused dashboard, world-class UI/UX

---

## Phase 1: Foundation & Configuration
**Goal:** Set up project foundation, API integration, and authentication

### 1.1 Environment & API Configuration
- [x] Update `.env` file with `VITE_API_BASE_URL` variable
- [x] Update `src/global-config.ts` to use the new API base URL
- [x] Update `src/lib/axios.ts` to configure base URL from environment
- [x] Create `src/lib/api-endpoints.ts` with all API endpoint constants:
  - Auth endpoints: `/api/auth/signup`, `/api/auth/login`, `/api/auth/profile`, `/api/auth/settings`
  - Coins endpoints: `/api/masters/coins` (CRUD)
  - Strategies endpoints: `/api/masters/strategies` (CRUD)
  - Trades endpoints: `/api/trades` (CRUD + exit + analytics)

### 1.2 TypeScript Types
- [x] Create `src/types/api.ts` - Generic API response types
- [x] Create `src/types/auth.ts` - User, Organization, Settings types
- [x] Create `src/types/coin.ts` - Coin type definitions
- [x] Create `src/types/strategy.ts` - Strategy type definitions
- [x] Create `src/types/trade.ts` - Trade, TradeStatus, Analytics types
- [x] Create `src/types/index.ts` - Export all types

### 1.3 Authentication Integration
- [x] Update `src/auth/context/jwt/auth-provider.tsx` to match API response structure
- [x] Update sign-in endpoint from `/api/auth/sign-in` to `/api/auth/login`
- [x] Update sign-up endpoint from `/api/auth/sign-up` to `/api/auth/signup`
- [x] Update profile endpoint to `/api/auth/profile`
- [x] Update `src/auth/view/jwt/jwt-sign-in-view.tsx` - Match API request/response
- [x] Update `src/auth/view/jwt/jwt-sign-up-view.tsx` - Add firstName, lastName fields
- [x] Create `src/hooks/use-auth-user.ts` - Hook for accessing current user

### 1.4 API Service Layer
- [x] Create `src/services/api.service.ts` - Base API service with error handling
- [x] Create `src/services/auth.service.ts` - Authentication API calls
- [x] Create `src/services/coins.service.ts` - Coins CRUD operations
- [x] Create `src/services/strategies.service.ts` - Strategies CRUD operations
- [x] Create `src/services/trades.service.ts` - Trades CRUD + exit + analytics

---

## Phase 2: Routing & Navigation
**Goal:** Set up all application routes and navigation structure

### 2.1 Route Configuration
- [x] Update `src/routes/paths.ts` with all application paths:
  - Dashboard: `/dashboard`
  - Trades: `/dashboard/trades`, `/dashboard/trades/new`, `/dashboard/trades/:id`
  - Coins: `/dashboard/coins`, `/dashboard/coins/new`, `/dashboard/coins/:id`
  - Strategies: `/dashboard/strategies`, `/dashboard/strategies/new`, `/dashboard/strategies/:id`
  - Analytics: `/dashboard/analytics`
  - Settings: `/dashboard/settings`
  - Profile: `/dashboard/profile`
- [x] Update `src/routes/sections/dashboard.tsx` with all dashboard routes
- [x] Create lazy-loaded page components for code splitting

### 2.2 Navigation Configuration
- [x] Update `src/layouts/nav-config-dashboard.tsx` with menu structure:
  - Dashboard (home icon)
  - Trades section:
    - All Trades
    - Open Trades
    - Closed Trades
    - New Trade
  - Master Data section:
    - Coins
    - Strategies
  - Analytics
  - Settings

---

## Phase 3: Shared Components
**Goal:** Create reusable components used across the application

### 3.1 Data Display Components
- [x] Create `src/components/data-table/DataTable.tsx` - Reusable table with:
  - Sorting
  - Pagination
  - Row selection
  - Loading skeleton
  - Empty state
  - Search/filter integration
- [x] Create `src/components/data-table/TableSkeleton.tsx` - Loading skeleton for tables
- [x] Create `src/components/data-table/TableEmpty.tsx` - Empty state component
- [x] Create `src/components/data-table/TableToolbar.tsx` - Search, filters, actions

### 3.2 Form Components
- [x] Create `src/components/form/FormCard.tsx` - Card wrapper for forms
- [x] Create `src/components/form/FormActions.tsx` - Submit/Cancel button group
- [x] Create `src/components/form/ConfirmDialog.tsx` - Confirmation modal for deletes

### 3.3 Stats & Metrics Components
- [x] Create `src/components/stats/StatCard.tsx` - Single stat display card
- [x] Create `src/components/stats/StatsGrid.tsx` - Grid of stat cards
- [x] Create `src/components/stats/TrendIndicator.tsx` - Up/down trend with percentage
- [x] Create `src/components/stats/ProfitLossDisplay.tsx` - P&L with color coding

### 3.4 Trade-Specific Components
- [x] Create `src/components/trade/TradeStatusBadge.tsx` - OPEN/CLOSED badge
- [x] Create `src/components/trade/CoinDisplay.tsx` - Coin symbol with icon
- [x] Create `src/components/trade/PriceDisplay.tsx` - Formatted price display
- [x] Create `src/components/trade/TradeCard.tsx` - Trade summary card for lists

### 3.5 Layout Components
- [x] Create `src/components/page/PageHeader.tsx` - Page title with breadcrumbs and actions
- [x] Create `src/components/page/PageContainer.tsx` - Consistent page padding/layout

---

## Phase 4: Master Data - Coins Management
**Goal:** Complete CRUD for coins/cryptocurrencies

### 4.1 Coins List Page
- [ ] Create `src/pages/dashboard/coins/index.tsx` - Route component
- [ ] Create `src/sections/coins/view/coins-list-view.tsx` - Main list view
- [ ] Create `src/sections/coins/coins-table.tsx` - Coins data table
- [ ] Create `src/sections/coins/coins-table-row.tsx` - Individual row component
- [ ] Create `src/sections/coins/coins-table-toolbar.tsx` - Search and filters
- [ ] Implement features:
  - Search by name/symbol
  - Sort by name, symbol, created date
  - Pagination
  - Delete with confirmation (check if used in trades)
  - Loading skeletons
  - Empty state

### 4.2 Create Coin Page
- [ ] Create `src/pages/dashboard/coins/new.tsx` - Route component
- [ ] Create `src/sections/coins/view/coins-create-view.tsx` - Create view
- [ ] Create `src/sections/coins/coins-form.tsx` - Reusable coin form
- [ ] Implement Zod validation schema
- [ ] Handle duplicate symbol error (409)
- [ ] Success toast and redirect to list

### 4.3 Edit Coin Page
- [ ] Create `src/pages/dashboard/coins/[id]/edit.tsx` - Route component
- [ ] Create `src/sections/coins/view/coins-edit-view.tsx` - Edit view
- [ ] Fetch existing coin data
- [ ] Pre-populate form
- [ ] Handle not found (404)
- [ ] Success toast and redirect

### 4.4 Coin Details Page (Optional)
- [ ] Create `src/pages/dashboard/coins/[id]/index.tsx` - Route component
- [ ] Create `src/sections/coins/view/coins-details-view.tsx` - Details view
- [ ] Show coin info with edit/delete actions
- [ ] Show trades using this coin

---

## Phase 5: Master Data - Strategies Management
**Goal:** Complete CRUD for trading strategies

### 5.1 Strategies List Page
- [ ] Create `src/pages/dashboard/strategies/index.tsx` - Route component
- [ ] Create `src/sections/strategies/view/strategies-list-view.tsx` - Main list view
- [ ] Create `src/sections/strategies/strategies-table.tsx` - Strategies data table
- [ ] Create `src/sections/strategies/strategies-table-row.tsx` - Individual row
- [ ] Create `src/sections/strategies/strategies-table-toolbar.tsx` - Search and filters
- [ ] Implement features:
  - Search by name
  - Sort by name, created date
  - Pagination
  - Delete with confirmation (check if used in trades)
  - Loading skeletons
  - Empty state

### 5.2 Create Strategy Page
- [ ] Create `src/pages/dashboard/strategies/new.tsx` - Route component
- [ ] Create `src/sections/strategies/view/strategies-create-view.tsx` - Create view
- [ ] Create `src/sections/strategies/strategies-form.tsx` - Reusable strategy form
- [ ] Implement Zod validation schema
- [ ] Rules field as JSON editor or key-value pairs
- [ ] Success toast and redirect

### 5.3 Edit Strategy Page
- [ ] Create `src/pages/dashboard/strategies/[id]/edit.tsx` - Route component
- [ ] Create `src/sections/strategies/view/strategies-edit-view.tsx` - Edit view
- [ ] Fetch existing strategy data
- [ ] Pre-populate form including rules
- [ ] Handle not found (404)

### 5.4 Strategy Details Page (Optional)
- [ ] Create `src/pages/dashboard/strategies/[id]/index.tsx` - Route component
- [ ] Create `src/sections/strategies/view/strategies-details-view.tsx` - Details view
- [ ] Show strategy info with rules displayed nicely
- [ ] Show trades using this strategy

---

## Phase 6: Trades Management
**Goal:** Complete trade management including create, list, view, edit, and exit

### 6.1 Trades List Page
- [ ] Create `src/pages/dashboard/trades/index.tsx` - Route component
- [ ] Create `src/sections/trades/view/trades-list-view.tsx` - Main list view
- [ ] Create `src/sections/trades/trades-table.tsx` - Trades data table
- [ ] Create `src/sections/trades/trades-table-row.tsx` - Individual row with actions
- [ ] Create `src/sections/trades/trades-table-toolbar.tsx` - Filters toolbar
- [ ] Create `src/sections/trades/trades-filters.tsx` - Filter panel:
  - Status filter (All/Open/Closed)
  - Coin filter (dropdown)
  - Strategy filter (dropdown)
  - Date range filter
- [ ] Implement features:
  - Pagination with page size options
  - Sorting by date, P&L, coin, strategy
  - Quick actions (view, edit, exit, delete)
  - Color-coded P&L (green/red)
  - Status badges
  - Loading skeletons
  - Empty state with CTA to create first trade

### 6.2 Create Trade Page
- [ ] Create `src/pages/dashboard/trades/new.tsx` - Route component
- [ ] Create `src/sections/trades/view/trades-create-view.tsx` - Create view
- [ ] Create `src/sections/trades/trades-form.tsx` - Trade entry form
- [ ] Form fields:
  - Coin (searchable dropdown)
  - Strategy (searchable dropdown)
  - Trade Date (date picker)
  - Trade Time (time picker)
  - Entry Price (number input)
  - Stop Loss (number input)
  - Quantity (number input)
  - Notes (textarea)
- [ ] Implement Zod validation
- [ ] Calculate risk amount display (entry - stop loss) * quantity
- [ ] Success toast and redirect options (list or create another)

### 6.3 Trade Details Page
- [ ] Create `src/pages/dashboard/trades/[id]/index.tsx` - Route component
- [ ] Create `src/sections/trades/view/trades-details-view.tsx` - Details view
- [ ] Create `src/sections/trades/trade-details-card.tsx` - Main info card
- [ ] Create `src/sections/trades/trade-summary.tsx` - P&L summary for closed trades
- [ ] Display sections:
  - Trade header (coin, status badge, actions)
  - Entry details (date, time, price, stop loss, quantity)
  - Exit details (if closed: date, time, price)
  - P&L summary (if closed: profit/loss, percentage, duration)
  - Strategy info
  - Notes
  - Audit info (created by, updated by, timestamps)
- [ ] Actions: Edit (if open), Exit (if open), Delete

### 6.4 Edit Trade Page
- [ ] Create `src/pages/dashboard/trades/[id]/edit.tsx` - Route component
- [ ] Create `src/sections/trades/view/trades-edit-view.tsx` - Edit view
- [ ] Reuse trades-form.tsx
- [ ] Only allow editing OPEN trades
- [ ] Show warning if trying to edit closed trade
- [ ] Pre-populate all fields

### 6.5 Exit Trade Modal/Page
- [ ] Create `src/sections/trades/trade-exit-dialog.tsx` - Exit trade modal
- [ ] Form fields:
  - Exit Price (number input)
  - Exit Date (date picker, default today)
  - Exit Time (time picker, default now)
  - Notes (textarea)
- [ ] Show calculated P&L preview before confirming
- [ ] Success animation/feedback
- [ ] Update list after exit

---

## Phase 7: Dashboard & Analytics
**Goal:** Build the main dashboard with trade-focused view and analytics

### 7.1 Main Dashboard Page
- [ ] Create `src/pages/dashboard/index.tsx` - Update existing
- [ ] Create `src/sections/dashboard/view/dashboard-view.tsx` - Main dashboard
- [ ] Create `src/sections/dashboard/dashboard-stats.tsx` - Key metrics row:
  - Total Trades
  - Open Positions
  - Total P&L
  - Win Rate
- [ ] Create `src/sections/dashboard/dashboard-open-trades.tsx` - Open trades table
- [ ] Create `src/sections/dashboard/dashboard-recent-trades.tsx` - Recent closed trades
- [ ] Create `src/sections/dashboard/dashboard-quick-actions.tsx` - Quick action buttons:
  - New Trade
  - View All Trades
  - Analytics
- [ ] Layout: Stats at top, Open trades prominent, Recent trades below

### 7.2 Analytics Page
- [ ] Create `src/pages/dashboard/analytics/index.tsx` - Route component
- [ ] Create `src/sections/analytics/view/analytics-view.tsx` - Main analytics view
- [ ] Create `src/sections/analytics/analytics-filters.tsx` - Date range, coin, strategy filters
- [ ] Create `src/sections/analytics/analytics-summary.tsx` - Summary statistics:
  - Total Trades
  - Win Rate (with visual indicator)
  - Total P&L
  - Average P&L
  - Best Trade
  - Worst Trade
- [ ] Create `src/sections/analytics/analytics-by-coin.tsx` - Performance by coin table/chart
- [ ] Create `src/sections/analytics/analytics-by-strategy.tsx` - Performance by strategy table/chart
- [ ] Create `src/sections/analytics/analytics-charts.tsx` - Visual charts:
  - P&L over time (line chart)
  - Win/Loss distribution (pie chart)
  - Performance by coin (bar chart)
  - Performance by strategy (bar chart)

---

## Phase 8: User Settings & Profile
**Goal:** User profile management and application settings

### 8.1 Profile Page
- [ ] Create `src/pages/dashboard/profile/index.tsx` - Route component
- [ ] Create `src/sections/profile/view/profile-view.tsx` - Profile view
- [ ] Create `src/sections/profile/profile-form.tsx` - Profile edit form:
  - First Name
  - Last Name
  - Email (read-only)
  - Profile Picture (if supported)
- [ ] Show organization info
- [ ] Success toast on save

### 8.2 Settings Page
- [ ] Create `src/pages/dashboard/settings/index.tsx` - Route component
- [ ] Create `src/sections/settings/view/settings-view.tsx` - Settings view
- [ ] Create `src/sections/settings/settings-general.tsx` - General settings:
  - Currency preference
  - Timezone
  - Date format preference
- [ ] Create `src/sections/settings/settings-notifications.tsx` - Notification preferences
- [ ] Create `src/sections/settings/settings-display.tsx` - Display settings:
  - Theme mode (integrated with existing theme toggle)
  - Compact mode
  - Table density

---

## Phase 9: Polish & UX Enhancements
**Goal:** Add micro-interactions, animations, and polish for world-class UX

### 9.1 Loading States
- [ ] Implement skeleton loaders for all list pages
- [ ] Implement skeleton loaders for detail pages
- [ ] Add loading states to all buttons during API calls
- [ ] Add page transition animations

### 9.2 Empty States
- [ ] Design beautiful empty state for trades list
- [ ] Design empty state for coins list
- [ ] Design empty state for strategies list
- [ ] Design empty state for analytics (no closed trades)
- [ ] Include helpful CTAs in all empty states

### 9.3 Error Handling
- [ ] Create `src/components/error/ErrorBoundary.tsx` - Global error boundary
- [ ] Create `src/components/error/ErrorDisplay.tsx` - Error display component
- [ ] Implement toast notifications for all API errors
- [ ] Handle network errors gracefully
- [ ] Handle 401 errors (redirect to login)
- [ ] Handle 404 errors (show not found)

### 9.4 Animations & Micro-interactions
- [ ] Add hover effects to all cards
- [ ] Add hover effects to table rows
- [ ] Add enter/exit animations to modals
- [ ] Add success animations for form submissions
- [ ] Add number counting animations for stats
- [ ] Add smooth transitions between pages

### 9.5 Responsive Design
- [ ] Test and fix all pages on mobile
- [ ] Test and fix all pages on tablet
- [ ] Ensure tables scroll horizontally on mobile
- [ ] Ensure forms are usable on mobile
- [ ] Test navigation drawer on mobile

---

## Phase 10: Testing & Optimization
**Goal:** Ensure quality and performance

### 10.1 Manual Testing
- [ ] Test complete authentication flow
- [ ] Test all CRUD operations for coins
- [ ] Test all CRUD operations for strategies
- [ ] Test all CRUD operations for trades
- [ ] Test trade exit flow
- [ ] Test analytics with various data
- [ ] Test all filters and sorting
- [ ] Test pagination
- [ ] Test error scenarios

### 10.2 Performance Optimization
- [ ] Implement React.lazy for all page components
- [ ] Optimize re-renders with React.memo where needed
- [ ] Implement SWR caching strategies
- [ ] Optimize bundle size
- [ ] Add loading prioritization

### 10.3 Accessibility
- [ ] Ensure all forms are keyboard navigable
- [ ] Add proper ARIA labels
- [ ] Test with screen reader
- [ ] Ensure color contrast meets WCAG AA
- [ ] Add focus indicators

---

## File Structure Summary

```
src/
├── auth/                          # Authentication (update existing)
├── components/
│   ├── data-table/               # Reusable table components
│   ├── form/                     # Form wrapper components
│   ├── stats/                    # Statistics display components
│   ├── trade/                    # Trade-specific components
│   ├── page/                     # Page layout components
│   └── error/                    # Error handling components
├── hooks/
│   └── use-auth-user.ts          # Auth user hook
├── layouts/                       # Update nav config
├── lib/
│   └── api-endpoints.ts          # API endpoint constants
├── pages/
│   └── dashboard/
│       ├── index.tsx             # Main dashboard
│       ├── trades/               # Trade pages
│       ├── coins/                # Coin pages
│       ├── strategies/           # Strategy pages
│       ├── analytics/            # Analytics page
│       ├── settings/             # Settings page
│       └── profile/              # Profile page
├── routes/                        # Update routes
├── sections/
│   ├── dashboard/                # Dashboard sections
│   ├── trades/                   # Trade sections
│   ├── coins/                    # Coin sections
│   ├── strategies/               # Strategy sections
│   ├── analytics/                # Analytics sections
│   ├── settings/                 # Settings sections
│   └── profile/                  # Profile sections
├── services/
│   ├── api.service.ts            # Base API service
│   ├── auth.service.ts           # Auth API
│   ├── coins.service.ts          # Coins API
│   ├── strategies.service.ts     # Strategies API
│   └── trades.service.ts         # Trades API
└── types/
    ├── api.ts                    # API types
    ├── auth.ts                   # Auth types
    ├── coin.ts                   # Coin types
    ├── strategy.ts               # Strategy types
    ├── trade.ts                  # Trade types
    └── index.ts                  # Export all
```

---

## Execution Plan & Parallel Execution Guide

### Dependency Graph

```
Timeline    Phase
────────────────────────────────────────────────────────────────────────

Stage 1     ┌─────────────────────────────────────┐
            │  Phase 1: Foundation & Configuration │
            │  (MUST complete first)               │
            └──────────────────┬──────────────────┘
                               │
                               ▼
Stage 2     ┌─────────────────────┐    ┌─────────────────────────┐
            │  Phase 2: Routing   │────│  Phase 3: Shared        │
            │  & Navigation       │    │  Components             │
            └─────────┬───────────┘    └────────────┬────────────┘
                      │                             │
                      └──────────────┬──────────────┘
                                     │
            ┌────────────────────────┼────────────────────────┐
            │                        │                        │
            ▼                        ▼                        ▼
Stage 3     ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐
            │  Phase 4:    │  │  Phase 5:    │  │  Phase 8:        │
            │  Coins CRUD  │  │  Strategies  │  │  Settings &      │
            │              │  │  CRUD        │  │  Profile         │
            └──────┬───────┘  └──────┬───────┘  └──────────────────┘
                   │                 │
                   └────────┬────────┘
                            │
                            ▼
Stage 4            ┌─────────────────────────┐
                   │  Phase 6: Trades        │
                   │  Management             │
                   │  (needs coins &         │
                   │  strategies dropdowns)  │
                   └───────────┬─────────────┘
                               │
                               ▼
Stage 5            ┌─────────────────────────┐
                   │  Phase 7: Dashboard     │
                   │  & Analytics            │
                   │  (needs trades data)    │
                   └───────────┬─────────────┘
                               │
                               ▼
Stage 6            ┌──────────────┐    ┌──────────────────┐
                   │  Phase 9:    │───▶│  Phase 10:       │
                   │  Polish & UX │    │  Testing &       │
                   │              │    │  Optimization    │
                   └──────────────┘    └──────────────────┘
```

### Parallelization Summary

| Stage | Phases | Can Run In Parallel | Dependencies |
|-------|--------|---------------------|--------------|
| **1** | Phase 1 | No (sequential) | None - must complete first |
| **2** | Phase 2, Phase 3 | Yes (2 parallel) | Phase 1 |
| **3** | Phase 4, Phase 5, Phase 8 | Yes (3 parallel) | Phase 1, 2, 3 |
| **4** | Phase 6 | No (sequential) | Phase 4, 5 (needs dropdowns) |
| **5** | Phase 7 | No (sequential) | Phase 6 (needs trades) |
| **6** | Phase 9 → Phase 10 | Sequential | All previous phases |

### Execution Commands

**Stage 1 - Foundation (Sequential)**
```bash
# Single agent
claude-code "Execute Phase 1 from IMPLEMENTATION_PLAN.md"
```

**Stage 2 - Routing & Components (2 Parallel Agents)**
```bash
# Agent 1
claude-code "Execute Phase 2 (Routing & Navigation) from IMPLEMENTATION_PLAN.md"

# Agent 2 (parallel)
claude-code "Execute Phase 3 (Shared Components) from IMPLEMENTATION_PLAN.md"
```

**Stage 3 - Master Data & Settings (3 Parallel Agents)**
```bash
# Agent 1
claude-code "Execute Phase 4 (Coins Management) from IMPLEMENTATION_PLAN.md"

# Agent 2 (parallel)
claude-code "Execute Phase 5 (Strategies Management) from IMPLEMENTATION_PLAN.md"

# Agent 3 (parallel)
claude-code "Execute Phase 8 (Settings & Profile) from IMPLEMENTATION_PLAN.md"
```

**Stage 4 - Trades (Sequential)**
```bash
claude-code "Execute Phase 6 (Trades Management) from IMPLEMENTATION_PLAN.md"
```

**Stage 5 - Dashboard (Sequential)**
```bash
claude-code "Execute Phase 7 (Dashboard & Analytics) from IMPLEMENTATION_PLAN.md"
```

**Stage 6 - Polish & Testing (Sequential)**
```bash
claude-code "Execute Phase 9 (Polish & UX) from IMPLEMENTATION_PLAN.md"
claude-code "Execute Phase 10 (Testing & Optimization) from IMPLEMENTATION_PLAN.md"
```

### Time Optimization

| Approach | Stages | Max Parallel Agents |
|----------|--------|---------------------|
| Fully Sequential | 10 phases one by one | 1 |
| Optimized Parallel | 6 stages | 3 (at Stage 3) |

**Estimated speedup with parallel execution: ~40% faster**

---

## Notes for Implementation

- Always use existing theme components from `src/components/` when available
- Follow the existing code patterns in the theme
- Use SWR for data fetching (already installed)
- Use React Hook Form + Zod for all forms (already installed)
- Use Framer Motion for animations (already installed)
- Use the existing `RHF*` components for form fields
- Use the existing `Label` component for badges
- Use the existing `Iconify` component for icons
- Leverage the existing `LoadingScreen` and `SplashScreen` components
- Use `sonner` for toast notifications (already installed)
- Follow MUI theming patterns for consistent styling
