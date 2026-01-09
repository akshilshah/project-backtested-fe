import type { Coin } from 'src/types/coin';

import { useCallback } from 'react';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';
import { TableSkeleton } from 'src/components/data-table/table-skeleton';

import { CoinsTableRow } from './coins-table-row';
import { CoinsTableToolbar } from './coins-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Coin', width: 280 },
  { id: 'symbol', label: 'Symbol', width: 120 },
  { id: 'createdAt', label: 'Created', width: 180 },
  { id: 'actions', label: '', width: 120, align: 'right' as const },
];

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
  onDelete: (id: string) => void;
  deletingId?: string | null;
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
  deletingId,
}: CoinsTableProps) {
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
    <Card>
      <CoinsTableToolbar
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />

      <Scrollbar>
        <TableContainer sx={{ minWidth: 800 }}>
          <Table>
            <TableHead>
              <TableRow>
                {TABLE_HEAD.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.align ?? 'left'}
                    sx={{
                      width: cell.width,
                      bgcolor: 'background.neutral',
                    }}
                  >
                    {cell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody>
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
                    !searchValue && (
                      <Button
                        component={RouterLink}
                        href={paths.dashboard.coins.new}
                        variant="contained"
                        startIcon={<Iconify icon="mingcute:add-line" />}
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
