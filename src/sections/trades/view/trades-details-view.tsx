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
import { TradeNotesDialog } from '../trade-notes-dialog';

// ----------------------------------------------------------------------

export function TradesDetailsView() {
  const router = useRouter();
  const { id } = useParams();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [exitDialogOpen, setExitDialogOpen] = useState(false);
  const [exitLoading, setExitLoading] = useState(false);
  const [calculatorOpen, setCalculatorOpen] = useState(false);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [notesLoading, setNotesLoading] = useState(false);

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
    // For closed trades, only allow editing notes
    if (trade?.status === 'CLOSED') {
      setNotesDialogOpen(true);
    } else {
      setCalculatorOpen(true);
    }
  }, [trade?.status]);

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

  const handleCloseNotes = useCallback(() => {
    setNotesDialogOpen(false);
  }, []);

  const handleConfirmNotes = useCallback(
    async (notes?: string) => {
      if (!id) return;

      try {
        setNotesLoading(true);
        await TradesService.update(id, { notes });
        toast.success('Notes updated successfully');
        mutate();
        setNotesDialogOpen(false);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Failed to update notes';
        toast.error(message);
      } finally {
        setNotesLoading(false);
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
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleOpenEdit}
              startIcon={<Iconify icon={'solar:pen-bold' as any} />}
            >
              {isOpen ? 'Edit' : 'Edit Notes'}
            </Button>
            {isOpen && (
              <Button
                variant="contained"
                color="warning"
                onClick={handleOpenExit}
                startIcon={<Iconify icon={'solar:logout-2-bold' as any} />}
              >
                Exit Trade
              </Button>
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
      <Grid container spacing={3} sx={{ mb: 4 }}>
        {/* Coin Info */}
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <Card
            sx={{
              height: '100%',
              boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Stack spacing={2}>
                <CoinDisplay
                  symbol={trade.coin?.symbol ?? 'N/A'}
                  name={trade.coin?.name}
                  showName
                  size="medium"
                />
                <Stack direction="row" spacing={1} alignItems="center">
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
                      <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem' }}>
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

        {/* P/L Card - Only colored when closed */}
        {trade.status === 'CLOSED' && trade.profitLoss !== undefined && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                  PROFIT/LOSS
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
                    mt: 1,
                    mb: 0.5,
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
                      color: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
                    }}
                  >
                    {trade.profitLoss >= 0 ? '+' : ''}{trade.profitLossPercentage.toFixed(2)}%
                  </Typography>
                )}
                {trade.derived?.commission && (
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 1.5 }}>
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
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                  POSITION SIZE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mt: 1, mb: 0.5 }}>
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.derived.tradeValue)}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {trade.quantity?.toFixed(4)} × {new Intl.NumberFormat('en-US', {
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
            <Card
              sx={{
                height: '100%',
                boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
                border: '1px solid',
                borderColor: 'divider',
                '&:hover': {
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5 }}>
                  RISK
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mt: 1, mb: 0.5 }}>
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
                        p: 3,
                        borderRadius: 2,
                        bgcolor: (theme) => theme.palette.grey[50],
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                        <Iconify icon={'solar:import-bold' as any} width={20} sx={{ color: 'text.secondary' }} />
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontSize: '0.8125rem',
                          }}
                        >
                          Entry
                        </Typography>
                      </Stack>
                      <Grid container spacing={2.5}>
                        <Grid size={{ xs: 6 }}>
                          <PriceDisplay value={trade.avgEntry} label="Price" size="small" />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="Quantity" value={trade.quantity?.toFixed(4) ?? '-'} />
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
                          p: 3,
                          borderRadius: 2,
                          bgcolor: (theme) =>
                            trade.avgExit! >= trade.avgEntry
                              ? theme.palette.success.lighter
                              : theme.palette.error.lighter,
                          border: '1px solid',
                          borderColor: (theme) =>
                            trade.avgExit! >= trade.avgEntry
                              ? theme.palette.success.light
                              : theme.palette.error.light,
                        }}
                      >
                        <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                          <Iconify
                            icon={'solar:export-bold' as any}
                            width={20}
                            sx={{ color: trade.avgExit >= trade.avgEntry ? 'success.dark' : 'error.dark' }}
                          />
                          <Typography
                            variant="subtitle2"
                            sx={{
                              fontWeight: 700,
                              color: trade.avgExit >= trade.avgEntry ? 'success.dark' : 'error.dark',
                              letterSpacing: '0.5px',
                              textTransform: 'uppercase',
                              fontSize: '0.8125rem',
                            }}
                          >
                            Exit
                          </Typography>
                        </Stack>
                        <Grid container spacing={2.5}>
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
                          bgcolor: (theme) => theme.palette.grey[100],
                          color: 'text.secondary',
                        }}
                      >
                        <Iconify icon={'solar:chart-2-bold' as any} width={24} />
                      </Box>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            letterSpacing: '0.5px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                          }}
                        >
                          Strategy
                        </Typography>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, mt: 0.25 }}>
                          {trade.strategy?.name ?? 'N/A'}
                        </Typography>
                      </Box>
                    </Stack>
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Stack spacing={0.5}>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Trade Created
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
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
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          mb: 1.5,
                          textTransform: 'uppercase',
                          fontWeight: 600,
                          fontSize: '0.6875rem',
                          letterSpacing: '0.5px',
                        }}
                      >
                        Notes
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.7 }}>
                        {trade.notes}
                      </Typography>
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

      <TradeNotesDialog
        open={notesDialogOpen}
        trade={trade}
        onClose={handleCloseNotes}
        onConfirm={handleConfirmNotes}
        loading={notesLoading}
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
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          mb: 0.5,
          display: 'block',
          fontWeight: 600,
          textTransform: 'uppercase',
          fontSize: '0.6875rem',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          fontWeight: 600,
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
