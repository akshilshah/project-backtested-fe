import useSWR from 'swr';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { BacktestService } from 'src/services/backtest.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { LoadingScreen } from 'src/components/loading-screen';
import { PageContainer } from 'src/components/page/page-container';

import type { CreateBacktestTradeRequest } from 'src/types/backtest';

import { BacktestTradesTable } from '../backtest-trades-table';
import { BacktestAddTradeDialog } from '../backtest-add-trade-dialog';

// ----------------------------------------------------------------------

export function BacktestStrategyView() {
  const { id } = useParams();
  const [addTradeDialogOpen, setAddTradeDialogOpen] = useState(false);

  // Fetch strategy details
  const { data: strategy, isLoading: isLoadingStrategy } = useSWR(
    id ? ['strategy', id] : null,
    () => StrategiesService.getById(id!)
  );

  // Fetch backtest trades for this strategy
  const { data: tradesData, isLoading: isLoadingTrades, mutate: mutateTrades } = useSWR(
    id ? ['backtest-trades', id] : null,
    () => BacktestService.getAll({ strategyId: Number(id), limit: 100 })
  );

  // Fetch analytics/EV calculator for this strategy
  const { data: analytics, isLoading: isLoadingAnalytics } = useSWR(
    id ? ['backtest-analytics', id] : null,
    () => BacktestService.getStrategyAnalytics(id!)
  );

  const handleOpenAddTrade = useCallback(() => {
    if (!id) {
      toast.error('Strategy ID not found in URL.');
      return;
    }
    setAddTradeDialogOpen(true);
  }, [id]);

  const handleCloseAddTrade = useCallback(() => {
    setAddTradeDialogOpen(false);
  }, []);

  const handleAddTrade = useCallback(async (data: CreateBacktestTradeRequest) => {
    try {
      await BacktestService.create(data);
      toast.success('Backtest trade added successfully');
      setAddTradeDialogOpen(false);
      mutateTrades(); // Refresh trades list
    } catch (error) {
      console.error('Failed to add backtest trade:', error);
      toast.error('Failed to add backtest trade');
    }
  }, [mutateTrades]);

  const handleDeleteTrade = useCallback(async (tradeId: number) => {
    try {
      await BacktestService.delete(tradeId);
      toast.success('Trade deleted successfully');
      mutateTrades(); // Refresh trades list
    } catch (error) {
      console.error('Failed to delete trade:', error);
      toast.error('Failed to delete trade');
    }
  }, [mutateTrades]);

  const isLoading = isLoadingStrategy || isLoadingTrades || isLoadingAnalytics;
  const trades = tradesData?.backtestTrades || [];
  const summary = analytics || {
    avgWinningR: 0,
    avgLossR: 0,
    winPercentage: 0,
    lossPercentage: 0,
    ev: 0,
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!strategy) {
    return (
      <PageContainer maxWidth="xl">
        <Typography>Strategy not found</Typography>
      </PageContainer>
    );
  }

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title={strategy.name}
        subtitle={strategy.description || 'Backtest analysis'}
        backHref={paths.dashboard.backtest.root}
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleOpenAddTrade}
            disabled={!id}
          >
            Add Trade
          </Button>
        }
      />

      {/* Summary Cards - Expected Value Calculator */}
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          mb: 4,
          '& > *': { flex: 1 },
        }}
      >
        {/* Average Winning R */}
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                Average Winning R
              </Typography>
              <Typography variant="h3" sx={{ color: 'success.main', fontWeight: 700 }}>
                {summary.avgWinningR.toFixed(2)}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Average Loss R */}
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                Average Loss R
              </Typography>
              <Typography variant="h3" sx={{ color: 'error.main', fontWeight: 700 }}>
                {summary.avgLossR.toFixed(2)}
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Win Percentage */}
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                Win Percentage
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {(summary.winPercentage * 100).toFixed(0)}%
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Loss Percentage */}
        <Card>
          <CardContent>
            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: 'text.secondary', textTransform: 'uppercase', fontWeight: 600 }}>
                Loss Percentage
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 700 }}>
                {(summary.lossPercentage * 100).toFixed(0)}%
              </Typography>
            </Stack>
          </CardContent>
        </Card>

        {/* Expected Value */}
        <Card
          sx={{
            bgcolor: summary.ev > 0 ? 'success.lighter' : 'error.lighter',
            border: '1px solid',
            borderColor: summary.ev > 0 ? 'success.main' : 'error.main',
          }}
        >
          <CardContent>
            <Stack spacing={1}>
              <Typography
                variant="caption"
                sx={{
                  color: summary.ev > 0 ? 'success.dark' : 'error.dark',
                  textTransform: 'uppercase',
                  fontWeight: 700,
                }}
              >
                EV
              </Typography>
              <Typography
                variant="h3"
                sx={{
                  color: summary.ev > 0 ? 'success.dark' : 'error.dark',
                  fontWeight: 700,
                }}
              >
                {summary.ev > 0 ? '+' : ''}{summary.ev.toFixed(2)}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Iconify
                  icon={summary.ev > 0 ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                  width={16}
                  sx={{ color: summary.ev > 0 ? 'success.dark' : 'error.dark' }}
                />
                <Typography
                  variant="caption"
                  sx={{
                    color: summary.ev > 0 ? 'success.dark' : 'error.dark',
                    fontWeight: 600,
                  }}
                >
                  {summary.ev > 0 ? 'Positive EV!' : 'Negative EV'}
                </Typography>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Trades Table */}
      <BacktestTradesTable trades={trades} onDelete={handleDeleteTrade} />

      {/* Add Trade Dialog */}
      {id && (
        <BacktestAddTradeDialog
          open={addTradeDialogOpen}
          onClose={handleCloseAddTrade}
          onConfirm={handleAddTrade}
          strategyId={Number(id)}
        />
      )}
    </PageContainer>
  );
}
