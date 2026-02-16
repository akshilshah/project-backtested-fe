import type { BacktestAnalytics } from 'src/types/backtest';
import type { Strategy, CreateStrategyRequest } from 'src/types/strategy';

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
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import { useTheme, type Theme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { useRouter } from 'src/routes/hooks';

import { BacktestService } from 'src/services/backtest.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { LoadingScreen } from 'src/components/loading-screen';
import { PageContainer } from 'src/components/page/page-container';

import { StrategyCreateDialog } from 'src/sections/strategies/strategy-create-dialog';

import { BacktestNotesDialog } from '../backtest-notes-dialog';
import { BacktestStrategyCard } from '../backtest-strategy-card';

// ----------------------------------------------------------------------

// Mobile card skeleton for loading state
function CardSkeleton() {
  return (
    <Box
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: (theme: Theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
        border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="circular" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={100} height={24} />
            <Skeleton variant="text" width={150} height={16} />
          </Box>
        </Stack>
        <Skeleton variant="circular" width={32} height={32} />
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box
            key={i}
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
              textAlign: 'center',
            }}
          >
            <Skeleton variant="text" width={40} height={12} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={50} height={20} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// Mobile empty state
function MobileEmpty({ onCreateStrategy }: { onCreateStrategy: () => void }) {
  return (
    <Box
      sx={{
        py: 8,
        px: 2,
        textAlign: 'center',
      }}
    >
      <Box
        sx={{
          width: 64,
          height: 64,
          borderRadius: 2,
          bgcolor: (theme: Theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mx: 'auto',
          mb: 2,
        }}
      >
        <Iconify
          icon={'solar:chart-2-bold-duotone' as any}
          width={32}
          sx={{ color: 'text.disabled' }}
        />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        No Strategies Found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        Create a strategy in the Master Data section to start backtesting
      </Typography>
      <Button
        variant="contained"
        startIcon={<Iconify icon={'solar:add-circle-bold' as any} />}
        onClick={onCreateStrategy}
      >
        Create Strategy
      </Button>
    </Box>
  );
}

export function BacktestListView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const router = useRouter();

  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<Strategy | null>(null);
  const [updatingNotes, setUpdatingNotes] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

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

  const handleCreateStrategy = () => {
    setCreateOpen(true);
  };

  const handleCreateSubmit = async (formData: CreateStrategyRequest) => {
    try {
      setCreateLoading(true);
      await StrategiesService.create(formData);
      toast.success('Strategy created successfully');
      mutate();
      setCreateOpen(false);
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to create strategy';
      toast.error(message);
    } finally {
      setCreateLoading(false);
    }
  };

  if (isLoading && !isMobile) {
    return <LoadingScreen />;
  }

  return (
    <PageContainer maxWidth="xl">
      <PageHeader
        title="Backtest"
        subtitle="Analyze your trading strategies with historical data"
        action={
          <Button
            variant="contained"
            startIcon={<Iconify icon="solar:add-circle-bold" />}
            onClick={handleCreateStrategy}
          >
            New Strategy
          </Button>
        }
      />

      {/* Mobile Card View */}
      {isMobile ? (
        <Box>
          {isLoading ? (
            <Stack spacing={2}>
              {Array.from({ length: 5 }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </Stack>
          ) : strategies.length === 0 ? (
            <Card
              sx={{
                border: (t: Theme) => `1px solid ${t.palette.divider}`,
              }}
            >
              <MobileEmpty onCreateStrategy={handleCreateStrategy} />
            </Card>
          ) : (
            <Stack spacing={2}>
              {strategies.map((strategy) => (
                <BacktestStrategyCard
                  key={strategy.id}
                  strategy={strategy}
                  analytics={analyticsMap[strategy.id] ?? null}
                  onClick={handleStrategyClick}
                  onEditNotes={handleOpenNotesDialog}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <Card
          sx={{
            border: (t: Theme) => `1px solid ${t.palette.divider}`,
          }}
        >
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Strategy</TableCell>
                  <TableCell>Notes</TableCell>
                  <TableCell>Trades</TableCell>
                  <TableCell>Win Rate</TableCell>
                  <TableCell>EV</TableCell>
                  <TableCell>D_to_100T</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody
                sx={{
                  '& .MuiTableRow-root': {
                    '&:nth-of-type(even)': {
                      bgcolor: (t: Theme) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.015)',
                    },
                    '&:hover': {
                      bgcolor: (t: Theme) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(99, 102, 241, 0.08)'
                          : 'rgba(99, 102, 241, 0.04)',
                    },
                  },
                }}
              >
                {strategies.map((strategy) => {
                  const analytics = analyticsMap[strategy.id];
                  const totalTrades = analytics?.totalTrades ?? 0;
                  const winRate = analytics?.winPercentage ?? 0;
                  const ev = analytics?.ev ?? 0;

                  return (
                    <TableRow
                      key={strategy.id}
                      sx={{ cursor: 'pointer' }}
                      onClick={() => handleStrategyClick(strategy.id)}
                    >
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
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
                          {totalTrades > 0
                            ? `${totalTrades} trade${totalTrades === 1 ? '' : 's'}`
                            : '—'}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{
                            fontWeight: totalTrades > 0 ? 600 : 400,
                            color:
                              totalTrades > 0
                                ? winRate >= 0.5
                                  ? 'success.main'
                                  : 'text.primary'
                                : 'text.disabled',
                          }}
                        >
                          {totalTrades > 0 ? `${(winRate * 100).toFixed(0)}%` : '—'}
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
                            bgcolor:
                              totalTrades > 0
                                ? ev >= 0
                                  ? (t: Theme) =>
                                      t.palette.mode === 'dark'
                                        ? 'rgba(34, 197, 94, 0.12)'
                                        : 'rgba(34, 197, 94, 0.08)'
                                  : (t: Theme) =>
                                      t.palette.mode === 'dark'
                                        ? 'rgba(239, 68, 68, 0.12)'
                                        : 'rgba(239, 68, 68, 0.08)'
                                : 'transparent',
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: totalTrades > 0 ? 700 : 400,
                              color:
                                totalTrades > 0
                                  ? ev >= 0
                                    ? 'success.main'
                                    : 'error.main'
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
                            sx={{
                              color: 'text.secondary',
                              '&:hover': {
                                color: 'primary.main',
                                bgcolor: (t: Theme) =>
                                  t.palette.mode === 'dark'
                                    ? 'rgba(99, 102, 241, 0.12)'
                                    : 'rgba(99, 102, 241, 0.08)',
                              },
                            }}
                          >
                            <Iconify icon={'solar:pen-bold' as any} width={20} />
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
                startIcon={<Iconify icon={'solar:add-circle-bold' as any} />}
                onClick={handleCreateStrategy}
              >
                Create Strategy
              </Button>
            </Box>
          )}
        </Card>
      )}

      {/* Notes Dialog */}
      <BacktestNotesDialog
        open={notesDialogOpen}
        onClose={handleCloseNotesDialog}
        onConfirm={handleSaveNotes}
        currentNotes={editingStrategy?.notes || ''}
        loading={updatingNotes}
      />

      <StrategyCreateDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />
    </PageContainer>
  );
}
