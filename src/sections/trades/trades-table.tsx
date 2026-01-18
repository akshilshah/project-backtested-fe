import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { Trade, TradeStatus, TradeFilters } from 'src/types/trade';

import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';
import { TableSkeleton } from 'src/components/data-table/table-skeleton';

import { TradesFilters } from './trades-filters';
import { TradesTableRow } from './trades-table-row';
import { TradesTableToolbar } from './trades-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'coin', label: 'Coin', width: 160 },
  { id: 'strategy', label: 'Strategy', width: 140 },
  { id: 'status', label: 'Status', width: 100 },
  { id: 'avgEntry', label: 'Avg Entry', width: 140 },
  { id: 'avgExit', label: 'Avg Exit', width: 140 },
  { id: 'quantity', label: 'Qty', width: 80 },
  { id: 'duration', label: 'Duration', width: 100 },
  { id: 'profitLoss', label: 'P&L', width: 140 },
  { id: 'actions', label: '', width: 140, align: 'right' as const },
];

type TradesTableProps = {
  data: Trade[];
  loading?: boolean;
  totalCount?: number;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  statusFilter: TradeStatus | 'ALL';
  filters: TradeFilters;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TradeStatus | 'ALL') => void;
  onFiltersChange: (filters: TradeFilters) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (id: number) => void;
  onExit: (trade: Trade) => void;
  deletingId?: number | null;
  coins: Coin[];
  strategies: Strategy[];
  coinsLoading?: boolean;
  strategiesLoading?: boolean;
};

export function TradesTable({
  data,
  loading = false,
  totalCount,
  page,
  rowsPerPage,
  searchValue,
  statusFilter,
  filters,
  onSearchChange,
  onStatusFilterChange,
  onFiltersChange,
  onClearFilters,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onExit,
  deletingId,
  coins,
  strategies,
  coinsLoading,
  strategiesLoading,
}: TradesTableProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      onPageChange(newPage);
    },
    [onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onRowsPerPageChange(parseInt(event.target.value, 10));
    },
    [onRowsPerPageChange]
  );

  const toggleFilters = useCallback(() => {
    setFiltersOpen((prev) => !prev);
  }, []);

  const isEmpty = !loading && data.length === 0;
  const hasActiveFilters = filters.coinId || filters.strategyId || filters.dateFrom || filters.dateTo;

  return (
    <Card
      sx={{
        border: (theme) => `1px solid ${theme.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          pr: 2.5,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.02)'
              : 'rgba(0, 0, 0, 0.01)',
        }}
      >
        <TradesTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          statusFilter={statusFilter}
          onStatusFilterChange={onStatusFilterChange}
        />

        <IconButton
          onClick={toggleFilters}
          sx={{
            color: filtersOpen || hasActiveFilters ? 'primary.main' : 'text.secondary',
            bgcolor: filtersOpen || hasActiveFilters
              ? (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.16)'
                    : 'rgba(99, 102, 241, 0.08)'
              : 'transparent',
            '&:hover': {
              color: 'primary.main',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.16)'
                  : 'rgba(99, 102, 241, 0.12)',
            },
          }}
        >
          <Iconify icon={'ic:round-filter-list' as any} />
        </IconButton>
      </Stack>

      <TradesFilters
        open={filtersOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        coins={coins}
        strategies={strategies}
        coinsLoading={coinsLoading}
        strategiesLoading={strategiesLoading}
      />

      {(filtersOpen || hasActiveFilters) && <Divider />}

      <Scrollbar>
        <TableContainer sx={{ minWidth: 1100, position: 'relative' }}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.align ?? 'left'}
                    sx={{ width: cell.width }}
                  >
                    {cell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                '& .MuiTableRow-root': {
                  '&:nth-of-type(even)': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.015)',
                  },
                  '&:hover': {
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(99, 102, 241, 0.08)'
                        : 'rgba(99, 102, 241, 0.04)',
                  },
                },
              }}
            >
              {loading ? (
                <TableSkeleton rows={rowsPerPage} columns={TABLE_HEAD.length} />
              ) : isEmpty ? (
                <TableEmpty
                  title="No trades found"
                  description={
                    searchValue || statusFilter !== 'ALL' || hasActiveFilters
                      ? 'No results found. Try adjusting your search or filters.'
                      : "You haven't recorded any trades yet. Start by adding your first trade."
                  }
                  colSpan={TABLE_HEAD.length}
                  action={
                    !searchValue &&
                    statusFilter === 'ALL'
                    // !hasActiveFilters && (
                    //   <Button
                    //     component={RouterLink}
                    //     href={paths.dashboard.trades.new}
                    //     variant="contained"
                    //     startIcon={<Iconify icon="mingcute:add-line" />}
                    //   >
                    //     New Trade
                    //   </Button>
                    // )
                  }
                />
              ) : (
                data.map((row) => (
                  <TradesTableRow
                    key={row.id}
                    row={row}
                    onDelete={onDelete}
                    onExit={onExit}
                    deleting={deletingId === row.id}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>

      <TablePagination
        component="div"
        page={page}
        count={totalCount ?? data.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}
