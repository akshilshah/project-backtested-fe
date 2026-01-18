import type { BacktestTrade, BacktestFilters, CreateBacktestTradeRequest } from 'src/types/backtest';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { useParams } from 'src/routes/hooks';

import { CoinsService } from 'src/services/coins.service';
import { BacktestService } from 'src/services/backtest.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { LoadingScreen } from 'src/components/loading-screen';
import { PageContainer } from 'src/components/page/page-container';

import { BacktestNotesDialog } from '../backtest-notes-dialog';
import { BacktestTradesTable } from '../backtest-trades-table';
import { BacktestAddTradeDialog } from '../backtest-add-trade-dialog';

// ----------------------------------------------------------------------

type Direction = 'Long' | 'Short';

export function BacktestStrategyView() {
  const { id } = useParams();
  const [addTradeDialogOpen, setAddTradeDialogOpen] = useState(false);
  const [editingTrade, setEditingTrade] = useState<BacktestTrade | null>(null);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [notesDialogOpen, setNotesDialogOpen] = useState(false);
  const [updatingNotes, setUpdatingNotes] = useState(false);

  // Table state
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [directionFilter, setDirectionFilter] = useState<Direction | 'ALL'>('ALL');
  const [filters, setFilters] = useState<BacktestFilters>({});

  // Fetch strategy details
  const {
    data: strategy,
    isLoading: isLoadingStrategy,
    mutate: mutateStrategy,
  } = useSWR(id ? ['strategy', id] : null, () => StrategiesService.getById(id!));

  // Fetch backtest trades for this strategy
  const {
    data: tradesData,
    isLoading: isLoadingTrades,
    mutate: mutateTrades,
  } = useSWR(
    id ? ['backtest-trades', id, page, rowsPerPage, searchValue, directionFilter, filters] : null,
    () =>
      BacktestService.getAll({
        strategyId: Number(id),
        page: page + 1,
        limit: rowsPerPage,
        search: searchValue || undefined,
        direction: directionFilter !== 'ALL' ? directionFilter : undefined,
        ...filters,
      }),
    {
      keepPreviousData: true,
    }
  );

  // Fetch coins for filter dropdown
  const { data: coinsData, isLoading: coinsLoading } = useSWR('coins-all', () =>
    CoinsService.getAll({ limit: 100 })
  );

  // Fetch the most recent trade for prefilling (limit 1, sorted by createdAt descending to get last created)
  const { data: lastTradeData, mutate: mutateLastTrade } = useSWR(
    id ? ['backtest-last-trade', id] : null,
    () =>
      BacktestService.getAll({
        strategyId: Number(id),
        limit: 1,
        page: 1,
        sortBy: 'createdAt',
        sortOrder: 'desc',
      })
  );

  // Fetch analytics/EV calculator for this strategy
  const {
    data: analytics,
    isLoading: isLoadingAnalytics,
    mutate: mutateAnalytics,
  } = useSWR(id ? ['backtest-analytics', id] : null, () =>
    BacktestService.getStrategyAnalytics(id!)
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
    setEditingTrade(null);
  }, []);

  const handleAddTrade = useCallback(
    async (data: CreateBacktestTradeRequest) => {
      try {
        if (editingTrade) {
          // Update existing trade
          await BacktestService.update(editingTrade.id, data);
          toast.success('Backtest trade updated successfully');
          setAddTradeDialogOpen(false);
          setEditingTrade(null);
        } else {
          // Create new trade
          await BacktestService.create(data);
          toast.success('Backtest trade added successfully');
          // Keep modal open for adding more trades
          setEditingTrade(null);
        }
        mutateTrades(); // Refresh trades list
        mutateAnalytics(); // Refresh analytics/summary cards
        mutateLastTrade(); // Refresh last trade for prefilling
      } catch (error) {
        console.error('Failed to save backtest trade:', error);
        toast.error(
          editingTrade ? 'Failed to update backtest trade' : 'Failed to add backtest trade'
        );
      }
    },
    [editingTrade, mutateTrades, mutateAnalytics, mutateLastTrade]
  );

  const handleEditTrade = useCallback((trade: BacktestTrade) => {
    setEditingTrade(trade);
    setAddTradeDialogOpen(true);
  }, []);

  const handleDeleteTrade = useCallback(
    async (tradeId: number) => {
      setDeletingId(tradeId);
      try {
        await BacktestService.delete(tradeId);
        toast.success('Trade deleted successfully');
        mutateTrades(); // Refresh trades list
        mutateAnalytics(); // Refresh analytics/summary cards
      } catch (error) {
        console.error('Failed to delete trade:', error);
        toast.error('Failed to delete trade');
      } finally {
        setDeletingId(null);
      }
    },
    [mutateTrades, mutateAnalytics]
  );

  // const handleOpenNotesDialog = useCallback(() => {
  //   setNotesDialogOpen(true);
  // }, []);

  const handleCloseNotesDialog = useCallback(() => {
    setNotesDialogOpen(false);
  }, []);

  const handleSaveNotes = useCallback(
    async (notes: string) => {
      if (!id) {
        toast.error('Strategy ID not found in URL.');
        return;
      }

      setUpdatingNotes(true);
      try {
        await StrategiesService.update(id, {
          notes,
        });
        toast.success('Notes updated successfully');

        // Revalidate to fetch fresh data from server
        await mutateStrategy();
        setNotesDialogOpen(false);
      } catch (error) {
        console.error('Failed to update notes:', error);
        toast.error('Failed to update notes');
      } finally {
        setUpdatingNotes(false);
      }
    },
    [id, mutateStrategy]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPage(0);
  }, []);

  const handleDirectionFilterChange = useCallback((value: Direction | 'ALL') => {
    setDirectionFilter(value);
    setPage(0);
  }, []);

  const handleFiltersChange = useCallback((newFilters: BacktestFilters) => {
    setFilters(newFilters);
    setPage(0);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({});
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const isLoading = isLoadingStrategy || isLoadingTrades || isLoadingAnalytics;
  const trades = tradesData?.backtestTrades || [];
  const totalCount = tradesData?.pagination?.total ?? 0;
  const coins = coinsData?.coins ?? [];
  const summary = analytics || {
    totalTrades: 0,
    avgWinningR: 0,
    avgLossR: 0,
    winPercentage: 0,
    lossPercentage: 0,
    ev: 0,
  };

  // Get the most recently created trade for prefilling (from separate API call)
  const lastTrade = lastTradeData?.backtestTrades?.[0] || null;

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
        subtitle="Backtest analysis"
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

      {/* Notes Section */}
      {/* <Card sx={{ mb: 4 }}>
        <CardContent>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between" spacing={2}>
            <Box sx={{ flex: 1 }}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1 }}>
                <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                  Notes
                </Typography>
                <Tooltip title="Edit Notes">
                  <IconButton size="small" onClick={handleOpenNotesDialog}>
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>
                </Tooltip>
              </Stack>
              <Typography
                variant="body2"
                sx={{
                  color: strategy.notes ? 'text.primary' : 'text.disabled',
                  whiteSpace: 'pre-wrap',
                }}
              >
                {strategy.notes || 'No notes added yet. Click the edit icon to add notes.'}
              </Typography>
            </Box>
          </Stack>
        </CardContent>
      </Card> */}

      {/* Summary Cards - Expected Value Calculator */}
      <Stack
        spacing={3}
        direction={{ xs: 'column', sm: 'row' }}
        sx={{
          mb: 4,
          '& > *': { flex: 1 },
        }}
      >
        {/* Total Trades */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'primary.lighter',
                }}
              >
                <Iconify icon={'solar:chart-bold' as any} width={28} sx={{ color: 'primary.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Total Trades
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {summary.totalTrades}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Average Winning R */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'success.lighter',
                }}
              >
                <Iconify icon={'solar:graph-up-bold' as any} width={28} sx={{ color: 'success.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Average Winning R
                </Typography>
                <Typography variant="h4" sx={{ color: 'success.main', fontWeight: 700 }}>
                  {summary.avgWinningR.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Average Loss R */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'error.lighter',
                }}
              >
                <Iconify icon={'solar:graph-down-bold' as any} width={28} sx={{ color: 'error.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Average Loss R
                </Typography>
                <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 700 }}>
                  {summary.avgLossR.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Win Percentage */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'success.lighter',
                }}
              >
                <Iconify icon={'solar:shield-check-bold' as any} width={28} sx={{ color: 'success.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Win Percentage
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {(summary.winPercentage * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Loss Percentage */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: 'error.lighter',
                }}
              >
                <Iconify icon={'solar:shield-minus-bold' as any} width={28} sx={{ color: 'error.main' }} />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                  Loss Percentage
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 700 }}>
                  {(summary.lossPercentage * 100).toFixed(0)}%
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>

        {/* Expected Value */}
        <Card>
          <CardContent>
            <Stack direction="row" alignItems="center" spacing={2}>
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: summary.ev > 0 ? 'success.lighter' : 'error.lighter',
                }}
              >
                <Iconify
                  icon={'solar:dollar-minimalistic-bold' as any}
                  width={28}
                  sx={{ color: summary.ev > 0 ? 'success.main' : 'error.main' }}
                />
              </Box>
              <Box sx={{ flex: 1 }}>
                <Stack direction="row" alignItems="center" spacing={0.5} sx={{ mb: 0.5 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block' }}>
                    Expected Value
                  </Typography>
                  <Iconify
                    icon={summary.ev > 0 ? 'solar:check-circle-bold' : 'solar:close-circle-bold'}
                    width={14}
                    sx={{ color: summary.ev > 0 ? 'success.main' : 'error.main' }}
                  />
                </Stack>
                <Typography
                  variant="h4"
                  sx={{
                    color: summary.ev > 0 ? 'success.main' : 'error.main',
                    fontWeight: 700,
                  }}
                >
                  {summary.ev > 0 ? '+' : ''}
                  {summary.ev.toFixed(2)}
                </Typography>
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Trades Table */}
      <BacktestTradesTable
        data={trades}
        loading={isLoadingTrades}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={searchValue}
        directionFilter={directionFilter}
        filters={filters}
        onSearchChange={handleSearchChange}
        onDirectionFilterChange={handleDirectionFilterChange}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onEdit={handleEditTrade}
        onDelete={handleDeleteTrade}
        deletingId={deletingId}
        coins={coins}
        coinsLoading={coinsLoading}
      />

      {/* Add/Edit Trade Dialog */}
      {id && (
        <BacktestAddTradeDialog
          open={addTradeDialogOpen}
          onClose={handleCloseAddTrade}
          onConfirm={handleAddTrade}
          strategyId={Number(id)}
          editingTrade={editingTrade}
          lastTrade={lastTrade}
        />
      )}

      {/* Notes Dialog */}
      <BacktestNotesDialog
        open={notesDialogOpen}
        onClose={handleCloseNotesDialog}
        onConfirm={handleSaveNotes}
        currentNotes={strategy?.notes || ''}
        loading={updatingNotes}
      />
    </PageContainer>
  );
}
