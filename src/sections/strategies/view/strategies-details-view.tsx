
import useSWR from 'swr';
import { toast } from 'sonner';
import { useParams } from 'react-router';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

export function StrategiesDetailsView() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch strategy data
  const {
    data: strategy,
    isLoading,
    error,
  } = useSWR(id ? ['strategy', id] : null, () => StrategiesService.getById(id!));

  const handleDelete = useCallback(async () => {
    if (!strategy) return;

    setDeleting(true);
    try {
      await StrategiesService.delete(strategy.id);
      toast.success(`Strategy "${strategy.name}" deleted successfully`);
      router.push(paths.dashboard.strategies.root);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete strategy');
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  }, [strategy, router]);

  // Loading state
  if (isLoading) {
    return (
      <Container maxWidth="lg">
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  // Error state
  if (error || !strategy) {
    return (
      <Container maxWidth="lg">
        <PageHeader
          title="Strategy Not Found"
          breadcrumbs={[
            { label: 'Dashboard', href: paths.dashboard.root },
            { label: 'Strategies', href: paths.dashboard.strategies.root },
            { label: 'Details' },
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

  const hasRules = strategy.rules && Object.keys(strategy.rules).length > 0;

  return (
    <Container maxWidth="lg">
      <PageHeader
        title={strategy.name}
        subtitle={strategy.description}
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Strategies', href: paths.dashboard.strategies.root },
          { label: strategy.name },
        ]}
        backHref={paths.dashboard.strategies.root}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              component={RouterLink}
              href={paths.dashboard.strategies.edit(String(strategy.id))}
              variant="contained"
              startIcon={<Iconify icon="solar:pen-bold" />}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              onClick={() => setDeleteOpen(true)}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <Grid container spacing={3}>
        {/* Strategy Details */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Strategy Details
              </Typography>

              <Stack spacing={2.5}>
                <DetailRow label="Name" value={strategy.name} />
                <DetailRow label="Description" value={strategy.description || 'No description'} />
                <DetailRow label="Created" value={fDateTime(strategy.createdAt)} />
                <DetailRow label="Last Updated" value={fDateTime(strategy.updatedAt)} />
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Rules Configuration */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 3 }}
              >
                <Typography variant="h6">Rules Configuration</Typography>
                {hasRules && (
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 0.5,
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: 'success.lighter',
                      color: 'success.darker',
                      typography: 'caption',
                      fontWeight: 600,
                    }}
                  >
                    <Iconify icon="solar:check-circle-bold" width={14} />
                    {Object.keys(strategy.rules!).length} rules defined
                  </Box>
                )}
              </Stack>

              {hasRules ? (
                <Box
                  component="pre"
                  sx={{
                    p: 2,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                    fontSize: '0.8125rem',
                    fontFamily: 'monospace',
                    overflow: 'auto',
                    maxHeight: 400,
                    m: 0,
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                  }}
                >
                  {JSON.stringify(strategy.rules, null, 2)}
                </Box>
              ) : (
                <Box
                  sx={{
                    py: 6,
                    textAlign: 'center',
                    color: 'text.secondary',
                  }}
                >
                  <Iconify
                    icon={'solar:document-text-bold' as any}
                    width={48}
                    sx={{ mb: 2, opacity: 0.5 }}
                  />
                  <Typography variant="body2">No rules configured for this strategy</Typography>
                  <Typography variant="caption" sx={{ display: 'block', mt: 1 }}>
                    Edit the strategy to add custom rules
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Audit Information */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ mb: 3 }}>
                Audit Information
              </Typography>

              <Grid container spacing={3}>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Strategy ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                  >
                    {strategy.id}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Organization ID
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{ fontFamily: 'monospace', wordBreak: 'break-all' }}
                  >
                    {strategy.organizationId}
                  </Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Created By
                  </Typography>
                  <Typography variant="body2">{strategy.createdBy || 'Unknown'}</Typography>
                </Grid>
                <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    Updated By
                  </Typography>
                  <Typography variant="body2">{strategy.updatedBy || 'Unknown'}</Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <DeleteDialog
        open={deleteOpen}
        onClose={() => setDeleteOpen(false)}
        onConfirm={handleDelete}
        title="Delete Strategy"
        itemName={strategy.name}
        loading={deleting}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

type DetailRowProps = {
  label: string;
  value: string;
};

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
        {label}
      </Typography>
      <Typography variant="body2">{value}</Typography>
    </Box>
  );
}
