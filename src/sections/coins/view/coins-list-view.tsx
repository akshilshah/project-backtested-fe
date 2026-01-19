import type { Coin, CreateCoinRequest, UpdateCoinRequest } from 'src/types/coin';

import useSWR from 'swr';
import { toast } from 'sonner';
import { useMemo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { CoinsService } from 'src/services/coins.service';

import { Iconify } from 'src/components/iconify';
import { PageContainer } from 'src/components/page/page-container';

import { CoinsTable } from '../coins-table';
import { CoinEditDialog } from '../coin-edit-dialog';
import { CoinCreateDialog } from '../coin-create-dialog';

// ----------------------------------------------------------------------

export function CoinsListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [createLoading, setCreateLoading] = useState(false);
  const [editCoin, setEditCoin] = useState<Coin | null>(null);
  const [editLoading, setEditLoading] = useState(false);

  // Fetch all coins (no pagination or search on server)
  const { data, isLoading, mutate } = useSWR(['coins'], () => CoinsService.getAll(), {
    keepPreviousData: true,
  });

  const allCoins = data?.coins ?? [];

  // Client-side filtering
  const filteredCoins = useMemo(() => {
    if (!searchValue.trim()) return allCoins;

    const search = searchValue.toLowerCase();
    return allCoins.filter(
      (coin) =>
        coin.symbol.toLowerCase().includes(search) || coin.name.toLowerCase().includes(search)
    );
  }, [allCoins, searchValue]);

  // Client-side pagination
  const paginatedCoins = useMemo(() => {
    const startIndex = page * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredCoins.slice(startIndex, endIndex);
  }, [filteredCoins, page, rowsPerPage]);

  const totalCount = filteredCoins.length;

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

  const handleDelete = useCallback(
    async (id: number) => {
      try {
        setDeletingId(id);
        await CoinsService.delete(id);
        toast.success('Coin deleted successfully');
        mutate();
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to delete coin';
        toast.error(message);
      } finally {
        setDeletingId(null);
      }
    },
    [mutate]
  );

  // Create coin handlers
  const handleOpenCreate = useCallback(() => {
    setCreateOpen(true);
  }, []);

  const handleCloseCreate = useCallback(() => {
    setCreateOpen(false);
  }, []);

  const handleCreateSubmit = useCallback(
    async (formData: CreateCoinRequest) => {
      try {
        setCreateLoading(true);
        await CoinsService.create(formData);
        toast.success('Coin created successfully');
        mutate();
        setCreateOpen(false);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to create coin';
        toast.error(message);
      } finally {
        setCreateLoading(false);
      }
    },
    [mutate]
  );

  // Edit coin handlers
  const handleOpenEdit = useCallback((coin: Coin) => {
    setEditCoin(coin);
  }, []);

  const handleCloseEdit = useCallback(() => {
    setEditCoin(null);
  }, []);

  const handleEditSubmit = useCallback(
    async (id: number, formData: UpdateCoinRequest) => {
      try {
        setEditLoading(true);
        await CoinsService.update(id, formData);
        toast.success('Coin updated successfully');
        mutate();
        setEditCoin(null);
      } catch (error: any) {
        const message = error?.response?.data?.message || 'Failed to update coin';
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
        <Typography variant="h4">Coins</Typography>
        <Button
          variant="contained"
          startIcon={<Iconify icon="mingcute:add-line" />}
          onClick={handleOpenCreate}
        >
          Add
        </Button>
      </Box>

      <CoinsTable
        data={paginatedCoins}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDelete}
        onEdit={handleOpenEdit}
        onAddClick={handleOpenCreate}
        deletingId={deletingId}
      />

      <CoinCreateDialog
        open={createOpen}
        onClose={handleCloseCreate}
        onSubmit={handleCreateSubmit}
        loading={createLoading}
      />

      <CoinEditDialog
        open={!!editCoin}
        coin={editCoin}
        onClose={handleCloseEdit}
        onSubmit={handleEditSubmit}
        loading={editLoading}
      />
    </PageContainer>
  );
}
