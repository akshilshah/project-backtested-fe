# Backtested - Trading Management System

A full-stack web application for crypto traders to log, track, backtest, and analyze their trades.

## Tech Stack

### Frontend (`/frontend`)
- **Framework**: React 19 + TypeScript
- **Build**: Vite 7 with SWC plugin, PWA support (vite-plugin-pwa)
- **UI Kit**: MUI v7 (Material UI) - based on Minimal Kit starter template v7.6.1
- **Styling**: Emotion (CSS-in-JS), MUI theming system
- **Forms**: react-hook-form + zod validation + @hookform/resolvers
- **Data Fetching**: SWR for caching, Axios for HTTP
- **Routing**: react-router-dom v7
- **Charts**: ApexCharts (react-apexcharts)
- **Date**: dayjs
- **Animations**: framer-motion
- **Icons**: @iconify/react
- **Toasts**: sonner
- **Package Manager**: yarn 1.22

### API (`/api`)
- **Framework**: Express.js (Node.js)
- **Database**: PostgreSQL via Prisma ORM (v7)
- **Auth**: JWT (jsonwebtoken + bcrypt)
- **Validation**: Joi (legacy) + Zod
- **File Upload**: multer + AWS S3 (multer-s3)
- **Email**: AWS SES
- **Queue**: AWS SQS
- **Monitoring**: Sentry
- **Build**: Rollup
- **Process Manager**: PM2 (port 31003)

## Project Structure

### Frontend Key Directories
```
src/
├── auth/           # JWT auth context, guards, hooks
├── components/     # Shared reusable components
│   ├── trading-calculator/  # Trade entry calculator dialog
│   ├── trade/              # Trade display components (card, status badge, price, coin)
│   ├── stats/              # StatCard, StatsGrid, ProfitLossDisplay, TrendIndicator
│   ├── hook-form/          # react-hook-form wrappers for MUI
│   ├── data-table/         # Reusable data table
│   └── ...                 # nav-section, settings, logo, loading-screen, etc.
├── layouts/        # Dashboard layout with sidebar navigation
├── lib/            # Axios instance config (base URL, JWT interceptor, endpoints)
├── pages/          # Thin page wrappers that import section views
├── routes/         # Route definitions and path constants
├── sections/       # Feature modules (the main business logic views)
│   ├── dashboard/  # Home dashboard with stats, recent trades, open trades
│   ├── trades/     # Trade CRUD, list, details, exit, quick-add
│   ├── backtest/   # Backtest trade management by strategy
│   ├── analytics/  # Charts, PnL calendar, duration analysis, by-coin/strategy
│   ├── coins/      # Master data - coin CRUD
│   ├── strategies/ # Master data - strategy CRUD
│   └── account/    # User profile + settings (merged)
├── services/       # API service classes (static methods, typed)
├── types/          # TypeScript interfaces for all entities
├── hooks/          # Custom React hooks
├── theme/          # MUI theme customization
└── utils/          # Utility functions
```

### API Key Directories
```
src/
├── app.js          # Express app setup, middleware, route mounting
├── server.js       # HTTP server startup
├── config/         # Environment config
├── services/       # Route handlers organized by domain
│   ├── auth/       # Login, signup, profile, JWT protect middleware
│   ├── trade/      # Trade CRUD, exit, preview-exit, analytics
│   ├── backtest/   # Backtest trade CRUD, strategy analytics
│   └── masters/    # Coins and Strategies CRUD
│       ├── coins/
│       └── strategies/
├── utils/          # Helpers (validation, express-helper, multer, s3)
└── scripts/        # DB scripts
prisma/
├── schema.prisma   # Database schema
└── migrations/     # Migration history
```
