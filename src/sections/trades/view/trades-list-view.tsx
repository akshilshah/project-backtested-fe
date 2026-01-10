import type { Trade, TradeStatus, TradeFilters, CreateTradeRequest } from 'src/types/trade';

import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page/page-container';

import { TradesTable } from '../trades-table';
import { TradeExitDialog } from '../trade-exit-dialog';
import { TradeCreateDialog } from '../trade-create-dialog';

// ----------------------------------------------------------------------

export function TradesListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [statusFilter, setStatusFilter] = useState<TradeStatus | 'ALL'>('ALL');
  const [filters, setFilters] = useState<TradeFilters>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [exitTrade, setExitTrade] = useState<Trade | null>(null);
  const [exitLoading, setExitLoading] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch trades data
  const { data: tradesData, isLoading: tradesLoading, mutate: mutateTrades } = useSWR(
    ['trades', page, rowsPerPage, searchValue, statusFilter, filters],
    () =>
      TradesService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchValue || undefined,
        status: statusFilter !== 'ALL' ? statusFilter : undefined,
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

  // Fetch strategies for filter dropdown
  const { data: strategiesData, isLoading: strategiesLoading } = useSWR('strategies-all', () =>
    StrategiesService.getAll({ limit: 100 })
  );

  const trades = tradesData?.trades ?? [];
  const totalCount = tradesData?.pagination?.total ?? 0;
  const coins = coinsData?.coins ?? [];
  const strategies = strategiesData?.strategies ?? [];

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPage(0);
  }, []);

  const handleStatusFilterChange = useCallback((value: TradeStatus | 'ALL') => {
    setStatusFilter(value);
    setPage(0);
  }, []);

  const handleFiltersChange = useCallback((newFilters: TradeFilters) => {
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

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        setDeletingId(id);
        await TradesService.delete(id);
        toast.success('Trade deleted successfully');
        mutateTrades();
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete trade';
        toast.error(message);
      } finally {
        setDeletingId(null);
      }
    },
    [mutateTrades]
  );

  const handleOpenExit = useCallback((trade: Trade) => {
    setExitTrade(trade);
  }, []);

  const handleCloseExit = useCallback(() => {
    setExitTrade(null);
  }, []);

  const handleConfirmExit = useCallback(
    async (data: { exitPrice: number; exitDate: string; exitTime: string; notes?: string }) => {
      if (!exitTrade) return;

      try {
        setExitLoading(true);
        await TradesService.exit(exitTrade.id, data);
        toast.success('Trade closed successfully');
        mutateTrades();
        setExitTrade(null);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to close trade';
        toast.error(message);
      } finally {
        setExitLoading(false);
      }
    },
    [exitTrade, mutateTrades]
  );

  // Create trade handlers
  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: CreateTradeRequest) => {
      try {
        setCreateLoading(true);
        await TradesService.create(data);
        toast.success('Trade created successfully');
        mutateTrades();
        setCreateOpen(false);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create trade';
        toast.error(message);
      } finally {
        setCreateLoading(false);
      }
    },
    [mutateTrades]
  );

  return (
    <PageContainer>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Trades</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Add
        </Button>
      </Box>

      <TradesTable
        data={trades}
        loading={tradesLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={searchValue}
        statusFilter={statusFilter}
        filters={filters}
        onSearchChange={handleSearchChange}
        onStatusFilterChange={handleStatusFilterChange}
        onFiltersChange={handleFiltersChange}
        onClearFilters={handleClearFilters}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDelete}
        onExit={handleOpenExit}
        deletingId={deletingId}
        coins={coins}
        strategies={strategies}
        coinsLoading={coinsLoading}
        strategiesLoading={strategiesLoading}
      />

      <TradeExitDialog
        open={!!exitTrade}
        trade={exitTrade}
        onClose={handleCloseExit}
        onConfirm={handleConfirmExit}
        loading={exitLoading}
      />

      <TradeCreateDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
        coins={coins}
        strategies={strategies}
        coinsLoading={coinsLoading}
        strategiesLoading={strategiesLoading}
        loading={createLoading}
      />
    </PageContainer>
  );
}
