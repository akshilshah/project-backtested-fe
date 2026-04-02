# Routes and API Endpoints

## Frontend Routes (all under /dashboard, protected by AuthGuard)

| Route | View Component | Section |
|-------|---------------|---------|
| `/dashboard` | `dashboard-view.tsx` | Dashboard home |
| `/dashboard/trades` | `trades-list-view.tsx` | Trade list with filters |
| `/dashboard/trades/new` | `trades-create-view.tsx` | Create new trade |
| `/dashboard/trades/:id` | `trades-details-view.tsx` | Trade detail page |
| `/dashboard/trades/:id/edit` | `trades-edit-view.tsx` | Edit existing trade |
| `/dashboard/coins` | Coins list view | Coin master data |
| `/dashboard/coins/new` | Create coin | |
| `/dashboard/coins/:id` | Coin details | |
| `/dashboard/coins/:id/edit` | Edit coin | |
| `/dashboard/strategies` | Strategies list view | Strategy master data |
| `/dashboard/strategies/new` | Create strategy | |
| `/dashboard/strategies/:id` | Strategy details | |
| `/dashboard/strategies/:id/edit` | Edit strategy | |
| `/dashboard/backtest` | `backtest-list-view.tsx` | Backtest strategies list |
| `/dashboard/backtest/:id` | `backtest-strategy-view.tsx` | Strategy backtest trades |
| `/dashboard/analytics` | Analytics view | Charts, PnL calendar |
| `/dashboard/account` | Account view | Profile + settings (merged) |

## API Endpoints

### Auth (`/api/auth`) - Public
- `POST /api/auth/login` - JWT login
- `POST /api/auth/signup` - User registration
- `GET /api/auth/profile` - Get user profile (protected)
- `PUT /api/auth/settings` - Update user settings (protected)

### All below routes require JWT token (via `protect` middleware)

### Coins (`/api/masters/coins`)
- `GET /api/masters/coins` - List all coins
- `POST /api/masters/coins` - Create coin
- `GET /api/masters/coins/:id` - Get coin details
- `PUT /api/masters/coins/:id` - Update coin
- `DELETE /api/masters/coins/:id` - Delete coin

### Strategies (`/api/masters/strategies`)
- `GET /api/masters/strategies` - List all strategies
- `POST /api/masters/strategies` - Create strategy
- `GET /api/masters/strategies/:id` - Get strategy details
- `PUT /api/masters/strategies/:id` - Update strategy
- `DELETE /api/masters/strategies/:id` - Delete strategy

### Trades (`/api/trades`)
- `GET /api/trades` - List trades (with pagination, filters: status, coinId, strategyId, dateFrom, dateTo, search)
- `POST /api/trades` - Create trade
- `GET /api/trades/:id` - Get trade details
- `PUT /api/trades/:id` - Update trade
- `DELETE /api/trades/:id` - Delete trade
- `POST /api/trades/:id/exit` - Exit a trade (close it)
- `PUT /api/trades/:id/exit` - Update exit details
- `POST /api/trades/:id/preview-exit` - Preview P&L before exiting
- `GET /api/trades/analytics` - Trade analytics (aggregated stats)
- `GET /api/trades/analytics/daily-pnl` - Daily P&L for calendar (params: year, month)

### Backtest (`/api/backtest`)
- `GET /api/backtest` - List backtest trades
- `POST /api/backtest` - Create backtest trade
- `GET /api/backtest/:id` - Get backtest trade details
- `PUT /api/backtest/:id` - Update backtest trade
- `DELETE /api/backtest/:id` - Delete backtest trade
- `GET /api/backtest/analytics/:strategyId` - Strategy backtest analytics

### File Upload
- `POST /api/upload` - Upload file to S3 (multipart)

## Frontend Service Classes (all in `src/services/`)
- `ApiService` - Generic HTTP wrapper (get, post, put, patch, delete) with error handling
- `TradesService` - getAll, getById, create, update, delete, exit, updateExit, previewExit, getAnalytics, getDailyPnl
- `BacktestService` - getAll, getById, create, update, delete, getStrategyAnalytics
- `CoinsService` - Standard CRUD
- `StrategiesService` - Standard CRUD
- `AuthService` - login, signup, profile
