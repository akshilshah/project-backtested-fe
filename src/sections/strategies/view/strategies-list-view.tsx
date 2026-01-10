import type { Strategy, CreateStrategyRequest } from 'src/types/strategy';
import type { Column } from 'src/components/data-table';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import useSWR, { mutate } from 'swr';
import { toast } from 'sonner';
import { fDateTime } from 'src/utils/format-time';

import { paths } from 'src/routes/paths';

import { Iconify } from 'src/components/iconify';
import { DataTable, useTable } from 'src/components/data-table';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

import { StrategiesService } from 'src/services/strategies.service';

import { StrategiesTableRow } from '../strategies-table-row';
import { StrategyCreateDialog } from '../strategy-create-dialog';

// ----------------------------------------------------------------------

export function StrategiesListView() {
  const router = useRouter();
  const table = useTable({ orderBy: 'createdAt', order: 'desc' });

  const [searchValue, setSearchValue] = useState('');
  const [deleteStrategy, setDeleteStrategy] = useState<Strategy | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);

  // Fetch strategies
  const { data, isLoading, error } = useSWR(
    ['strategies', table.page, table.rowsPerPage, table.orderBy, table.order, searchValue],
    () =>
      StrategiesService.getAll({
        page: table.page + 1,
        limit: table.rowsPerPage,
        sortBy: table.orderBy || 'createdAt',
        sortOrder: table.order,
        search: searchValue || undefined,
      })
  );

  const strategies = data?.strategies || [];
  const totalCount = data?.pagination?.total || strategies.length;

  // Handle search
  const handleSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      table.onResetPage();
    },
    [table]
  );

  // Handle delete
  const handleDeleteClick = useCallback((strategy: Strategy) => {
    setDeleteStrategy(strategy);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    if (!deleteStrategy) return;

    setDeleting(true);
    try {
      await StrategiesService.delete(deleteStrategy.id);
      toast.success(`Strategy "${deleteStrategy.name}" deleted successfully`);
      mutate(['strategies', table.page, table.rowsPerPage, table.orderBy, table.order, searchValue]);
      setDeleteStrategy(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete strategy');
    } finally {
      setDeleting(false);
    }
  }, [deleteStrategy, table.page, table.rowsPerPage, table.orderBy, table.order, searchValue]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteStrategy(null);
  }, []);

  // Handle refresh
  const handleRefresh = useCallback(() => {
    mutate(['strategies', table.page, table.rowsPerPage, table.orderBy, table.order, searchValue]);
  }, [table.page, table.rowsPerPage, table.orderBy, table.order, searchValue]);

  // Create strategy handlers
  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    async (data: CreateStrategyRequest) => {
      try {
        setCreateLoading(true);
        await StrategiesService.create(data);
        toast.success('Strategy created successfully');
        mutate(['strategies', table.page, table.rowsPerPage, table.orderBy, table.order, searchValue]);
        setCreateOpen(false);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create strategy';
        toast.error(message);
      } finally {
        setCreateLoading(false);
      }
    },
    [table.page, table.rowsPerPage, table.orderBy, table.order, searchValue]
  );

  // Table columns
  const columns: Column<Strategy>[] = [
    {
      id: 'name',
      label: 'Name',
      minWidth: 200,
      sortable: true,
      render: (row) => (
        <Stack spacing={0.5}>
          <Typography variant="subtitle2" noWrap>
            {row.name}
          </Typography>
          {row.description && (
            <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
              {row.description}
            </Typography>
          )}
        </Stack>
      ),
    },
    {
      id: 'rules',
      label: 'Rules',
      width: 120,
      sortable: false,
      render: (row) => {
        const hasRules = row.rules && Object.keys(row.rules).length > 0;
        return hasRules ? (
          <Tooltip title="View rules in details">
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'success.lighter',
                color: 'success.darker',
                typography: 'caption',
                fontWeight: 600,
              }}
            >
              <Iconify icon="solar:check-circle-bold" width={14} />
              {Object.keys(row.rules!).length} rules
            </Box>
          </Tooltip>
        ) : (
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              px: 1,
              py: 0.5,
              borderRadius: 1,
              bgcolor: 'grey.100',
              color: 'text.secondary',
              typography: 'caption',
            }}
          >
            No rules
          </Box>
        );
      },
    },
    {
      id: 'createdAt',
      label: 'Created',
      width: 180,
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {fDateTime(row.createdAt)}
        </Typography>
      ),
    },
    {
      id: 'updatedAt',
      label: 'Updated',
      width: 180,
      sortable: true,
      render: (row) => (
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          {fDateTime(row.updatedAt)}
        </Typography>
      ),
    },
    {
      id: 'actions',
      label: '',
      width: 80,
      align: 'right',
      sortable: false,
      render: (row) => <RowActions row={row} onDelete={handleDeleteClick} />,
    },
  ];

  return (
    <Container maxWidth="lg">
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Strategies</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Add
        </Button>
      </Box>

      <DataTable
        columns={columns}
        data={strategies}
        rowKey="id"
        loading={isLoading}
        // Sorting
        orderBy={table.orderBy}
        order={table.order}
        onSort={table.onSort}
        // Pagination
        page={table.page}
        rowsPerPage={table.rowsPerPage}
        totalCount={totalCount}
        onPageChange={table.onChangePage}
        onRowsPerPageChange={table.onChangeRowsPerPage}
        // Search
        searchValue={searchValue}
        onSearchChange={handleSearch}
        searchPlaceholder="Search strategies..."
        // Actions
        onRefresh={handleRefresh}
        // Empty state
        emptyTitle="No strategies found"
        emptyDescription="Get started by creating your first trading strategy"
        emptyAction={
          <Button
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
            onClick={handleOpenCreate}
          >
            Create Strategy
          </Button>
        }
      />

      <DeleteDialog
        open={!!deleteStrategy}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Delete Strategy"
        itemName={deleteStrategy?.name}
        loading={deleting}
      />

      <StrategyCreateDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />
    </Container>
  );
}

// ----------------------------------------------------------------------

type RowActionsProps = {
  row: Strategy;
  onDelete: (strategy: Strategy) => void;
};

function RowActions({ row, onDelete }: RowActionsProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleOpenMenu = (event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMenu = () => {
    setAnchorEl(null);
  };

  const handleView = () => {
    router.push(paths.dashboard.strategies.details(row.id));
    handleCloseMenu();
  };

  const handleEdit = () => {
    router.push(paths.dashboard.strategies.edit(row.id));
    handleCloseMenu();
  };

  const handleDelete = () => {
    onDelete(row);
    handleCloseMenu();
  };

  return (
    <Box onClick={(e) => e.stopPropagation()}>
      <Tooltip title="Actions">
        <Button
          size="small"
          variant="text"
          color="inherit"
          onClick={handleOpenMenu}
          sx={{ minWidth: 'auto', p: 0.5 }}
        >
          <Iconify icon="eva:more-vertical-fill" />
        </Button>
      </Tooltip>

      {anchorEl && (
        <Box
          component="div"
          sx={{
            position: 'fixed',
            top: anchorEl.getBoundingClientRect().bottom + 4,
            left: anchorEl.getBoundingClientRect().left - 100,
            zIndex: 1300,
            bgcolor: 'background.paper',
            borderRadius: 1,
            boxShadow: 3,
            py: 0.5,
            minWidth: 140,
          }}
        >
          <Box
            component="div"
            onClick={handleView}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:eye-bold" width={20} />
            <Typography variant="body2">View</Typography>
          </Box>
          <Box
            component="div"
            onClick={handleEdit}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:pen-bold" width={20} />
            <Typography variant="body2">Edit</Typography>
          </Box>
          <Box
            component="div"
            onClick={handleDelete}
            sx={{
              px: 2,
              py: 1,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              cursor: 'pointer',
              color: 'error.main',
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" width={20} />
            <Typography variant="body2">Delete</Typography>
          </Box>
          <Box
            component="div"
            sx={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: -1,
            }}
            onClick={handleCloseMenu}
          />
        </Box>
      )}
    </Box>
  );
}
