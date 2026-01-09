import type { TradeAnalytics } from 'src/types/trade';

import Grid from '@mui/material/Grid';

import { StatCard } from 'src/components/stats/stat-card';

// ----------------------------------------------------------------------

type DashboardStatsProps = {
  analytics: TradeAnalytics | undefined;
  loading: boolean;
};

export function DashboardStats({ analytics, loading }: DashboardStatsProps) {
  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total Trades"
          value={analytics?.totalTrades ?? 0}
          icon="solar:chart-square-bold-duotone"
          iconColor="primary.main"
          loading={loading}
          subtitle="All time"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Open Positions"
          value={analytics?.openTrades ?? 0}
          icon="solar:play-circle-bold-duotone"
          iconColor="info.main"
          loading={loading}
          subtitle="Currently active"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Total P&L"
          value={analytics?.totalProfitLoss ?? 0}
          icon="solar:wallet-money-bold-duotone"
          iconColor={
            (analytics?.totalProfitLoss ?? 0) >= 0 ? 'success.main' : 'error.main'
          }
          loading={loading}
          format="currency"
          decimals={2}
          subtitle="Realized profit/loss"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 3 }}>
        <StatCard
          title="Win Rate"
          value={analytics?.winRate ?? 0}
          icon="solar:medal-star-bold-duotone"
          iconColor="warning.main"
          loading={loading}
          format="percent"
          decimals={1}
          subtitle="Closed trades"
        />
      </Grid>
    </Grid>
  );
}
