import type { UpdateStrategyRequest } from 'src/types/strategy';

import { useState, useCallback } from 'react';
import { useParams } from 'react-router';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';

import { useRouter } from 'src/routes/hooks';

import useSWR from 'swr';
import { toast } from 'sonner';

import { paths } from 'src/routes/paths';

import { PageHeader } from 'src/components/page/page-header';

import { StrategiesService } from 'src/services/strategies.service';

import { StrategyForm } from '../strategies-form';

// ----------------------------------------------------------------------

export function StrategiesEditView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [saving, setSaving] = useState(false);

  // Fetch strategy data
  const {
    data: strategy,
    isLoading,
    error,
  } = useSWR(id ? ['strategy', id] : null, () => StrategiesService.getById(id!));

  const handleSubmit = useCallback(
    async (data: UpdateStrategyRequest) => {
      if (!id) return;

      setSaving(true);
      try {
        await StrategiesService.update(id, data);
        toast.success('Strategy updated successfully');
        router.push(paths.dashboard.strategies.details(id));
      } catch (err: any) {
        console.error('Update strategy error:', err);
        toast.error(err?.message || 'Failed to update strategy');
        throw err;
      } finally {
        setSaving(false);
      }
    },
    [id, router]
  );

  const handleCancel = useCallback(() => {
    if (id) {
      router.push(paths.dashboard.strategies.details(id));
    } else {
      router.push(paths.dashboard.strategies.root);
    }
  }, [id, router]);

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !strategy) {
    return (
      <Container maxWidth="md">
        <PageHeader
          title="Strategy Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: paths.dashboard.root },
            { label: 'Strategies', href: paths.dashboard.strategies.root },
            { label: 'Edit' },
          ]}
          backHref={paths.dashboard.strategies.root}
        />
        <Box sx={{ textAlign: 'center', py: 10 }}>
          <Typography variant="h6" sx={{ mb: 2 }}>
            Strategy not found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            The strategy you are looking for does not exist or has been deleted.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md">
      <PageHeader
        title="Edit Strategy"
        subtitle={`Editing: ${strategy.name}`}
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Strategies', href: paths.dashboard.strategies.root },
          { label: strategy.name, href: paths.dashboard.strategies.details(id!) },
          { label: 'Edit' },
        ]}
        backHref={paths.dashboard.strategies.details(id!)}
      />

      <StrategyForm
        currentStrategy={strategy}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        loading={saving}
      />
    </Container>
  );
}
