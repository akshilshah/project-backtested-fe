import type { Trade, TradeStatus, TradeFilters } from 'src/types/trade';

import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CoinsService } from 'src/services/coins.service';
import { TradesService } from 'src/services/trades.service';
import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';

import { TradesTable } from '../trades-table';
import { TradeExitDialog } from '../trade-exit-dialog';

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

  const trades = tradesData?.data ?? [];
  const totalCount = tradesData?.pagination?.total ?? 0;
  const coins = coinsData?.data ?? [];
  const strategies = strategiesData?.data ?? [];

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

  return (
    <PageContainer>
      <PageHeader
        title="Trades"
        subtitle="Manage your trading journal"
        breadcrumbs={[{ label: 'Dashboard', href: paths.dashboard.root }, { label: 'Trades' }]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.trades.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Trade
          </Button>
        }
      />

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
    </PageContainer>
  );
}
