import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { CONFIG } from 'src/global-config';
import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/loading-screen';

import { AuthGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------

// Dashboard
const DashboardPage = lazy(() => import('src/pages/dashboard/index'));

// Trades
const TradesListPage = lazy(() => import('src/pages/dashboard/trades/index'));
const TradeCreatePage = lazy(() => import('src/pages/dashboard/trades/new'));
const TradeDetailsPage = lazy(() => import('src/pages/dashboard/trades/[id]/index'));
const TradeEditPage = lazy(() => import('src/pages/dashboard/trades/[id]/edit'));

// Coins
const CoinsListPage = lazy(() => import('src/pages/dashboard/coins/index'));
const CoinCreatePage = lazy(() => import('src/pages/dashboard/coins/new'));
const CoinDetailsPage = lazy(() => import('src/pages/dashboard/coins/[id]/index'));
const CoinEditPage = lazy(() => import('src/pages/dashboard/coins/[id]/edit'));

// Strategies
const StrategiesListPage = lazy(() => import('src/pages/dashboard/strategies/index'));
const StrategyCreatePage = lazy(() => import('src/pages/dashboard/strategies/new'));
const StrategyDetailsPage = lazy(() => import('src/pages/dashboard/strategies/[id]/index'));
const StrategyEditPage = lazy(() => import('src/pages/dashboard/strategies/[id]/edit'));

// Backtest
const BacktestListPage = lazy(() => import('src/pages/dashboard/backtest/index'));
const BacktestStrategyPage = lazy(() => import('src/pages/dashboard/backtest/[id]/index'));

// Analytics
const AnalyticsPage = lazy(() => import('src/pages/dashboard/analytics/index'));

// Account (merged Profile and Settings)
const AccountPage = lazy(() => import('src/pages/dashboard/account/index'));

// Settings (legacy - redirects to account)
const SettingsPage = lazy(() => import('src/pages/dashboard/settings/index'));

// Profile (legacy - redirects to account)
const ProfilePage = lazy(() => import('src/pages/dashboard/profile/index'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

export const dashboardRoutes: RouteObject[] = [
  {
    path: 'dashboard',
    element: CONFIG.auth.skip ? dashboardLayout() : <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { element: <DashboardPage />, index: true },
      // Trades
      {
        path: 'trades',
        children: [
          { element: <TradesListPage />, index: true },
          { path: 'new', element: <TradeCreatePage /> },
          { path: ':id', element: <TradeDetailsPage /> },
          { path: ':id/edit', element: <TradeEditPage /> },
        ],
      },
      // Coins
      {
        path: 'coins',
        children: [
          { element: <CoinsListPage />, index: true },
          { path: 'new', element: <CoinCreatePage /> },
          { path: ':id', element: <CoinDetailsPage /> },
          { path: ':id/edit', element: <CoinEditPage /> },
        ],
      },
      // Strategies
      {
        path: 'strategies',
        children: [
          { element: <StrategiesListPage />, index: true },
          { path: 'new', element: <StrategyCreatePage /> },
          { path: ':id', element: <StrategyDetailsPage /> },
          { path: ':id/edit', element: <StrategyEditPage /> },
        ],
      },
      // Backtest
      {
        path: 'backtest',
        children: [
          { element: <BacktestListPage />, index: true },
          { path: ':id', element: <BacktestStrategyPage /> },
        ],
      },
      // Analytics
      { path: 'analytics', element: <AnalyticsPage /> },
      // Account
      { path: 'account', element: <AccountPage /> },
      // Settings (legacy)
      { path: 'settings', element: <SettingsPage /> },
      // Profile (legacy)
      { path: 'profile', element: <ProfilePage /> },
    ],
  },
];
