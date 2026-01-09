import { useState, useCallback } from 'react';

import { toast } from 'sonner';
import useSWR from 'swr';

import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { CoinsService } from 'src/services/coins.service';

import { Iconify } from 'src/components/iconify';
import { PageHeader } from 'src/components/page/page-header';
import { PageContainer } from 'src/components/page/page-container';

import { CoinsTable } from '../coins-table';

// ----------------------------------------------------------------------

export function CoinsListView() {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [searchValue, setSearchValue] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch coins data
  const { data, isLoading, mutate } = useSWR(
    ['coins', page, rowsPerPage, searchValue],
    () =>
      CoinsService.getAll({
        page: page + 1,
        limit: rowsPerPage,
        search: searchValue || undefined,
      }),
    {
      keepPreviousData: true,
    }
  );

  const coins = data?.data ?? [];
  const totalCount = data?.pagination?.total ?? 0;

  const handleSearchChange = useCallback((value: string) => {
    setSearchValue(value);
    setPage(0);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleRowsPerPageChange = useCallback((newRowsPerPage: number) => {
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
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

  return (
    <PageContainer>
      <PageHeader
        title="Coins"
        subtitle="Manage your cryptocurrency coins"
        breadcrumbs={[
          { label: 'Dashboard', href: paths.dashboard.root },
          { label: 'Coins' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.dashboard.coins.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            New Coin
          </Button>
        }
      />

      <CoinsTable
        data={coins}
        loading={isLoading}
        totalCount={totalCount}
        page={page}
        rowsPerPage={rowsPerPage}
        searchValue={searchValue}
        onSearchChange={handleSearchChange}
        onPageChange={handlePageChange}
        onRowsPerPageChange={handleRowsPerPageChange}
        onDelete={handleDelete}
        deletingId={deletingId}
      />
    </PageContainer>
  );
}
