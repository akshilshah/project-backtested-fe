import type { Coin } from 'src/types/coin';
import type { BacktestTrade, BacktestFilters } from 'src/types/backtest';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useTheme, type Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';
import { TableSkeleton } from 'src/components/data-table/table-skeleton';

import { BacktestTradesCard } from './backtest-trades-card';
import { BacktestTradesFilters } from './backtest-trades-filters';
import { BacktestTradesTableRow } from './backtest-trades-table-row';
import { BacktestTradesTableToolbar } from './backtest-trades-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'number', label: '#', width: 80 },
  { id: 'coin', label: 'Coin', width: 160 },
  { id: 'direction', label: 'Direction', width: 100 },
  { id: 'entry', label: 'Entry', width: 140 },
  { id: 'stopLoss', label: 'Stop Loss', width: 140 },
  { id: 'exit', label: 'Exit', width: 140 },
  { id: 'rValue', label: 'R +/-', width: 120, align: 'right' as const },
  { id: 'actions', label: '', width: 120, align: 'right' as const },
];

type Direction = 'Long' | 'Short';

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
          <Skeleton variant="rounded" width={32} height={32} />
          <Box>
            <Skeleton variant="text" width={60} height={20} />
            <Skeleton variant="text" width={100} height={16} />
          </Box>
        </Stack>
        <Skeleton variant="rounded" width={60} height={24} />
      </Stack>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1, mb: 1.5 }}>
        {[1, 2, 3].map((i) => (
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
            <Skeleton variant="text" width={30} height={12} sx={{ mx: 'auto' }} />
            <Skeleton variant="text" width={60} height={20} sx={{ mx: 'auto' }} />
          </Box>
        ))}
      </Box>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ pt: 1.5, borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}` }}
      >
        <Skeleton variant="rounded" width={70} height={28} />
        <Stack direction="row" spacing={0.5}>
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
          icon={'solar:chart-2-bold-duotone' as any}
          width={32}
          sx={{ color: 'text.disabled' }}
        />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        No Trades Yet
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
        {hasFilters
          ? 'No results found. Try adjusting your search or filters.'
          : "Click 'Add Trade' to start backtesting this strategy"}
      </Typography>
    </Box>
  );
}

type BacktestTradesTableProps = {
  data: BacktestTrade[];
  loading?: boolean;
  totalCount?: number;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  directionFilter: Direction | 'ALL';
  filters: BacktestFilters;
  onSearchChange: (value: string) => void;
  onDirectionFilterChange: (value: Direction | 'ALL') => void;
  onFiltersChange: (filters: BacktestFilters) => void;
  onClearFilters: () => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onEdit?: (trade: BacktestTrade) => void;
  onDelete?: (id: number) => void;
  deletingId?: number | null;
  coins: Coin[];
  coinsLoading?: boolean;
};

export function BacktestTradesTable({
  data,
  loading = false,
  totalCount,
  page,
  rowsPerPage,
  searchValue,
  directionFilter,
  filters,
  onSearchChange,
  onDirectionFilterChange,
  onFiltersChange,
  onClearFilters,
  onPageChange,
  onRowsPerPageChange,
  onEdit,
  onDelete,
  deletingId,
  coins,
  coinsLoading,
}: BacktestTradesTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [filtersOpen, setFiltersOpen] = useState(false);

  const handleExportToCSV = useCallback(() => {
    if (data.length === 0) return;

    // Prepare CSV headers
    const headers = ['#', 'Coin', 'Direction', 'Date', 'Time', 'Entry', 'Stop Loss', 'Exit', 'R Value'];

    // Prepare CSV rows
    const rows = data.map((trade, index) => [
      index + 1,
      trade.coin?.symbol || '',
      trade.direction,
      dayjs(trade.tradeDate).format('YYYY-MM-DD'),
      dayjs(trade.tradeTime).format('HH:mm:ss'),
      trade.entry,
      trade.stopLoss,
      trade.exit,
      trade.rValue.toFixed(2),
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    // Create blob and download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', `backtest-trades-${dayjs().format('YYYY-MM-DD-HHmmss')}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [data]);

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
  const hasActiveFilters = filters.coinId || filters.dateFrom || filters.dateTo;
  const hasAnyFilters = searchValue || directionFilter !== 'ALL' || hasActiveFilters;

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
            t.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.02)'
              : 'rgba(0, 0, 0, 0.01)',
        }}
      >
        <BacktestTradesTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          directionFilter={directionFilter}
          onDirectionFilterChange={onDirectionFilterChange}
        />

        <Stack direction="row" spacing={0.5}>
          <IconButton
            onClick={handleExportToCSV}
            disabled={data.length === 0}
            title="Export to CSV"
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
            <Iconify icon={'solar:export-bold' as any} />
          </IconButton>

          <IconButton
            onClick={toggleFilters}
            sx={{
              color: filtersOpen || hasActiveFilters ? 'primary.main' : 'text.secondary',
              bgcolor: filtersOpen || hasActiveFilters
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
      </Stack>

      <BacktestTradesFilters
        open={filtersOpen}
        filters={filters}
        onFiltersChange={onFiltersChange}
        onClearFilters={onClearFilters}
        coins={coins}
        coinsLoading={coinsLoading}
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
              {data.map((row, index) => (
                <BacktestTradesCard
                  key={row.id}
                  row={row}
                  index={(page * rowsPerPage) + index + 1}
                  onEdit={(trade) => onEdit?.(trade)}
                  onDelete={(id) => onDelete?.(id)}
                  deleting={deletingId === row.id}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <Scrollbar>
          <TableContainer sx={{ minWidth: 1000, position: 'relative' }}>
            <Table>
              <TableHead
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 10,
                  bgcolor: (t: Theme) =>
                    t.palette.mode === 'dark'
                      ? t.palette.grey[900]
                      : t.palette.grey[50],
                }}
              >
                <TableRow>
                  {TABLE_HEAD.map((cell) => (
                    <TableCell
                      key={cell.id}
                      align={cell.align ?? 'left'}
                      sx={{
                        width: cell.width,
                        bgcolor: 'inherit',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        fontSize: '0.7rem',
                        letterSpacing: '0.75px',
                        color: 'text.secondary',
                        py: 1.75,
                        borderBottom: (t: Theme) => `1px solid ${t.palette.divider}`,
                      }}
                    >
                      {cell.label}
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>

              <TableBody
                sx={{
                  '& .MuiTableRow-root': {
                    // Subtle alternating backgrounds
                    '&:nth-of-type(even)': {
                      bgcolor: (t: Theme) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.015)',
                    },
                    // Enhanced hover with subtle border highlight
                    '&:hover': {
                      bgcolor: (t: Theme) =>
                        t.palette.mode === 'dark'
                          ? 'rgba(99, 102, 241, 0.08)'
                          : 'rgba(99, 102, 241, 0.04)',
                    },
                    // Smooth transitions
                    transition: 'background-color 0.15s ease-in-out',
                  },
                  // Subtle cell borders
                  '& .MuiTableCell-root': {
                    borderBottom: (t: Theme) =>
                      `1px solid ${t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.06)'}`,
                    py: 1.5,
                  },
                }}
              >
                {loading ? (
                  <TableSkeleton rows={rowsPerPage} columns={TABLE_HEAD.length} />
                ) : isEmpty ? (
                  <TableEmpty
                    title="No Trades Yet"
                    description={
                      searchValue || directionFilter !== 'ALL' || hasActiveFilters
                        ? 'No results found. Try adjusting your search or filters.'
                        : "Click 'Add Trade' to start backtesting this strategy"
                    }
                    colSpan={TABLE_HEAD.length}
                  />
                ) : (
                  data.map((row, index) => (
                    <BacktestTradesTableRow
                      key={row.id}
                      row={row}
                      index={(page * rowsPerPage) + index + 1}
                      onEdit={(trade) => onEdit?.(trade)}
                      onDelete={(id) => onDelete?.(id)}
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
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        onRowsPerPageChange={handleRowsPerPageChange}
        sx={{
          borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
        }}
      />
    </Card>
  );
}
