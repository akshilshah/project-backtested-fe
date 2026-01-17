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
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useRouter, useParams } from 'src/routes/hooks';

import { fDate, fTime, fDateTime } from 'src/utils/format-time';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { LoadingScreen } from 'src/components/loading-screen';
import { DeleteDialog } from 'src/components/form/confirm-dialog';
import { PageContainer } from 'src/components/page/page-container';
import { TradingCalculatorDialog } from 'src/components/trading-calculator';

import { TradeExitDialog } from '../trade-exit-dialog';
import { TradeNotesDialog } from '../trade-notes-dialog';
import { TradeEditExitDialog } from '../trade-edit-exit-dialog';

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
  const [editExitDialogOpen, setEditExitDialogOpen] = useState(false);
  const [editExitLoading, setEditExitLoading] = useState(false);

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

  const handleOpenEditExit = useCallback(() => {
    setEditExitDialogOpen(true);
  }, []);

  const handleCloseEditExit = useCallback(() => {
    setEditExitDialogOpen(false);
  }, []);

  const handleConfirmEditExit = useCallback(
    async (data: { avgExit: number; exitDate: string; exitTime: string; notes?: string }) => {
      if (!id) return;

      try {
        setEditExitLoading(true);
        await TradesService.updateExit(id, data);
        toast.success('Exit details updated successfully');
        mutate();
        setEditExitDialogOpen(false);
      } catch (err: any) {
        const message = err?.response?.data?.message || 'Failed to update exit details';
        toast.error(message);
      } finally {
        setEditExitLoading(false);
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

  const direction = trade.derived?.direction;
  const tradeDirection = direction === 'Long' ? 'LONG' : 'SHORT';

  // Calculate duration in readable format
  const getDuration = () => {
    if (trade.status === 'OPEN') return null;

    let durationMs = trade.duration;

    // If duration is not provided or is 0, calculate it from entry and exit times
    if ((!durationMs || durationMs === 0) && trade.exitDate && trade.exitTime) {
      try {
        // Extract time components from the time strings
        const entryTime = new Date(trade.tradeTime);
        const exitTime = new Date(trade.exitTime);
        const entryDate = new Date(trade.tradeDate);
        const exitDate = new Date(trade.exitDate);

        // Combine date and time properly
        const entryDateTime = new Date(
          entryDate.getFullYear(),
          entryDate.getMonth(),
          entryDate.getDate(),
          entryTime.getHours(),
          entryTime.getMinutes(),
          entryTime.getSeconds()
        );

        const exitDateTime = new Date(
          exitDate.getFullYear(),
          exitDate.getMonth(),
          exitDate.getDate(),
          exitTime.getHours(),
          exitTime.getMinutes(),
          exitTime.getSeconds()
        );

        durationMs = exitDateTime.getTime() - entryDateTime.getTime();
      } catch (err) {
        console.error('Error calculating duration:', err);
        return null;
      }
    }

    if (!durationMs || durationMs <= 0) return null;

    const seconds = Math.floor(durationMs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  };

  const getDurationType = () => {
    if (trade.status === 'OPEN') return '';

    let durationMs = trade.duration;

    // If duration is not provided or is 0, calculate it from entry and exit times
    if ((!durationMs || durationMs === 0) && trade.exitDate && trade.exitTime) {
      try {
        const entryTime = new Date(trade.tradeTime);
        const exitTime = new Date(trade.exitTime);
        const entryDate = new Date(trade.tradeDate);
        const exitDate = new Date(trade.exitDate);

        const entryDateTime = new Date(
          entryDate.getFullYear(),
          entryDate.getMonth(),
          entryDate.getDate(),
          entryTime.getHours(),
          entryTime.getMinutes(),
          entryTime.getSeconds()
        );

        const exitDateTime = new Date(
          exitDate.getFullYear(),
          exitDate.getMonth(),
          exitDate.getDate(),
          exitTime.getHours(),
          exitTime.getMinutes(),
          exitTime.getSeconds()
        );

        durationMs = exitDateTime.getTime() - entryDateTime.getTime();
      } catch (err) {
        console.error('Error calculating duration type:', err);
        return '';
      }
    }

    if (!durationMs || durationMs <= 0) return '';

    const hours = Math.floor(durationMs / (1000 * 60 * 60));

    if (hours < 1) return `${direction} Scalp`;
    if (hours < 24) return `${direction} Intraday`;
    if (hours < 168) return `${direction} Swing`;
    return `${direction} Position`;
  };

  const timeSinceUpdate = () => {
    const now = new Date();
    const updated = new Date(trade.updatedAt);
    const diffMs = now.getTime() - updated.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffDays > 0) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
    if (diffHours > 0) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    if (diffMins > 0) return `${diffMins} ${diffMins === 1 ? 'minute' : 'minutes'} ago`;
    return 'just now';
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      <PageContainer maxWidth="lg">
        {/* Custom Header */}
        <Box sx={{ mb: 4, pt: 3 }}>
          <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={2}>
            <Stack direction="row" alignItems="center" spacing={2}>
              <IconButton
                onClick={() => router.push(paths.dashboard.trades.root)}
                sx={{ color: 'text.secondary' }}
              >
                <Iconify icon={'solar:alt-arrow-left-outline' as any} width={24} />
              </IconButton>
              <Box>
                <Stack direction="row" alignItems="center" spacing={1.5} flexWrap="wrap">
                  <Typography variant="h4" sx={{ fontWeight: 700 }}>
                    {trade.coin?.symbol ?? 'Trade'} Trade
                  </Typography>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.75,
                      bgcolor: direction === 'Long' ? 'success.main' : 'error.main',
                      color: 'common.white',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {tradeDirection}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 0.75,
                      bgcolor: trade.status === 'CLOSED' ? 'success.lighter' : 'info.lighter',
                      color: trade.status === 'CLOSED' ? 'success.darker' : 'info.darker',
                    }}
                  >
                    <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.75rem' }}>
                      {trade.status}
                    </Typography>
                  </Box>
                </Stack>
                <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                  {fDate(trade.tradeDate)} at {fTime(trade.tradeTime)}
                </Typography>
              </Box>
            </Stack>
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                color="inherit"
                onClick={handleOpenEdit}
                startIcon={<Iconify icon="solar:pen-bold" />}
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
                variant="contained"
                color="error"
                onClick={handleOpenDelete}
                startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
              >
                Delete
              </Button>
            </Stack>
          </Stack>
        </Box>

      {/* Metrics Section */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {/* P/L Card - Only for closed trades */}
        {trade.status === 'CLOSED' && trade.profitLoss !== undefined && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: 'none',
                border: '2px solid',
                borderColor: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.8 }}>
                    PROFIT/LOSS
                  </Typography>
                  <Iconify
                    icon={(trade.profitLoss >= 0 ? 'solar:graph-up-bold' : 'solar:graph-down-bold') as any}
                    width={20}
                    sx={{ color: trade.profitLoss >= 0 ? 'success.main' : 'error.main' }}
                  />
                </Stack>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 700,
                    color: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
                    mb: 0.5,
                  }}
                >
                  {trade.profitLoss >= 0 ? '' : '-'}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(Math.abs(trade.profitLoss))}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  {trade.profitLossPercentage !== undefined && (
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 600,
                        color: trade.profitLoss >= 0 ? 'success.main' : 'error.main',
                      }}
                    >
                      {trade.profitLoss >= 0 ? '' : '-'}{Math.abs(trade.profitLossPercentage).toFixed(2)}%
                    </Typography>
                  )}
                  {trade.derived?.commission && (
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Net:{' '}
                      {new Intl.NumberFormat('en-US', {
                        style: 'currency',
                        currency: 'USD',
                      }).format(trade.profitLoss - trade.derived.commission)}
                    </Typography>
                  )}
                </Stack>
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
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.8, display: 'block', mb: 1.5 }}
                >
                  POSITION SIZE
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
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
        {trade.avgEntry && trade.stopLoss && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.8, display: 'block', mb: 1.5 }}
                >
                  RISK
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  {direction === 'Short' ? '-' : ''}
                  {(Math.abs((trade.avgEntry - trade.stopLoss) / trade.avgEntry) * 100).toFixed(2)}%
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  SL @{' '}
                  {new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(trade.stopLoss)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}

        {/* Duration - Only for closed trades */}
        {trade.status === 'CLOSED' && getDuration() && (
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <Card
              sx={{
                height: '100%',
                boxShadow: 'none',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 2,
              }}
            >
              <CardContent sx={{ p: 2.5 }}>
                <Typography
                  variant="caption"
                  sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.8, display: 'block', mb: 1.5 }}
                >
                  DURATION
                </Typography>
                <Typography variant="h5" sx={{ fontWeight: 700, color: 'text.primary', mb: 0.5 }}>
                  {getDuration()}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {getDurationType()}
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
                        bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F9FAFB' : 'rgba(255, 255, 255, 0.05)'),
                        border: '1px solid',
                        borderColor: 'divider',
                      }}
                    >
                      <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 3 }}>
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            bgcolor: (theme) =>
                              theme.palette.mode === 'light' ? 'rgba(139, 92, 246, 0.12)' : 'rgba(139, 92, 246, 0.2)',
                          }}
                        >
                          <Iconify icon={'solar:arrow-down-bold' as any} width={20} sx={{ color: 'rgb(139, 92, 246)' }} />
                        </Box>
                        <Typography
                          variant="subtitle2"
                          sx={{
                            fontWeight: 700,
                            color: 'text.primary',
                            letterSpacing: '0.5px',
                            fontSize: '0.9375rem',
                          }}
                        >
                          Entry Details
                        </Typography>
                      </Stack>
                      <Grid container spacing={2.5}>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem
                            label="PRICE"
                            value={new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(trade.avgEntry)}
                          />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="QUANTITY" value={trade.quantity?.toFixed(4) ?? '-'} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="DATE" value={fDate(trade.tradeDate)} />
                        </Grid>
                        <Grid size={{ xs: 6 }}>
                          <DetailItem label="TIME" value={fTime(trade.tradeTime)} />
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
                          bgcolor: (theme) => (theme.palette.mode === 'light' ? '#F9FAFB' : 'rgba(255, 255, 255, 0.05)'),
                          border: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <Box
                              sx={{
                                width: 36,
                                height: 36,
                                borderRadius: '50%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                bgcolor: (theme) =>
                                  theme.palette.mode === 'light' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(34, 197, 94, 0.2)',
                              }}
                            >
                              <Iconify icon={'solar:arrow-up-bold' as any} width={20} sx={{ color: 'rgb(34, 197, 94)' }} />
                            </Box>
                            <Typography
                              variant="subtitle2"
                              sx={{
                                fontWeight: 700,
                                color: 'text.primary',
                                letterSpacing: '0.5px',
                                fontSize: '0.9375rem',
                              }}
                            >
                              Exit Details
                            </Typography>
                          </Stack>
                          <IconButton
                            size="small"
                            onClick={handleOpenEditExit}
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                bgcolor: 'action.hover',
                              },
                            }}
                          >
                            <Iconify icon="solar:pen-bold" width={16} />
                          </IconButton>
                        </Stack>
                        <Grid container spacing={2.5}>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem
                              label="PRICE"
                              value={new Intl.NumberFormat('en-US', {
                                style: 'currency',
                                currency: 'USD',
                              }).format(trade.avgExit)}
                              valueColor={trade.profitLoss && trade.profitLoss >= 0 ? 'success.main' : 'error.main'}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem
                              label="CHANGE"
                              value={`${trade.avgExit >= trade.avgEntry ? '+' : ''}${(
                                ((trade.avgExit - trade.avgEntry) / trade.avgEntry) *
                                100
                              ).toFixed(2)}%`}
                              valueColor={trade.profitLoss && trade.profitLoss >= 0 ? 'success.main' : 'error.main'}
                            />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem label="DATE" value={trade.exitDate ? fDate(trade.exitDate) : '-'} />
                          </Grid>
                          <Grid size={{ xs: 6 }}>
                            <DetailItem label="TIME" value={trade.exitTime ? fTime(trade.exitTime) : '-'} />
                          </Grid>
                        </Grid>
                      </Box>
                    </Grid>
                  )}
                </Grid>

                {/* Strategy Section */}
                <Divider />
                <Box>
                  <Stack direction="row" alignItems="flex-start" spacing={2.5}>
                    <Box
                      sx={{
                        width: 52,
                        height: 52,
                        borderRadius: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        bgcolor: (theme) =>
                          theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.08)',
                        color: 'text.secondary',
                        flexShrink: 0,
                      }}
                    >
                      <Iconify icon={'solar:chart-2-bold' as any} width={26} />
                    </Box>
                    <Stack direction="row" sx={{ flex: 1 }} spacing={0}>
                      <Box sx={{ flex: 1, pr: 3 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            display: 'block',
                            letterSpacing: '0.8px',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            mb: 1,
                          }}
                        >
                          STRATEGY
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>
                          {trade.strategy?.name ?? 'N/A'}
                        </Typography>
                        {(trade.strategy?.description || trade.strategy?.notes) && (
                          <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight: 1.7 }}>
                            {trade.strategy.description || trade.strategy.notes}
                          </Typography>
                        )}
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            textTransform: 'uppercase',
                            fontWeight: 600,
                            fontSize: '0.6875rem',
                            letterSpacing: '0.5px',
                            display: 'block',
                            mb: 0.5,
                          }}
                        >
                          TRADE CREATED
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums', mb: 1 }}>
                          {fDateTime(trade.createdAt)}
                        </Typography>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.6875rem',
                            display: 'block',
                            fontStyle: 'italic',
                          }}
                        >
                          Last modified {timeSinceUpdate()}
                        </Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>

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
                          letterSpacing: '0.8px',
                        }}
                      >
                        TRADE NOTES
                      </Typography>
                      <Typography variant="body2" sx={{ lineHeight: 1.8, fontStyle: 'italic', color: 'text.secondary' }}>
                        &ldquo;{trade.notes}&rdquo;
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

      <TradeEditExitDialog
        open={editExitDialogOpen}
        trade={trade}
        onClose={handleCloseEditExit}
        onConfirm={handleConfirmEditExit}
        loading={editExitLoading}
      />
    </PageContainer>
    </Box>
  );
}

// ----------------------------------------------------------------------

type DetailItemProps = {
  label: string;
  value: string;
  valueColor?: string;
};

function DetailItem({ label, value, valueColor }: DetailItemProps) {
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
          ...(valueColor && { color: valueColor }),
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}
