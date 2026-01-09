import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Alert from '@mui/material/Alert';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { CoinsService } from 'src/services/coins.service';

import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';
import { LoadingScreen } from 'src/components/loading-screen';

import { CoinsForm } from '../coins-form';

// ----------------------------------------------------------------------

export function CoinsEditView() {
  const router = useRouter();
  const { id } = useParams();
  const [loading, setLoading] = useState(false);

  // Fetch coin data
  const { data: coin, isLoading, error } = useSWR(
    id ? ['coin', id] : null,
    () => CoinsService.getById(id!)
  );

  const handleSubmit = useCallback(
    async (data: { symbol: string; name: string }) => {
      if (!id) return;

      try {
        setLoading(true);
        await CoinsService.update(id, data);
        toast.success('Coin updated successfully');
        router.push(paths.dashboard.coins.root);
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 409) {
          toast.error(message || 'A coin with this symbol already exists');
        } else if (status === 404) {
          toast.error('Coin not found');
        } else {
          toast.error(message || 'Failed to update coin');
        }
      } finally {
        setLoading(false);
      }
    },
    [id, router]
  );

  const handleCancel = useCallback(() => {
    router.push(paths.dashboard.coins.root);
  }, [router]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (error || !coin) {
    return (
      <PageContainer maxWidth="md">
        <Alert severity="error" sx={{ mb: 3 }}>
          {error?.response?.status === 404
            ? 'Coin not found. It may have been deleted.'
            : 'Failed to load coin. Please try again.'}
        </Alert>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title="Edit Coin"
        subtitle={`Update ${coin.name} (${coin.symbol})`}
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Coins', href: paths.dashboard.coins.root },
          { label: coin.name, href: paths.dashboard.coins.details(id!) },
          { label: 'Edit' },
        ]}
        backHref={paths.dashboard.coins.details(id!)}
      />

      <CoinsForm
        currentCoin={coin}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={loading}
      />
    </PageContainer>
  );
}
