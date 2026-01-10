import type { Trade } from 'src/types/trade';

import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { fDate, fTime, fDateTime } from 'src/utils/format-time';

import { TradesService } from 'src/services/trades.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';
import { LoadingScreen } from 'src/components/loading-screen';
import { DeleteDialog } from 'src/components/form/confirm-dialog';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { PriceDisplay } from 'src/components/trade/price-display';
import { TradeStatusBadge } from 'src/components/trade/trade-status-badge';
import { ProfitLossDisplay } from 'src/components/stats/profit-loss-display';

import { TradeExitDialog } from '../trade-exit-dialog';

// ----------------------------------------------------------------------

export function TradesDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);

  // Fetch trade data
  const {
    data: trade,
    isLoading,
    error,
    mutate,
  } = useSWR(id ? ['trade', id] : null, () => TradesService.getById(id!));

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
      await TradesService.delete(id);
      toast.success('Trade deleted successfully');
      router.push(paths.dashboard.trades.root);
    } catch (error: any) {
      const message = error?.response?.data?.message || 'Failed to delete trade';
      toast.error(message);
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
    }
  }, [id, router]);

  const handleOpenExit = useCallback(() => {
    setExitDialogOpen(true);
  }, []);

  const handleCloseExit = useCallback(() => {
    setExitDialogOpen(false);
  }, []);

  const handleConfirmExit = useCallback(
    async (data: { avgExit: number; exitDate: string; exitTime: string; notes?: string }) => {
      if (!id) return;

      try {
        setExitLoading(true);
        await TradesService.exit(id, data);
        toast.success('Trade closed successfully');
        mutate();
        setExitDialogOpen(false);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to close trade';
        toast.error(message);
      } finally {
        setExitLoading(false);
      }
    },
    [id, mutate]
  );

  if (isLoading) {
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

  const isOpen = trade.status === 'OPEN';

  return (
    <PageContainer maxWidth="lg">
      <PageHeader
        title={`${trade.coin?.symbol ?? 'Trade'} Trade`}
        subtitle={`${fDate(trade.tradeDate)} at ${trade.tradeTime}`}
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Trades', href: paths.dashboard.trades.root },
          { label: `${trade.coin?.symbol ?? 'Trade'} Trade` },
        ]}
        backHref={paths.dashboard.trades.root}
        action={
          <Stack direction="row" spacing={1}>
            {isOpen && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  href={paths.dashboard.trades.edit(id!)}
                  startIcon={<Iconify icon={'solar:pen-bold' as any} />}
                >
                  Edit
                </Button>
                <Button
                  variant="contained"
                  color="warning"
                  onClick={handleOpenExit}
                  startIcon={<Iconify icon={'solar:logout-2-bold' as any} />}
                >
                  Exit Trade
                </Button>
              </>
            )}
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

      <Grid container spacing={3}>
        {/* Main Trade Info Card */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* Header */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <CoinDisplay
                    symbol={trade.coin?.symbol ?? 'N/A'}
                    name={trade.coin?.name}
                    showName
                    size="large"
                  />
                  <TradeStatusBadge status={trade.status} />
                </Stack>

                <Divider />

                {/* Entry Details */}
                <Box>
                  <Typography variant="overline" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                    Entry Details
                  </Typography>
                  <Grid container spacing={3}>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <DetailItem label="Date" value={fDate(trade.tradeDate)} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <DetailItem label="Time" value={trade.tradeTime} />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <PriceDisplay value={trade.avgEntry} label="Avg Entry" size="small" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <PriceDisplay value={trade.stopLoss} label="Stop Loss" size="small" color="warning.main" />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <DetailItem label="Quantity" value={trade.quantity.toString()} />
                    </Grid>
                  </Grid>
                </Box>

                {/* Exit Details (if closed) */}
                {trade.status === 'CLOSED' && trade.avgExit && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                        Exit Details
                      </Typography>
                      <Grid container spacing={3}>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <DetailItem label="Date" value={trade.exitDate ? fDate(trade.exitDate) : '-'} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <DetailItem label="Time" value={trade.exitTime ?? '-'} />
                        </Grid>
                        <Grid size={{ xs: 6, sm: 3 }}>
                          <PriceDisplay
                            value={trade.avgExit}
                            label="Avg Exit"
                            size="small"
                            color={trade.avgExit >= trade.avgEntry ? 'success.main' : 'error.main'}
                          />
                        </Grid>
                      </Grid>
                    </Box>
                  </>
                )}

                {/* Notes */}
                {trade.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="overline" sx={{ color: 'text.secondary', mb: 1, display: 'block' }}>
                        Notes
                      </Typography>
                      <Typography variant="body2">{trade.notes}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Side Panel */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {/* P&L Card (if closed) */}
            {trade.status === 'CLOSED' && trade.profitLoss !== undefined && (
              <Card>
                <CardContent>
                  <Typography variant="overline" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                    Profit/Loss
                  </Typography>
                  <ProfitLossDisplay
                    value={trade.profitLoss}
                    percentage={trade.profitLossPercentage}
                    showIcon
                    size="large"
                    variant="filled"
                  />
                </CardContent>
              </Card>
            )}

            {/* Strategy Card */}
            <Card>
              <CardContent>
                <Typography variant="overline" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                  Strategy
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: 1,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: 'primary.lighter',
                      color: 'primary.main',
                    }}
                  >
                    <Iconify icon={'solar:chart-2-bold' as any} width={24} />
                  </Box>
                  <Box>
                    <Typography variant="subtitle2">{trade.strategy?.name ?? 'N/A'}</Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Trading Strategy
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Risk Card */}
            <Card>
              <CardContent>
                <Typography variant="overline" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                  Risk Analysis
                </Typography>
                <Stack spacing={2}>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Risk Amount
                    </Typography>
                    <Typography variant="subtitle2">
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(Math.abs(trade.avgEntry - trade.stopLoss) * trade.quantity)}
                    </Typography>
                  </Stack>
                  <Stack direction="row" justifyContent="space-between">
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      Risk %
                    </Typography>
                    <Typography variant="subtitle2">
                      {(((trade.avgEntry - trade.stopLoss) / trade.avgEntry) * 100).toFixed(2)}%
                    </Typography>
                  </Stack>
                </Stack>
              </CardContent>
            </Card>

            {/* Audit Info Card */}
            <Card>
              <CardContent>
                <Typography variant="overline" sx={{ color: 'text.secondary', mb: 2, display: 'block' }}>
                  Information
                </Typography>
                <Stack spacing={1.5}>
                  <DetailItem label="Created" value={fDateTime(trade.createdAt)} />
                  <DetailItem label="Last Updated" value={fDateTime(trade.updatedAt)} />
                </Stack>
              </CardContent>
            </Card>
          </Stack>
        </Grid>
      </Grid>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Trade"
        itemName={`${trade.coin?.symbol ?? 'Trade'} trade from ${fDate(trade.tradeDate)}`}
        loading={deleting}
      />

      <TradeExitDialog
        open={exitDialogOpen}
        trade={trade}
        onClose={handleCloseExit}
        onConfirm={handleConfirmExit}
        loading={exitLoading}
      />
    </PageContainer>
  );
}

// ----------------------------------------------------------------------

type DetailItemProps = {
  label: string;
  value: string;
};

function DetailItem({ label, value }: DetailItemProps) {
  return (
    <Box>
      <Typography variant="caption" sx={{ color: 'text.secondary', mb: 0.5, display: 'block' }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ fontWeight: 500 }}>
        {value}
      </Typography>
    </Box>
  );
}
