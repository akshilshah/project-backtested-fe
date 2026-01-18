import type { TradeFilters } from 'src/types/trade';

import useSWR from 'swr';
import { useState, useCallback } from 'react';

import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

import { paths } from 'src/routes/paths';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';

import { PnlCalendar } from '../pnl-calendar';
import { AnalyticsCharts } from '../analytics-charts';
import { AnalyticsFilters } from '../analytics-filters';
import { AnalyticsSummary } from '../analytics-summary';
import { AnalyticsByStrategy } from '../analytics-by-strategy';

// ----------------------------------------------------------------------

export function AnalyticsView() {
  const [filters, setFilters] = useState<TradeFilters>({});

  // Fetch analytics data with filters
  const { data: analyticsData, isLoading: analyticsLoading } = useSWR(
    ['analytics', filters],
    () => TradesService.getAnalytics(filters),
    {
      keepPreviousData: true,
    }
  );

  // Fetch coins for filter dropdown
  const { data: coinsData, isLoading: coinsLoading } = useSWR('coins-all', () =>
    CoinsService.getAll({ limit: 100 })
  );

  // Fetch strategies for filter dropdown
  const { data: strategiesData, isLoading: strategiesLoading } = useSWR('strategies-all', () =>
    StrategiesService.getAll({ limit: 100 })
  );

  const coins = coinsData?.coins ?? [];
  const strategies = strategiesData?.strategies ?? [];

  const handleFiltersChange = useCallback((newFilters: TradeFilters) => {
    setFilters(newFilters);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
  }, []);

  return (
    <PageContainer>
      <PageHeader
        title="Analytics"
        subtitle="Analyze your trading performance"
        breadcrumbs={[{ label: 'Dashboard', href: paths.dashboard.root }, { label: 'Analytics' }]}
      />

      <Stack spacing={3}>
        {/* Filters */}
        <AnalyticsFilters
          filters={filters}
          onFiltersChange={handleFiltersChange}
          onClearFilters={handleClearFilters}
          coins={coins}
          strategies={strategies}
          coinsLoading={coinsLoading}
          strategiesLoading={strategiesLoading}
        />

        {/* Summary Stats */}
        <AnalyticsSummary analytics={analyticsData} loading={analyticsLoading} />

        {/* Charts */}
        <AnalyticsCharts analytics={analyticsData} loading={analyticsLoading} />

        {/* Calendar and Strategy Performance */}
        <Grid container spacing={3}>
          <Grid size={{ xs: 12, lg: 4.8 }}>
            <PnlCalendar loading={analyticsLoading} />
          </Grid>
          <Grid size={{ xs: 12, lg: 7.2 }}>
            <AnalyticsByStrategy analytics={analyticsData} loading={analyticsLoading} />
          </Grid>
        </Grid>
      </Stack>
    </PageContainer>
  );
}
