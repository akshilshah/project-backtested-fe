import type { Strategy, CreateStrategyRequest, UpdateStrategyRequest } from 'src/types/strategy';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { StrategiesService } from 'src/services/strategies.service';

import { Iconify } from 'src/components/iconify';
import { DeleteDialog } from 'src/components/form/confirm-dialog';
import { PageContainer } from 'src/components/page/page-container';

import { StrategiesTable } from '../strategies-table';
import { StrategyEditDialog } from '../strategy-edit-dialog';
import { StrategyCreateDialog } from '../strategy-create-dialog';

// ----------------------------------------------------------------------

export function StrategiesListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [deleteStrategy, setDeleteStrategy] = useState<Strategy | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editStrategy, setEditStrategy] = useState<Strategy | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch all strategies (no pagination or search on server)
  const { data, isLoading, mutate } = useSWR(['strategies'], () => StrategiesService.getAll(), {
    keepPreviousData: true,
  });

  const allStrategies = data?.strategies ?? [];

  // Client-side filtering
  const filteredStrategies = useMemo(() => {
    if (!searchValue.trim()) return allStrategies;

    const search = searchValue.toLowerCase();
    return allStrategies.filter(
      (strategy) =>
        strategy.name.toLowerCase().includes(search) ||
        strategy.description?.toLowerCase().includes(search)
    );
  }, [allStrategies, searchValue]);

  // Client-side pagination
  const paginatedStrategies = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredStrategies.slice(startIndex, endIndex);
  }, [filteredStrategies, page, rowsPerPage]);

  const totalCount = filteredStrategies.length;

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPage(0); // Reset to first page when searching
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

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
      mutate();
      setDeleteStrategy(null);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete strategy');
    } finally {
      setDeleting(false);
    }
  }, [deleteStrategy, mutate]);

  const handleDeleteCancel = useCallback(() => {
    setDeleteStrategy(null);
  }, []);

  // Create strategy handlers
  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    async (formData: CreateStrategyRequest) => {
      try {
        setCreateLoading(true);
        await StrategiesService.create(formData);
        toast.success('Strategy created successfully');
        mutate();
        setCreateOpen(false);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create strategy';
        toast.error(message);
      } finally {
        setCreateLoading(false);
      }
    },
    [mutate]
  );

  // Edit strategy handlers
  const handleOpenEdit = useCallback((strategy: Strategy) => {
    setEditStrategy(strategy);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditStrategy(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (id: number, formData: UpdateStrategyRequest) => {
      try {
        setEditLoading(true);
        await StrategiesService.update(id, formData);
        toast.success('Strategy updated successfully');
        mutate();
        setEditStrategy(null);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to update strategy';
        toast.error(message);
      } finally {
        setEditLoading(false);
      }
    },
    [mutate]
  );

  return (
    <PageContainer>
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

      <StrategiesTable
        data={paginatedStrategies}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDeleteClick}
        onEdit={handleOpenEdit}
        onAddClick={handleOpenCreate}
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

      <StrategyEditDialog
        open={!!editStrategy}
        strategy={editStrategy}
        onClose={handleCloseEdit}
        onSubmit={handleEditSubmit}
        loading={editLoading}
      />
    </PageContainer>
  );
}
