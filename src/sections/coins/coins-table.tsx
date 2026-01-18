import type { Coin } from 'src/types/coin';

import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import useMediaQuery from '@mui/material/useMediaQuery';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import { useTheme, type Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';
import { TableSkeleton } from 'src/components/data-table/table-skeleton';

import { CoinsCard } from './coins-card';
import { CoinsTableRow } from './coins-table-row';
import { CoinsTableToolbar } from './coins-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Coin', width: 280 },
  { id: 'symbol', label: 'Symbol', width: 120 },
  { id: 'createdAt', label: 'Created', width: 180 },
  { id: 'actions', label: '', width: 120, align: 'right' as const },
];

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
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Skeleton variant="rounded" width={44} height={44} />
          <Box>
            <Skeleton variant="text" width={100} height={24} />
            <Stack direction="row" alignItems="center" spacing={1}>
              <Skeleton variant="rounded" width={50} height={20} />
              <Skeleton variant="text" width={80} height={16} />
            </Stack>
          </Box>
        </Stack>
        <Stack direction="row" spacing={0.5}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
      </Stack>
    </Box>
  );
}

// Mobile empty state
function MobileEmpty({ hasSearch, onAddClick }: { hasSearch: boolean; onAddClick?: () => void }) {
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
          icon={'solar:coin-bold-duotone' as any}
          width={32}
          sx={{ color: 'text.disabled' }}
        />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        No coins found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {hasSearch
          ? 'No results found. Try adjusting your search.'
          : "You haven't added any coins yet. Add your first coin to get started."}
      </Typography>
      {!hasSearch && onAddClick && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onAddClick}
        >
          New Coin
        </Button>
      )}
    </Box>
  );
}

type CoinsTableProps = {
  data: Coin[];
  loading?: boolean;
  totalCount?: number;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (id: number) => void;
  onEdit: (coin: Coin) => void;
  onAddClick?: () => void;
  deletingId?: number | null;
};

export function CoinsTable({
  data,
  loading = false,
  totalCount,
  page,
  rowsPerPage,
  searchValue,
  onSearchChange,
  onPageChange,
  onRowsPerPageChange,
  onDelete,
  onEdit,
  onAddClick,
  deletingId,
}: CoinsTableProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

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

  const isEmpty = !loading && data.length === 0;

  return (
    <Card
      sx={{
        border: (t: Theme) => `1px solid ${t.palette.divider}`,
        overflow: 'hidden',
      }}
    >
      <CoinsTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

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
            <MobileEmpty hasSearch={!!searchValue} onAddClick={onAddClick} />
          ) : (
            <Stack spacing={2}>
              {data.map((row) => (
                <CoinsCard
                  key={row.id}
                  row={row}
                  onDelete={onDelete}
                  onEdit={onEdit}
                  deleting={deletingId === row.id}
                />
              ))}
            </Stack>
          )}
        </Box>
      ) : (
        /* Desktop Table View */
        <Scrollbar>
          <TableContainer sx={{ minWidth: 800, position: 'relative' }}>
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
                    title="No coins found"
                    description={
                      searchValue
                        ? `No results found for "${searchValue}". Try adjusting your search.`
                        : "You haven't added any coins yet. Add your first coin to get started."
                    }
                    colSpan={TABLE_HEAD.length}
                    action={
                      !searchValue && onAddClick && (
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="mingcute:add-line" />}
                          onClick={onAddClick}
                        >
                          New Coin
                        </Button>
                      )
                    }
                  />
                ) : (
                  data.map((row) => (
                    <CoinsTableRow
                      key={row.id}
                      row={row}
                      onDelete={onDelete}
                      onEdit={onEdit}
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
