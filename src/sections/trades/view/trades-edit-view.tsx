import type { CreateTradeRequest } from 'src/types/trade';

import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';
import { LoadingScreen } from 'src/components/loading-screen';

import { TradesForm } from '../trades-form';

// ----------------------------------------------------------------------

export function TradesEditView() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  // Fetch trade data
  const {
    data: trade,
    isLoading: tradeLoading,
    error,
  } = useSWR(id ? ['trade', id] : null, () => TradesService.getById(id!));

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
      if (!id) return;

      try {
        setLoading(true);
        await TradesService.update(id, data);
        toast.success('Trade updated successfully');
        router.push(paths.dashboard.trades.details(id));
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 404) {
          toast.error('Trade not found');
        } else if (status === 400) {
          toast.error(message || 'Invalid trade data');
        } else {
          toast.error(message || 'Failed to update trade');
        }
      } finally {
        setLoading(false);
      }
    },
    [id, router]
  );

  const handleCancel = useCallback(() => {
    if (id) {
      router.push(paths.dashboard.trades.details(id));
    } else {
      router.push(paths.dashboard.trades.root);
    }
  }, [id, router]);

  if (tradeLoading) {
    return <LoadingScreen />;
  }

  if (error || !trade) {
    return (
      <PageContainer maxWidth="lg">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.response?.status === 404
            ? 'Trade not found. It may have been deleted.'
            : 'Failed to load trade. Please try again.'}
        </Alert>
      </PageContainer>
    );
  }

  // Cannot edit closed trades
  if (trade.status === 'CLOSED') {
    return (
      <PageContainer maxWidth="lg">
        <PageHeader
          title="Edit Trade"
          subtitle="Update trade details"
          breadcrumbs={[
            { label: 'Dashboard', href: paths.dashboard.root },
            { label: 'Trades', href: paths.dashboard.trades.root },
            { label: `${trade.coin?.symbol ?? 'Trade'}`, href: paths.dashboard.trades.details(id!) },
            { label: 'Edit' },
          ]}
          backHref={paths.dashboard.trades.details(id!)}
        />
        <Alert severity="warning">
          This trade has been closed and cannot be edited. Only open trades can be modified.
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title="Edit Trade"
        subtitle={`Update ${trade.coin?.symbol ?? 'trade'} trade`}
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Trades', href: paths.dashboard.trades.root },
          { label: `${trade.coin?.symbol ?? 'Trade'}`, href: paths.dashboard.trades.details(id!) },
          { label: 'Edit' },
        ]}
        backHref={paths.dashboard.trades.details(id!)}
      />

      <TradesForm
        currentTrade={trade}
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
