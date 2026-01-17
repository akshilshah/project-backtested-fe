import type { Coin } from 'src/types/coin';
import type { BacktestFilters } from 'src/types/backtest';

import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BacktestTradesFiltersProps = {
  open: boolean;
  filters: BacktestFilters;
  onFiltersChange: (filters: BacktestFilters) => void;
  onClearFilters: () => void;
  coins: Coin[];
  coinsLoading?: boolean;
};

export function BacktestTradesFilters({
  open,
  filters,
  onFiltersChange,
  onClearFilters,
  coins,
  coinsLoading,
}: BacktestTradesFiltersProps) {
  const selectedCoin = coins.find((c) => c.id === filters.coinId) ?? null;

  const handleCoinChange = (_: any, newValue: Coin | null) => {
    onFiltersChange({ ...filters, coinId: newValue?.id });
  };

  const handleDateFromChange = (newValue: dayjs.Dayjs | null) => {
    onFiltersChange({
      ...filters,
      dateFrom: newValue?.format('YYYY-MM-DD') ?? undefined,
    });
  };

  const handleDateToChange = (newValue: dayjs.Dayjs | null) => {
    onFiltersChange({
      ...filters,
      dateTo: newValue?.format('YYYY-MM-DD') ?? undefined,
    });
  };

  const hasFilters = filters.coinId || filters.dateFrom || filters.dateTo;

  return (
    <Collapse in={open}>
      <Box sx={{ px: 2.5, pb: 2.5 }}>
        <Stack
          direction={{ xs: 'column', md: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', md: 'flex-end' }}
        >
          <Autocomplete
            value={selectedCoin}
            onChange={handleCoinChange}
            options={coins}
            loading={coinsLoading}
            getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
            isOptionEqualToValue={(option, value) => option.id === value.id}
            renderInput={(params) => (
              <TextField {...params} label="Coin" placeholder="Filter by coin" size="small" />
            )}
            sx={{ minWidth: 200 }}
          />

          <DatePicker
            label="From Date"
            value={filters.dateFrom ? dayjs(filters.dateFrom) : null}
            onChange={handleDateFromChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 160 },
              },
            }}
          />

          <DatePicker
            label="To Date"
            value={filters.dateTo ? dayjs(filters.dateTo) : null}
            onChange={handleDateToChange}
            slotProps={{
              textField: {
                size: 'small',
                sx: { minWidth: 160 },
              },
            }}
          />

          {hasFilters && (
            <Button
              variant="text"
              color="inherit"
              onClick={onClearFilters}
              startIcon={<Iconify icon={'solar:close-circle-bold' as any} />}
              sx={{ flexShrink: 0 }}
            >
              Clear
            </Button>
          )}
        </Stack>
      </Box>
    </Collapse>
  );
}
