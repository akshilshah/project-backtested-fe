import type { Theme, SxProps } from '@mui/material/styles';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Checkbox from '@mui/material/Checkbox';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableSortLabel from '@mui/material/TableSortLabel';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';

import { Scrollbar } from 'src/components/scrollbar';

import { TableEmpty } from './table-empty';
import { TableSkeleton } from './table-skeleton';
import { TableToolbar, TableSelectedActions } from './table-toolbar';

// ----------------------------------------------------------------------

export type Order = 'asc' | 'desc';

export type Column<T> = {
  id: keyof T | string;
  label: string;
  width?: number | string;
  minWidth?: number;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  render?: (row: T, index: number) => React.ReactNode;
};

type DataTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  rowKey: keyof T;
  loading?: boolean;
  // Sorting
  orderBy?: string;
  order?: Order;
  onSort?: (property: string) => void;
  // Selection
  selectable?: boolean;
  selected?: string[];
  onSelectRow?: (id: string) => void;
  onSelectAllRows?: (checked: boolean, ids: string[]) => void;
  // Pagination
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (page: number) => void;
  onRowsPerPageChange?: (rowsPerPage: number) => void;
  rowsPerPageOptions?: number[];
  // Search
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  // Actions
  toolbarActions?: React.ReactNode;
  selectedActions?: React.ReactNode;
  onDeleteSelected?: () => void;
  onRefresh?: () => void;
  filters?: React.ReactNode;
  // Empty state
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: React.ReactNode;
  // Styles
  sx?: SxProps<Theme>;
  dense?: boolean;
};

export function DataTable<T>({
  columns,
  data,
  rowKey,
  loading = false,
  // Sorting
  orderBy,
  order = 'asc',
  onSort,
  // Selection
  selectable = false,
  selected = [],
  onSelectRow,
  onSelectAllRows,
  // Pagination
  page = 0,
  rowsPerPage = 10,
  totalCount,
  onPageChange,
  onRowsPerPageChange,
  rowsPerPageOptions = [5, 10, 25, 50],
  // Search
  searchValue,
  onSearchChange,
  searchPlaceholder,
  // Actions
  toolbarActions,
  selectedActions,
  onDeleteSelected,
  onRefresh,
  filters,
  // Empty state
  emptyTitle,
  emptyDescription,
  emptyAction,
  // Styles
  sx,
  dense = false,
}: DataTableProps<T>) {
  const numSelected = selected.length;
  const rowCount = data.length;

  const handleSelectAllClick = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      if (onSelectAllRows) {
        const ids = data.map((row) => String(row[rowKey]));
        onSelectAllRows(event.target.checked, ids);
      }
    },
    [data, rowKey, onSelectAllRows]
  );

  const handleSort = useCallback(
    (property: string) => () => {
      onSort?.(property);
    },
    [onSort]
  );

  const handlePageChange = useCallback(
    (_: unknown, newPage: number) => {
      onPageChange?.(newPage);
    },
    [onPageChange]
  );

  const handleRowsPerPageChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      onRowsPerPageChange?.(parseInt(event.target.value, 10));
    },
    [onRowsPerPageChange]
  );

  const renderHead = () => (
    <TableHead>
      <TableRow>
        {selectable && (
          <TableCell padding="checkbox">
            <Checkbox
              indeterminate={numSelected > 0 && numSelected < rowCount}
              checked={rowCount > 0 && numSelected === rowCount}
              onChange={handleSelectAllClick}
            />
          </TableCell>
        )}

        {columns.map((column) => (
          <TableCell
            key={String(column.id)}
            align={column.align ?? 'left'}
            sx={{ width: column.width, minWidth: column.minWidth }}
            sortDirection={orderBy === column.id ? order : false}
          >
            {column.sortable !== false && onSort ? (
              <TableSortLabel
                active={orderBy === column.id}
                direction={orderBy === column.id ? order : 'asc'}
                onClick={handleSort(String(column.id))}
              >
                {column.label}
              </TableSortLabel>
            ) : (
              column.label
            )}
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );

  const renderBody = () => (
    <TableBody>
      {loading ? (
        <TableSkeleton rows={rowsPerPage} columns={columns.length + (selectable ? 1 : 0)} />
      ) : data.length === 0 ? (
        <TableEmpty
          title={emptyTitle}
          description={emptyDescription}
          action={emptyAction}
          colSpan={columns.length + (selectable ? 1 : 0)}
        />
      ) : (
        data.map((row, index) => {
          const id = String(row[rowKey]);
          const isSelected = selected.includes(id);

          return (
            <TableRow
              hover
              key={id}
              selected={isSelected}
              sx={{ cursor: selectable ? 'pointer' : 'default' }}
            >
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox checked={isSelected} onClick={() => onSelectRow?.(id)} />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell key={String(column.id)} align={column.align ?? 'left'}>
                  {column.render
                    ? column.render(row, index)
                    : String(row[column.id as keyof T] ?? '-')}
                </TableCell>
              ))}
            </TableRow>
          );
        })
      )}
    </TableBody>
  );

  return (
    <Card sx={sx}>
      {(onSearchChange || toolbarActions || filters || onRefresh) && (
        <TableToolbar
          searchValue={searchValue}
          onSearchChange={onSearchChange}
          searchPlaceholder={searchPlaceholder}
          numSelected={numSelected}
          actions={toolbarActions}
          filters={filters}
          onRefresh={onRefresh}
        />
      )}

      <Box sx={{ position: 'relative' }}>
        <TableSelectedActions
          numSelected={numSelected}
          onDelete={onDeleteSelected}
          actions={selectedActions}
        />

        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset' }}>
            <Table size={dense ? 'small' : 'medium'} sx={{ minWidth: 800 }}>
              {renderHead()}
              {renderBody()}
            </Table>
          </TableContainer>
        </Scrollbar>
      </Box>

      {onPageChange && (
        <TablePagination
          component="div"
          page={page}
          count={totalCount ?? data.length}
          rowsPerPage={rowsPerPage}
          onPageChange={handlePageChange}
          rowsPerPageOptions={rowsPerPageOptions}
          onRowsPerPageChange={handleRowsPerPageChange}
        />
      )}
    </Card>
  );
}

// ----------------------------------------------------------------------

export function useTable(initialState?: {
  orderBy?: string;
  order?: Order;
  page?: number;
  rowsPerPage?: number;
  selected?: string[];
}) {
  const [orderBy, setOrderBy] = useState(initialState?.orderBy ?? '');
  const [order, setOrder] = useState<Order>(initialState?.order ?? 'asc');
  const [page, setPage] = useState(initialState?.page ?? 0);
  const [rowsPerPage, setRowsPerPage] = useState(initialState?.rowsPerPage ?? 10);
  const [selected, setSelected] = useState<string[]>(initialState?.selected ?? []);

  const onSort = useCallback(
    (property: string) => {
      const isAsc = orderBy === property && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(property);
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback((id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  }, []);

  const onSelectAllRows = useCallback((checked: boolean, ids: string[]) => {
    setSelected(checked ? ids : []);
  }, []);

  const onResetSelected = useCallback(() => {
    setSelected([]);
  }, []);

  const onChangePage = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  return {
    orderBy,
    order,
    page,
    rowsPerPage,
    selected,
    onSort,
    onSelectRow,
    onSelectAllRows,
    onResetSelected,
    onChangePage,
    onChangeRowsPerPage,
    onResetPage,
    setPage,
    setRowsPerPage,
    setOrder,
    setOrderBy,
    setSelected,
  };
}
