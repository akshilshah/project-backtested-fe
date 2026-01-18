import type { Strategy } from 'src/types/strategy';

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

import { StrategiesCard } from './strategies-card';
import { StrategiesTableRow } from './strategies-table-row';
import { StrategiesTableToolbar } from './strategies-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'entryRule', label: 'Entry Rule', minWidth: 180 },
  { id: 'exitRule', label: 'Exit Rule', minWidth: 180 },
  { id: 'stopLossRule', label: 'Stop Loss Rule', minWidth: 180 },
  { id: 'updatedAt', label: 'Updated', width: 180 },
  { id: 'actions', label: '', width: 80, align: 'right' as const },
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
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="text" width={180} height={16} />
        </Box>
        <Stack direction="row" spacing={0.5}>
          <Skeleton variant="circular" width={32} height={32} />
          <Skeleton variant="circular" width={32} height={32} />
        </Stack>
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
            }}
          >
            <Skeleton variant="text" width={40} height={12} />
            <Skeleton variant="text" width="100%" height={32} />
          </Box>
        ))}
      </Box>
      <Box sx={{ pt: 1.5, borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}` }}>
        <Skeleton variant="text" width={120} height={16} />
      </Box>
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
          icon={'solar:chart-2-bold-duotone' as any}
          width={32}
          sx={{ color: 'text.disabled' }}
        />
      </Box>
      <Typography variant="h6" sx={{ mb: 0.5 }}>
        No strategies found
      </Typography>
      <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3 }}>
        {hasSearch
          ? 'No results found. Try adjusting your search.'
          : "You haven't created any strategies yet. Create your first strategy to get started."}
      </Typography>
      {!hasSearch && onAddClick && (
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={onAddClick}
        >
          New Strategy
        </Button>
      )}
    </Box>
  );
}

type StrategiesTableProps = {
  data: Strategy[];
  loading?: boolean;
  totalCount?: number;
  page: number;
  rowsPerPage: number;
  searchValue: string;
  onSearchChange: (value: string) => void;
  onPageChange: (page: number) => void;
  onRowsPerPageChange: (rowsPerPage: number) => void;
  onDelete: (strategy: Strategy) => void;
  onEdit: (strategy: Strategy) => void;
  onAddClick?: () => void;
  deletingId?: number | null;
};

export function StrategiesTable({
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
}: StrategiesTableProps) {
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
      <StrategiesTableToolbar
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
                <StrategiesCard
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
                      sx={{
                        width: cell.width,
                        minWidth: cell.minWidth,
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
                    title="No strategies found"
                    description={
                      searchValue
                        ? `No results found for "${searchValue}". Try adjusting your search.`
                        : "You haven't created any strategies yet. Create your first strategy to get started."
                    }
                    colSpan={TABLE_HEAD.length}
                    action={
                      !searchValue && onAddClick && (
                        <Button
                          variant="contained"
                          startIcon={<Iconify icon="mingcute:add-line" />}
                          onClick={onAddClick}
                        >
                          New Strategy
                        </Button>
                      )
                    }
                  />
                ) : (
                  data.map((row) => (
                    <StrategiesTableRow
                      key={row.id}
                      row={row}
                      onDelete={onDelete}
                      onEdit={onEdit}
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
