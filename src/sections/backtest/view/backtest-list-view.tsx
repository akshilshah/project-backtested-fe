import useSWR from 'swr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { BacktestService } from 'src/services/backtest.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { LoadingScreen } from 'src/components/loading-screen';
import { PageContainer } from 'src/components/page/page-container';

import type { BacktestAnalytics } from 'src/types/backtest';

// ----------------------------------------------------------------------

export function BacktestListView() {
  const router = useRouter();

  // Fetch all strategies
  const { data, isLoading } = useSWR('strategies-all', () =>
    StrategiesService.getAll({ limit: 100 })
  );

  const strategies = data?.strategies ?? [];

  // Fetch analytics for all strategies
  const strategyIds = strategies.map((s) => s.id);
  const { data: analyticsData } = useSWR(
    strategyIds.length > 0 ? ['backtest-analytics-all', ...strategyIds] : null,
    async () => {
      const analyticsPromises = strategyIds.map((id) =>
        BacktestService.getStrategyAnalytics(id).catch(() => null)
      );
      const results = await Promise.all(analyticsPromises);

      // Create a map of strategyId -> analytics
      const analyticsMap: Record<number, BacktestAnalytics | null> = {};
      strategyIds.forEach((id, index) => {
        analyticsMap[id] = results[index];
      });
      return analyticsMap;
    }
  );

  const analyticsMap = analyticsData ?? {};

  const handleStrategyClick = (strategyId: number) => {
    router.push(paths.dashboard.backtest.strategy(String(strategyId)));
  };

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Backtest"
        subtitle="Analyze your trading strategies with historical data"
      />

      {/* Strategies Table */}
      <Card>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Strategy</TableCell>
                <TableCell>Created</TableCell>
                <TableCell>Trades</TableCell>
                <TableCell>Win Rate</TableCell>
                <TableCell>Avg R</TableCell>
                <TableCell>EV</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {strategies.map((strategy) => {
                const analytics = analyticsMap[strategy.id];
                const totalTrades = analytics?.totalTrades ?? 0;
                const winRate = analytics?.winPercentage ?? 0;
                const avgR = analytics
                  ? (analytics.avgWinningR * analytics.winPercentage -
                     analytics.avgLossR * analytics.lossPercentage)
                  : 0;
                const ev = analytics?.ev ?? 0;

                return (
                  <TableRow
                    key={strategy.id}
                    hover
                    sx={{
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                    onClick={() => handleStrategyClick(strategy.id)}
                  >
                    <TableCell>
                      <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar sx={{ bgcolor: 'primary.lighter' }}>
                          {strategy.name.charAt(0).toUpperCase()}
                        </Avatar>
                        <Box>
                          <Typography variant="subtitle2">{strategy.name}</Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                            {strategy.description || 'No description'}
                          </Typography>
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {new Date(strategy.createdAt).toLocaleDateString()}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {new Date(strategy.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {totalTrades > 0 ? `${totalTrades} trade${totalTrades === 1 ? '' : 's'}` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: totalTrades > 0 ? 600 : 400,
                          color: totalTrades > 0 ? (winRate >= 0.5 ? 'success.main' : 'text.primary') : 'text.disabled',
                        }}
                      >
                        {totalTrades > 0 ? `${(winRate * 100).toFixed(0)}%` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: totalTrades > 0 ? 600 : 400,
                          color: totalTrades > 0 ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {totalTrades > 0 ? avgR.toFixed(2) : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          px: 1.5,
                          py: 0.5,
                          borderRadius: 1,
                          bgcolor: totalTrades > 0
                            ? ev >= 0
                              ? 'success.lighter'
                              : 'error.lighter'
                            : 'transparent',
                        }}
                      >
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: totalTrades > 0 ? 700 : 400,
                            color: totalTrades > 0
                              ? ev >= 0
                                ? 'success.dark'
                                : 'error.dark'
                              : 'text.disabled',
                          }}
                        >
                          {totalTrades > 0 ? `${ev >= 0 ? '+' : ''}${ev.toFixed(2)}` : '—'}
                        </Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>

        {strategies.length === 0 && (
          <Box sx={{ p: 6, textAlign: 'center' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>
              No Strategies Found
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
              Create a strategy in the Master Data section to start backtesting
            </Typography>
            <Button
              variant="contained"
              startIcon={<Iconify icon="solar:add-circle-bold" />}
              onClick={() => router.push(paths.dashboard.strategies.new)}
            >
              Create Strategy
            </Button>
          </Box>
        )}
      </Card>
    </PageContainer>
  );
}
