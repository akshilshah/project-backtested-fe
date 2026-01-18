import type { Strategy } from 'src/types/strategy';
import type { BacktestAnalytics } from 'src/types/backtest';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
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

import { BacktestNotesDialog } from '../backtest-notes-dialog';

// ----------------------------------------------------------------------

export function BacktestListView() {
  const router = useRouter();
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [updatingNotes, setUpdatingNotes] = useState(false);

  // Fetch all strategies
  const { data, isLoading, mutate } = useSWR('strategies-all', () =>
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

  const handleOpenNotesDialog = useCallback((strategy: Strategy, event: React.MouseEvent) => {
    event.stopPropagation();
    setEditingStrategy(strategy);
    setNotesDialogOpen(true);
  }, []);

  const handleCloseNotesDialog = useCallback(() => {
    setNotesDialogOpen(false);
    setEditingStrategy(null);
  }, []);

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      if (!editingStrategy || !editingStrategy.id) {
        toast.error('Strategy ID is missing');
        return;
      }

      setUpdatingNotes(true);
      try {
        await StrategiesService.update(editingStrategy.id, {
          notes,
        });
        toast.success('Notes updated successfully');

        // Force revalidation of strategies list
        await mutate();
        setNotesDialogOpen(false);
        setEditingStrategy(null);
      } catch (error) {
        console.error('Failed to update notes:', error);
        toast.error('Failed to update notes');
      } finally {
        setUpdatingNotes(false);
      }
    },
    [editingStrategy, mutate]
  );

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
                <TableCell>Notes</TableCell>
                <TableCell>Trades</TableCell>
                <TableCell>Win Rate</TableCell>
                {/* <TableCell>Avg R</TableCell> */}
                <TableCell>EV</TableCell>
                <TableCell>D_to_100T</TableCell>
                <TableCell align="right">Actions</TableCell>
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
                        </Box>
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ maxWidth: 300 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          color: strategy.notes ? 'text.primary' : 'text.disabled',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}
                      >
                        {strategy.notes || 'No notes'}
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
                    {/* <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: totalTrades > 0 ? 600 : 400,
                          color: totalTrades > 0 ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {totalTrades > 0 ? avgR.toFixed(2) : '—'}
                      </Typography>
                    </TableCell> */}
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
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: analytics?.daysTo100Trades ? 600 : 400,
                          color: analytics?.daysTo100Trades ? 'text.primary' : 'text.disabled',
                        }}
                      >
                        {analytics?.daysTo100Trades ? `${analytics.daysTo100Trades} days` : '—'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right" onClick={(e) => e.stopPropagation()}>
                      <Tooltip title="Edit Notes">
                        <IconButton
                          size="small"
                          onClick={(e) => handleOpenNotesDialog(strategy, e)}
                        >
                          <Iconify icon="solar:pen-bold" width={20} />
                        </IconButton>
                      </Tooltip>
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

      {/* Notes Dialog */}
      <BacktestNotesDialog
        open={notesDialogOpen}
        onClose={handleCloseNotesDialog}
        onConfirm={handleSaveNotes}
        currentNotes={editingStrategy?.notes || ''}
        loading={updatingNotes}
      />
    </PageContainer>
  );
}
