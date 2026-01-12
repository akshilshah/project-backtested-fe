import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { CoinsService } from 'src/services/coins.service';

import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';

import { CoinsForm } from '../coins-form';

// ----------------------------------------------------------------------

export function CoinsCreateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: { symbol: string; name: string }) => {
      try {
        setLoading(true);
        await CoinsService.create(data);
        toast.success('Coin created successfully');
        router.push(paths.dashboard.coins.root);
      } catch (error: any) {
        const status = error?.response?.status;
        const message = error?.response?.data?.message;

        if (status === 409) {
          toast.error(message || 'A coin with this symbol already exists');
        } else {
          toast.error(message || 'Failed to create coin');
        }
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push(paths.dashboard.coins.root);
  }, [router]);

  return (
    <PageContainer maxWidth="md">
      <PageHeader
        title="Create Coin"
        subtitle="Add a new cryptocurrency to your list"
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Coins', href: paths.dashboard.coins.root },
          { label: 'New' },
        ]}
        backHref={paths.dashboard.coins.root}
      />

      <CoinsForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
    </PageContainer>
  );
}
