import type { CreateTradeRequest } from 'src/types/trade';

import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';

import { TradesForm } from '../trades-form';

// ----------------------------------------------------------------------

export function TradesCreateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Fetch coins for dropdown
  const { data: coinsData, isLoading: coinsLoading } = useSWR('coins-all', () =>
    CoinsService.getAll({ limit: 100 })
  );

  // Fetch strategies for dropdown
  const { data: strategiesData, isLoading: strategiesLoading } = useSWR('strategies-all', () =>
    StrategiesService.getAll({ limit: 100 })
  );

  const coins = coinsData?.coins ?? [];
  const strategies = strategiesData?.strategies ?? [];

  const handleSubmit = useCallback(
    async (data: CreateTradeRequest) => {
      try {
        setLoading(true);
        await TradesService.create(data);
        toast.success('Trade created successfully');
        router.push(paths.dashboard.trades.root);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create trade';
        toast.error(message);
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push(paths.dashboard.trades.root);
  }, [router]);

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="New Trade"
        subtitle="Record a new trade entry"
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Trades', href: paths.dashboard.trades.root },
          { label: 'New Trade' },
        ]}
        backHref={paths.dashboard.trades.root}
      />

      <TradesForm
        coins={coins}
        strategies={strategies}
        coinsLoading={coinsLoading}
        strategiesLoading={strategiesLoading}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </PageContainer>
  );
}
