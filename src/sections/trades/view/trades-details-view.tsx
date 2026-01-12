import type { CreateTradeRequest } from 'src/types/trade';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

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

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { LoadingScreen } from 'src/components/loading-screen';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { DeleteDialog } from 'src/components/form/confirm-dialog';
import { PriceDisplay } from 'src/components/trade/price-display';
import { PageContainer } from 'src/components/page/page-container';
import { TradeStatusBadge } from 'src/components/trade/trade-status-badge';
import { TradingCalculatorDialog } from 'src/components/trading-calculator';

import { TradeExitDialog } from '../trade-exit-dialog';

// ----------------------------------------------------------------------

export function TradesDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);

  // Fetch trade data
  const {
    data: trade,
    isLoading,
    error,
    mutate,
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
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to delete trade';
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
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Failed to close trade';
        toast.error(message);
      } finally {
        setExitLoading(false);
      }
    },
    [id, mutate]
  );

  const handleOpenEdit = useCallback(() => {
    setCalculatorOpen(true);
  }, []);

  const handleCloseCalculator = useCallback(() => {
    setCalculatorOpen(false);
  }, []);

  const handleUpdateTrade = useCallback(
    async (data: CreateTradeRequest) => {
      if (!id) return;

      try {
        await TradesService.update(id, data);
        toast.success('Trade updated successfully');
        mutate();
        setCalculatorOpen(false);
      } catch (err: any) {
        const status = err?.response?.status;
        const message = err?.response?.data?.message;

        if (status === 404) {
          toast.error('Trade not found');
        } else if (status === 400) {
          toast.error(message || 'Invalid trade data');
        } else {
          toast.error(message || 'Failed to update trade');
        }
        throw err;
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
        subtitle={`${fDate(trade.tradeDate)} at ${fTime(trade.tradeTime)}`}
        backHref={paths.dashboard.trades.root}
        action={
          <Stack direction="row" spacing={1}>
            {isOpen && (
              <>
                <Button
                  variant="outlined"
                  color="inherit"
                  onClick={handleOpenEdit}
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

      {/* Hero Metrics Section */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* Coin Info */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card sx={{ height: '100%', bgcolor: 'background.neutral' }}>
            <CardContent>
              <Stack spacing={1}>
                <CoinDisplay
                  symbol={trade.coin?.symbol ?? 'N/A'}
                  name={trade.coin?.name}
                  showName
                  size="medium"
                />
                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                  {trade.derived?.direction && (
                    <Box
                      sx={{
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 1,
                        bgcolor: trade.derived.direction === 'Long' ? 'success.main' : 'error.main',
                        color: 'common.white',
                      }}
                    >
                      <Typography variant="caption" sx={{ fontWeight: 700 }}>
                        {trade.derived.direction.toUpperCase()}
                      </Typography>
                    </Box>
                  )}
                  <TradeStatusBadge status={trade.status} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* P/L Card - Most Important */}
        {trade.status === 'CLOSED' && trade.profitLoss !== undefined && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                bgcolor: trade.profitLoss >= 0 ? 'success.lighter' : 'error.lighter',
                border: 2,
                borderColor: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
              }}
            >
              <CardContent>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  PROFIT/LOSS
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: trade.profitLoss >= 0 ? 'success.dark' : 'error.dark',
                    mt: 0.5
                  }}
                >
                  {trade.profitLoss >= 0 ? '+' : ''}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.profitLoss)}
                </Typography>
                {trade.profitLossPercentage !== undefined && (
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 600,
                      color: trade.profitLoss >= 0 ? 'success.dark' : 'error.dark',
                    }}
                  >
                    {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%
                  </Typography>
                )}
                {trade.derived?.commission && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1 }}>
                    Net: {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(trade.profitLoss - trade.derived.commission)}
                  </Typography>
                )}
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Position Size */}
        {trade.derived?.tradeValue && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', bgcolor: 'primary.lighter' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  POSITION SIZE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'primary.dark', mt: 0.5 }}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.derived.tradeValue)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {trade.quantity} × {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.avgEntry)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Risk Info */}
        {trade.avgEntry && trade.stopLoss && trade.quantity && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card sx={{ height: '100%', bgcolor: 'warning.lighter' }}>
              <CardContent>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                  RISK
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'warning.dark', mt: 0.5 }}>
                  {(((trade.avgEntry - trade.stopLoss) / trade.avgEntry) * 100).toFixed(2)}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  SL @ {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.stopLoss)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>

      <Grid container spacing={3}>
        {/* Main Trade Info Card */}
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>

                {/* Entry & Exit Side by Side */}
                <Grid container spacing={3}>
                  {/* Entry Section */}
                  <Grid size={{ xs: 12, md: trade.status === 'CLOSED' ? 6 : 12 }}>
                    <Box
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        bgcolor: 'grey.100',
                        border: '1px solid',
                        borderColor: 'grey.300',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                        <Iconify icon={'solar:import-bold' as any} width={20} sx={{ color: 'text.primary' }} />
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'text.primary' }}>
                          ENTRY
                        </Typography>
                      </Stack>
                      <Grid container spacing={2}>
                        <Grid size={{ xs: 6 }}>
                          <PriceDisplay value={trade.avgEntry} label="Price" size="small" />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="Quantity" value={trade.quantity?.toString() ?? '-'} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="Date" value={fDate(trade.tradeDate)} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="Time" value={fTime(trade.tradeTime)} />
                        </Grid>
                      </Grid>
                    </Box>
                  </Grid>

                  {/* Exit Section */}
                  {trade.status === 'CLOSED' && trade.avgExit && (
                    <Grid size={{ xs: 12, md: 6 }}>
                      <Box
                        sx={{
                          p: 2,
                          borderRadius: 2,
                          bgcolor: 'grey.100',
                          border: '2px solid',
                          borderColor: trade.avgExit >= trade.avgEntry ? 'success.main' : 'error.main',
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                          <Iconify
                            icon={'solar:export-bold' as any}
                            width={20}
                            sx={{ color: trade.avgExit >= trade.avgEntry ? 'success.main' : 'error.main' }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: trade.avgExit >= trade.avgEntry ? 'success.main' : 'error.main'
                            }}
                          >
                            EXIT
                          </Typography>
                        </Stack>
                        <Grid container spacing={2}>
                          <Grid size={{ xs: 6 }}>
                            <PriceDisplay
                              value={trade.avgExit}
                              label="Price"
                              size="small"
                              color={trade.avgExit >= trade.avgEntry ? 'success.main' : 'error.main'}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem
                              label="Change"
                              value={`${trade.avgExit >= trade.avgEntry ? '+' : ''}${(((trade.avgExit - trade.avgEntry) / trade.avgEntry) * 100).toFixed(2)}%`}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem label="Date" value={trade.exitDate ? fDate(trade.exitDate) : '-'} />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem label="Time" value={trade.exitTime ? fTime(trade.exitTime) : '-'} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Strategy & Additional Info */}
                <Divider />
                <Grid container spacing={3}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack direction="row" alignItems="center" spacing={2}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          bgcolor: 'primary.lighter',
                          color: 'primary.main',
                        }}
                      >
                        <Iconify icon={'solar:chart-2-bold' as any} width={28} />
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                          Strategy
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                          {trade.strategy?.name ?? 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Trade Created
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {fDateTime(trade.createdAt)}
                      </Typography>
                    </Stack>
                  </Grid>
                </Grid>

                {/* Notes */}
                {trade.notes && (
                  <>
                    <Divider />
                    <Box>
                      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 1 }}>
                        NOTES
                      </Typography>
                      <Typography variant="body2">{trade.notes}</Typography>
                    </Box>
                  </>
                )}
              </Stack>
            </CardContent>
          </Card>
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

      <TradingCalculatorDialog
        open={calculatorOpen}
        onClose={handleCloseCalculator}
        coins={coins}
        strategies={strategies}
        coinsLoading={coinsLoading}
        strategiesLoading={strategiesLoading}
        onTakeTrade={handleUpdateTrade}
        currentTrade={trade}
        isEditMode
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
