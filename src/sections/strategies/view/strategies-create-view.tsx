import type { CreateStrategyRequest } from 'src/types/strategy';

import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Container from '@mui/material/Container';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { StrategiesService } from 'src/services/strategies.service';

import { PageHeader } from 'src/components/page/page-header';

import { StrategyForm } from '../strategies-form';

// ----------------------------------------------------------------------

export function StrategiesCreateView() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(
    async (data: CreateStrategyRequest) => {
      setLoading(true);
      try {
        const strategy = await StrategiesService.create(data);
        toast.success(`Strategy "${strategy.name}" created successfully`);
        router.push(paths.dashboard.strategies.root);
      } catch (error: any) {
        console.error('Create strategy error:', error);
        toast.error(error?.message || 'Failed to create strategy');
        throw error;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const handleCancel = useCallback(() => {
    router.push(paths.dashboard.strategies.root);
  }, [router]);

  return (
    <Container maxWidth="md">
      <PageHeader
        title="Create Strategy"
        subtitle="Add a new trading strategy to your collection"
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Strategies', href: paths.dashboard.strategies.root },
          { label: 'Create' },
        ]}
        backHref={paths.dashboard.strategies.root}
      />

      <StrategyForm onSubmit={handleSubmit} onCancel={handleCancel} loading={loading} />
    </Container>
  );
}
