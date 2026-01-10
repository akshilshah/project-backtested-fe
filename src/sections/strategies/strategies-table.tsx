import type { Strategy } from 'src/types/strategy';

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

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';
import { TableSkeleton } from 'src/components/data-table/table-skeleton';

import { StrategiesTableRow } from './strategies-table-row';
import { StrategiesTableToolbar } from './strategies-table-toolbar';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'name', label: 'Name', minWidth: 200 },
  { id: 'rules', label: 'Rules', width: 120 },
  { id: 'createdAt', label: 'Created', width: 180 },
  { id: 'updatedAt', label: 'Updated', width: 180 },
  { id: 'actions', label: '', width: 80, align: 'right' as const },
];

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
  onAddClick?: () => void;
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
  onAddClick,
}: StrategiesTableProps) {
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
      <StrategiesTableToolbar
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
                      minWidth: cell.minWidth,
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
