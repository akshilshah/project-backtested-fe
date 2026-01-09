import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';

import { CoinsService } from 'src/services/coins.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';
import { LoadingScreen } from 'src/components/loading-screen';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

export function CoinsDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Fetch coin data
  const { data: coin, isLoading, error } = useSWR(
    id ? ['coin', id] : null,
    () => CoinsService.getById(id!)
  );

  const handleOpenDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!id) return;

    try {
      setDeleting(true);
      await CoinsService.delete(id);
      toast.success('Coin deleted successfully');
      router.push(paths.dashboard.coins.root);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete coin';
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [id, router]);

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
        title={coin.name}
        subtitle={coin.symbol}
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Coins', href: paths.dashboard.coins.root },
          { label: coin.name },
        ]}
        backHref={paths.dashboard.coins.root}
        action={
          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              color="inherit"
              href={paths.dashboard.coins.edit(id!)}
              startIcon={<Iconify icon={'solar:pen-bold' as any} />}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleOpenDelete}
              startIcon={<Iconify icon={'solar:trash-bin-trash-bold' as any} />}
            >
              Delete
            </Button>
          </Stack>
        }
      />

      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Coin Icon and Basic Info */}
            <Stack direction="row" alignItems="center" spacing={3}>
              <Box
                sx={{
                  width: 72,
                  height: 72,
                  borderRadius: 2,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.lighter',
                  color: 'primary.main',
                  fontWeight: 700,
                  fontSize: '1.5rem',
                }}
              >
                {coin.symbol.slice(0, 2).toUpperCase()}
              </Box>
              <Box>
                <Typography variant="h5">{coin.name}</Typography>
                <Typography
                  variant="subtitle1"
                  sx={{ color: 'text.secondary', fontFamily: 'monospace' }}
                >
                  {coin.symbol}
                </Typography>
              </Box>
            </Stack>

            <Divider />

            {/* Details Grid */}
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 3,
              }}
            >
              <DetailItem label="Symbol" value={coin.symbol} mono />
              <DetailItem label="Name" value={coin.name} />
              <DetailItem label="Created" value={fDateTime(coin.createdAt)} />
              <DetailItem label="Last Updated" value={fDateTime(coin.updatedAt)} />
            </Box>
          </Stack>
        </CardContent>
      </Card>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Coin"
        itemName={coin.name}
        loading={deleting}
      />
    </PageContainer>
  );
}

// ----------------------------------------------------------------------

type DetailItemProps = {
  label: string;
  value: string;
  mono?: boolean;
};

function DetailItem({ label, value, mono }: DetailItemProps) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Typography
        variant="body1"
        sx={{
          fontWeight: 500,
          ...(mono && { fontFamily: 'monospace' }),
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
