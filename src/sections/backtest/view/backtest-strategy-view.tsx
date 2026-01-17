import useSWR from 'swr';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { LoadingScreen } from 'src/components/loading-screen';
import { PageContainer } from 'src/components/page/page-container';

import { BacktestTradesTable } from '../backtest-trades-table';
import { BacktestAddTradeDialog } from '../backtest-add-trade-dialog';

// ----------------------------------------------------------------------

export function BacktestStrategyView() {
  const { id } = useParams();
  const [addTradeDialogOpen, setAddTradeDialogOpen] = useState(false);

  // Fetch strategy details
  const { data: strategy, isLoading } = useSWR(
    id ? ['strategy', id] : null,
    () => StrategiesService.getById(id!)
  );

  // Mock data for summary cards - will come from API later
  const summary = {
    avgWinningR: 3.94,
    avgLossR: 1.0,
    winPercentage: 0.28,
    lossPercentage: 0.72,
    ev: 0.38,
  };

  // Mock trades data - will come from API later
  const trades = [
    {
      id: 1,
      date: '01/02/2025',
      time: '21:00',
      coin: 'BCH',
      direction: 'Long',
      entry: 410.5,
      sl50: null,
      sl70: 401.5,
      exit: 401.5,
      r: -1.0,
    },
    {
      id: 2,
      date: '02/02/2025',
      time: '04:00',
      coin: 'BCH',
      direction: 'Long',
      entry: 395.5,
      sl50: null,
      sl70: 387.4,
      exit: 387.4,
      r: -1.0,
    },
    {
      id: 5,
      date: '03/02/2025',
      time: '05:15',
      coin: 'BCH',
      direction: 'Long',
      entry: 300.6,
      sl50: null,
      sl70: 287.4,
      exit: 344.2,
      r: 3.30303,
    },
  ];

  const handleOpenAddTrade = useCallback(() => {
    setAddTradeDialogOpen(true);
  }, []);

  const handleCloseAddTrade = useCallback(() => {
    setAddTradeDialogOpen(false);
  }, []);

  const handleAddTrade = useCallback(async (data: any) => {
    // Will implement API call later
    console.log('Add trade:', data);
    setAddTradeDialogOpen(false);
  }, []);

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
      <BacktestTradesTable trades={trades} />

      {/* Add Trade Dialog */}
      <BacktestAddTradeDialog
        open={addTradeDialogOpen}
        onClose={handleCloseAddTrade}
        onConfirm={handleAddTrade}
        strategyId={strategy.id}
      />
    </PageContainer>
  );
}
