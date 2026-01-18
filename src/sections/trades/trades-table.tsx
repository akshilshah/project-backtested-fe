import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { Trade, TradeStatus, TradeFilters } from 'src/types/trade';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useTheme, type Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';
import { TableSkeleton } from 'src/components/data-table/table-skeleton';

import { TradesCard } from './trades-card';
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
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="rounded" width={40} height={40} />
          <Box>
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={80} height={16} />
          </Box>
        </Stack>
        <Skeleton variant="rounded" width={60} height={24} />
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5, mb: 1.5 }}>
        {[1, 2, 3, 4].map((i) => (
          <Box key={i}>
            <Skeleton variant="text" width={40} height={12} />
            <Skeleton variant="text" width={80} height={20} />
          </Box>
        ))}
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 1.5, borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Box>
          <Skeleton variant="text" width={30} height={12} />
          <Skeleton variant="text" width={60} height={20} />
        </Box>
        <Stack direction="row" spacing={0.5}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </Stack>
    </Box>
  );
}

// Mobile empty state
function MobileEmpty({ hasFilters }: { hasFilters: boolean }) {
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
          icon={'solar:inbox-line-bold-duotone' as any}
          width={32}
          sx={{ color: 'text.disabled' }}
        />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        No trades found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {hasFilters
          ? 'No results found. Try adjusting your search or filters.'
          : "You haven't recorded any trades yet. Start by adding your first trade."}
      </Typography>
    </Box>
  );
}

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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
  const hasActiveFilters =
    filters.coinId || filters.strategyId || filters.dateFrom || filters.dateTo;
  const hasAnyFilters = searchValue || statusFilter !== 'ALL' || hasActiveFilters;

  return (
    <Card
      sx={{
        border: (t: Theme) => `1px solid ${t.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{
          pr: 2.5,
          borderBottom: (t: Theme) => `1px solid ${t.palette.divider}`,
          bgcolor: (t: Theme) =>
            t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
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
            bgcolor:
              filtersOpen || hasActiveFilters
                ? (t: Theme) =>
                    t.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.16)'
                      : 'rgba(99, 102, 241, 0.08)'
                : 'transparent',
            '&:hover': {
              color: 'primary.main',
              bgcolor: (t: Theme) =>
                t.palette.mode === 'dark'
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

      {/* Mobile Card View */}
      {isMobile ? (
        <Box sx={{ p: 2 }}>
          {loading ? (
            <Stack spacing={2}>
              {Array.from({ length: rowsPerPage }).map((_, index) => (
                <CardSkeleton key={index} />
              ))}
            </Stack>
          ) : isEmpty ? (
            <MobileEmpty hasFilters={!!hasAnyFilters} />
          ) : (
            <Stack spacing={2}>
              {data.map((row) => (
                <TradesCard
                  key={row.id}
                  row={row}
                  onDelete={onDelete}
                  onExit={onExit}
                  deleting={deletingId === row.id}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <Scrollbar>
          <TableContainer sx={{ minWidth: 1100, position: 'relative' }}>
            <Table>
              <TableHead>
                <TableRow>
                  {TABLE_HEAD.map((cell) => (
                    <TableCell key={cell.id} align={cell.align ?? 'left'} sx={{ width: cell.width }}>
                      {cell.label}
                    </TableCell>
                  ))}
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
                {loading ? (
                  <TableSkeleton rows={rowsPerPage} columns={TABLE_HEAD.length} />
                ) : isEmpty ? (
                  <TableEmpty
                    title="No trades found"
                    description={
                      hasAnyFilters
                        ? 'No results found. Try adjusting your search or filters.'
                        : "You haven't recorded any trades yet. Start by adding your first trade."
                    }
                    colSpan={TABLE_HEAD.length}
                    action={!searchValue && statusFilter === 'ALL'}
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
      )}

      <TablePagination
        component="div"
        page={page}
        count={totalCount ?? data.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[5, 10, 25, 50]}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{
          borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
        }}
      />
    </Card>
  );
}
