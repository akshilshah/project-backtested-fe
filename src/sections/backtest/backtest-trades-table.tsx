import type { Coin } from 'src/types/coin';
import type { BacktestTrade, BacktestFilters } from 'src/types/backtest';

import dayjs from 'dayjs';
import { useState, useCallback } from 'react';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
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

  return (
    <Card>
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ pr: 2.5 }}>
        <BacktestTradesTableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          directionFilter={directionFilter}
          onDirectionFilterChange={onDirectionFilterChange}
        />

        <Stack direction="row" spacing={1}>
          <IconButton
            onClick={handleExportToCSV}
            disabled={data.length === 0}
            title="Export to CSV"
          >
            <Iconify icon={'solar:export-bold' as any} />
          </IconButton>

          <IconButton onClick={toggleFilters} color={filtersOpen || hasActiveFilters ? 'primary' : 'default'}>
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

      <Scrollbar>
        <TableContainer sx={{ minWidth: 1000, position: 'relative' }}>
          <Table>
            <TableHead
              sx={{
                position: 'sticky',
                top: 0,
                zIndex: 10,
                bgcolor: 'background.paper',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: '1px',
                  bgcolor: 'divider',
                  boxShadow: (theme) => `0 2px 4px ${theme.palette.action.hover}`,
                },
              }}
            >
              <TableRow>
                {TABLE_HEAD.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.align ?? 'left'}
                    sx={{
                      width: cell.width,
                      bgcolor: 'background.paper',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      color: 'text.secondary',
                      py: 2,
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
                  // Zebra striping
                  '&:nth-of-type(even)': {
                    bgcolor: (theme) => theme.palette.action.hover,
                  },
                  // Enhanced hover
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.action.selected,
                  },
                  // Smooth transitions
                  transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                // Better cell borders
                '& .MuiTableCell-root': {
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
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
                    index={index + 1}
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

      <TablePagination
        component="div"
        page={page}
        count={totalCount ?? data.length}
        rowsPerPage={rowsPerPage}
        onPageChange={handlePageChange}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        onRowsPerPageChange={handleRowsPerPageChange}
      />
    </Card>
  );
}
