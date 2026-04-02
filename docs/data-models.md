# Data Models and Database Schema

## Database: PostgreSQL via Prisma ORM

### Multi-tenancy
All entities are scoped by `organizationId`. Users belong to organizations. All queries are organization-scoped.

## Core Entities

### Organization
- id, name, description
- Has many: users, coins, strategies, trades, backtestTrades

### User
- id, email, password (bcrypt hashed), firstName, lastName, profileSettings (JSON)
- Belongs to Organization
- Has one UserSettings (currency, timezone, preferences JSON)
- Audit trail: createdBy/updatedBy on all entities

### Coin (Master Data)
- id, name, symbol, description, image
- Unique constraint: `[symbol, organizationId]`
- Referenced by Trade and BacktestTrade

### Strategy (Master Data)
- id, name, description, entryRule, exitRule, stopLossRule, notes, rules (JSON)
- Unique constraint: `[name, organizationId]`
- Referenced by Trade and BacktestTrade

### Trade (Core Entity)
- **Entry fields**: tradeDate (Date), tradeTime (Time), avgEntry, stopLoss, stopLossPercentage, quantity, amount, entryOrderType (MARKET/LIMIT), entryFeePercentage (default 0.02 for LIMIT)
- **Exit fields** (nullable until closed): avgExit, exitDate, exitTime, exitFeePercentage (default 0.05 for MARKET)
- **Status**: OPEN or CLOSED
- **Calculated on exit**: profitLoss, profitLossPercentage, duration (days)
- **Manual field**: realisedPnl (actual P&L from trading platform, entered manually)
- **Relations**: coinId -> Coin, strategyId -> Strategy
- **Notes**: Optional text field, can be set at entry or exit
- **Derived fields** (computed client-side): direction (Long if entry > SL, Short if entry < SL), tradeValue, commission
- **DB Indexes**: [orgId, status], [orgId, tradeDate], [coinId], [strategyId]

### BacktestTrade
- tradeDate (Date), tradeTime (Time), entry, stopLoss, exit
- **Calculated**: direction (Long/Short), rValue (R-multiple = profit/loss in risk units)
- **Relations**: coinId -> Coin, strategyId -> Strategy
- Notes optional
- **DB Indexes**: [orgId, strategyId], [orgId, tradeDate], [coinId], [strategyId]

## Key Business Logic

### Trade Lifecycle
1. **Open**: User creates trade with entry details -> status = OPEN
2. **Exit**: User exits trade via exit dialog -> calculates P&L, duration -> status = CLOSED
3. **Update Exit**: Can modify exit details on closed trades
4. **Preview Exit**: Calculates P&L without actually closing (API endpoint)
5. **Realised PnL**: Optional manual entry of actual platform P&L (may differ from calculated)

### Backtest Analytics (per strategy)
- totalTrades, wins, losses, winPercentage, lossPercentage
- avgWinningR, avgLossR, ev (expected value)
- daysTo100Trades (projection)

### Trade Analytics (aggregated)
- totalTrades, openTrades, closedTrades, winRate
- totalProfitLoss, averageProfitLoss, bestTrade, worstTrade, totalFeesPaid
- Breakdown by strategy, by coin, by duration bucket
- Daily PnL for calendar heatmap
