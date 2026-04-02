# Feature Modules

## 1. Dashboard (`sections/dashboard/`)
**Purpose**: Home page showing trading overview and quick actions.
**Key Components**:
- `dashboard-view.tsx` - Main view
- `dashboard-stats.tsx` - Stats summary cards (total trades, P&L, win rate, etc.)
- `dashboard-open-trades.tsx` - List of currently open trades
- `dashboard-recent-trades.tsx` - Recent trade activity
- `dashboard-quick-actions.tsx` - Quick action buttons
**Data Source**: TradesService.getAnalytics(), TradesService.getAll()

## 2. Trades (`sections/trades/`)
**Purpose**: Full trade lifecycle management - create, view, edit, exit, track.
**Key Components**:
- `trades-list-view.tsx` - Main list with DataGrid, filters, Quick Add button
- `trades-details-view.tsx` - Single trade detail page with all info
- `trades-create-view.tsx` / `trades-edit-view.tsx` - Form views
- `trades-form.tsx` - Shared form component for create/edit
- `trade-exit-dialog.tsx` - Dialog to close a trade (avgExit, exitDate, exitTime, fees, notes, realisedPnl)
- `trade-edit-exit-dialog.tsx` - Edit exit details on already-closed trade
- `trade-quick-add-dialog.tsx` - Lightweight dialog for rapid trade entry (add-and-clear pattern, localStorage persistence)
- `trade-create-dialog.tsx` - Full create dialog
- `trade-notes-dialog.tsx` - View/edit trade notes
- `trades-table.tsx` / `trades-table-row.tsx` - Table display
- `trades-filters.tsx` - Filter bar (status, coin, strategy, date range)
- `trades-card.tsx` - Card display for trades
**Key Interactions**:
- Uses `TradingCalculatorDialog` (shared component) for full trade creation with position sizing
- Exit flow: opens `trade-exit-dialog` -> calls previewExit API -> shows P&L preview -> confirms -> calls exit API
- Quick Add: simplified form, persists last coin/strategy selection

## 3. Backtest (`sections/backtest/`)
**Purpose**: Record and analyze backtested trades per strategy.
**Key Components**:
- `backtest-list-view.tsx` - Lists strategies with their backtest analytics
- `backtest-strategy-view.tsx` - Shows all backtest trades for a specific strategy with analytics summary
- `backtest-add-trade-dialog.tsx` - Add backtest trade (add-and-clear pattern with localStorage, pre-fills from last trade)
- `backtest-trades-table.tsx` / `backtest-trades-table-row.tsx` - Trade data display
- `backtest-trades-filters.tsx` - Filter by coin, direction, date
- `backtest-strategy-card.tsx` - Strategy summary card with win rate, EV, R-values
- `backtest-notes-dialog.tsx` - View/edit backtest trade notes
**Analytics**: Win %, avg winning R, avg losing R, expected value (EV), days to 100 trades projection

## 4. Analytics (`sections/analytics/`)
**Purpose**: Comprehensive trade performance analytics and visualization.
**Key Components**:
- `analytics-summary.tsx` - Overall performance summary stats
- `analytics-charts.tsx` - P&L charts, equity curves
- `analytics-by-strategy.tsx` - Performance breakdown by strategy
- `analytics-by-coin.tsx` - Performance breakdown by coin/asset
- `pnl-calendar.tsx` - Calendar heatmap showing daily P&L
- `trade-duration-analysis.tsx` - Trade duration distribution analysis
- `analytics-filters.tsx` - Date range and other filters
**Data Source**: TradesService.getAnalytics(), TradesService.getDailyPnl()

## 5. Coins (`sections/coins/`) - Master Data
**Purpose**: Manage tradeable assets/coins.
**Components**: Standard CRUD pattern - list, create dialog, edit dialog, table, card, form
**Fields**: symbol, name, image (optional)
**Constraint**: Symbol unique per organization

## 6. Strategies (`sections/strategies/`) - Master Data
**Purpose**: Define and manage trading strategies.
**Components**: Standard CRUD pattern - list, create dialog, edit dialog, table, card, form
**Fields**: name, description, entryRule, exitRule, stopLossRule, notes, rules (JSON)
**Constraint**: Name unique per organization

## 7. Account (`sections/account/`)
**Purpose**: User profile and application settings (merged from legacy separate profile/settings pages).
**Legacy redirects**: `/dashboard/settings` and `/dashboard/profile` both redirect to `/dashboard/account`
