import type { TradeAnalytics } from 'src/types/trade';

import Grid from '@mui/material/Grid';

import { StatCard } from 'src/components/stats/stat-card';

// ----------------------------------------------------------------------

type AnalyticsSummaryProps = {
  analytics: TradeAnalytics | undefined;
  loading: boolean;
};

export function AnalyticsSummary({ analytics, loading }: AnalyticsSummaryProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <Grid container spacing={3}>
      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Total Trades"
          value={analytics?.totalTrades ?? 0}
          icon="solar:chart-square-bold-duotone"
          iconColor="primary.main"
          loading={loading}
          subtitle={`${analytics?.closedTrades ?? 0} closed, ${analytics?.openTrades ?? 0} open`}
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Win Rate"
          value={analytics?.winRate ?? 0}
          icon="solar:medal-star-bold-duotone"
          iconColor="warning.main"
          loading={loading}
          format="percent"
          decimals={1}
          subtitle="Based on closed trades"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Total P&L"
          value={analytics?.totalProfitLoss ?? 0}
          icon="solar:wallet-money-bold-duotone"
          iconColor={
            (analytics?.totalProfitLoss ?? 0) >= 0 ? 'success.main' : 'error.main'
          }
          loading={loading}
          prefix="$"
          decimals={2}
          subtitle="Realized profit/loss"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Total Fees Paid"
          value={analytics?.totalFeesPaid ?? 0}
          icon="solar:dollar-minimalistic-bold-duotone"
          iconColor="info.main"
          loading={loading}
          prefix="$"
          decimals={2}
          subtitle="Entry + exit commissions"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Average P&L"
          value={analytics?.averageProfitLoss ?? 0}
          icon="solar:graph-up-bold-duotone"
          iconColor={
            (analytics?.averageProfitLoss ?? 0) >= 0 ? 'success.main' : 'error.main'
          }
          loading={loading}
          prefix="$"
          decimals={2}
          subtitle="Per closed trade"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Best Trade"
          value={loading ? '...' : formatCurrency(analytics?.bestTrade ?? 0)}
          icon="solar:cup-star-bold-duotone"
          iconColor="success.main"
          loading={loading}
          subtitle="Maximum profit"
        />
      </Grid>

      <Grid size={{ xs: 12, sm: 6, md: 4 }}>
        <StatCard
          title="Worst Trade"
          value={loading ? '...' : formatCurrency(analytics?.worstTrade ?? 0)}
          icon="solar:danger-triangle-bold-duotone"
          iconColor="error.main"
          loading={loading}
          subtitle="Maximum loss"
        />
      </Grid>
    </Grid>
  );
}
