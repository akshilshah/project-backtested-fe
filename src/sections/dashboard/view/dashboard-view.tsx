import type { Trade } from 'src/types/trade';

import { useState, useEffect, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

import { useAuthUser } from 'src/hooks/use-auth-user';

import { preloadCriticalRoutes } from 'src/lib/preload';
import { TradesService } from 'src/services/trades.service';

import { PageContainer } from 'src/components/page/page-container';

import { DashboardStats } from '../dashboard-stats';
import { DashboardOpenTrades } from '../dashboard-open-trades';
import { DashboardQuickActions } from '../dashboard-quick-actions';
import { DashboardRecentTrades } from '../dashboard-recent-trades';
import { TradeExitDialog } from '../../trades/trade-exit-dialog';

// ----------------------------------------------------------------------

export function DashboardView() {
  const user = useAuthUser();
  const [exitTrade, setExitTrade] = useState<Trade | null>(null);
  const [exitLoading, setExitLoading] = useState(false);

  // Preload critical routes after dashboard loads
  useEffect(() => {
    preloadCriticalRoutes();
  }, []);

  // Fetch analytics data
  const { data: analyticsData, isLoading: analyticsLoading } = useSWR(
    'dashboard-analytics',
    () => TradesService.getAnalytics()
  );

  // Fetch recent trades
  const { data: tradesData, isLoading: tradesLoading, mutate: mutateTrades } = useSWR(
    'dashboard-trades',
    () => TradesService.getAll({ limit: 20 })
  );

  const trades = tradesData?.trades ?? [];

  const handleOpenExit = useCallback((trade: Trade) => {
    setExitTrade(trade);
  }, []);

  const handleCloseExit = useCallback(() => {
    setExitTrade(null);
  }, []);

  const handleConfirmExit = useCallback(
    async (data: { avgExit: number; exitDate: string; exitTime: string; notes?: string }) => {
      if (!exitTrade) return;

      try {
        setExitLoading(true);
        await TradesService.exit(exitTrade.id, data);
        toast.success('Trade closed successfully');
        mutateTrades();
        setExitTrade(null);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to close trade';
        toast.error(message);
      } finally {
        setExitLoading(false);
      }
    },
    [exitTrade, mutateTrades]
  );

  const greeting = getGreeting();
  const firstName = user?.firstName || 'Trader';

  return (
    <PageContainer>
      <Typography variant="h4" sx={{ mb: 1 }}>
        {greeting}, {firstName}!
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 4 }}>
        Here&apos;s an overview of your trading activity
      </Typography>

      <Grid container spacing={3}>
        {/* Stats Row */}
        <Grid size={12}>
          <DashboardStats analytics={analyticsData} loading={analyticsLoading} />
        </Grid>

        {/* Open Trades & Quick Actions */}
        <Grid size={{ xs: 12, lg: 8 }}>
          <DashboardOpenTrades
            trades={trades}
            loading={tradesLoading}
            onExit={handleOpenExit}
          />
        </Grid>

        <Grid size={{ xs: 12, lg: 4 }}>
          <DashboardQuickActions />
        </Grid>

        {/* Recent Closed Trades */}
        <Grid size={12}>
          <DashboardRecentTrades trades={trades} loading={tradesLoading} />
        </Grid>
      </Grid>

      {/* Exit Trade Dialog */}
      <TradeExitDialog
        open={!!exitTrade}
        trade={exitTrade}
        onClose={handleCloseExit}
        onConfirm={handleConfirmExit}
        loading={exitLoading}
      />
    </PageContainer>
  );
}

// ----------------------------------------------------------------------

function getGreeting(): string {
  const hour = new Date().getHours();

  if (hour < 12) {
    return 'Good morning';
  }
  if (hour < 17) {
    return 'Good afternoon';
  }
  return 'Good evening';
}
