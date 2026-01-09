import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { TradeFilters } from 'src/types/trade';

import dayjs from 'dayjs';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type AnalyticsFiltersProps = {
  filters: TradeFilters;
  onFiltersChange: (filters: TradeFilters) => void;
  onClearFilters: () => void;
  coins: Coin[];
  strategies: Strategy[];
  coinsLoading?: boolean;
  strategiesLoading?: boolean;
};

export function AnalyticsFilters({
  filters,
  onFiltersChange,
  onClearFilters,
  coins,
  strategies,
  coinsLoading,
  strategiesLoading,
}: AnalyticsFiltersProps) {
  const hasFilters = !!(filters.coinId || filters.strategyId || filters.dateFrom || filters.dateTo);

  const handleCoinChange = (_: any, coin: Coin | null) => {
    onFiltersChange({ ...filters, coinId: coin?.id });
  };

  const handleStrategyChange = (_: any, strategy: Strategy | null) => {
    onFiltersChange({ ...filters, strategyId: strategy?.id });
  };

  const handleDateFromChange = (date: dayjs.Dayjs | null) => {
    onFiltersChange({ ...filters, dateFrom: date?.format('YYYY-MM-DD') });
  };

  const handleDateToChange = (date: dayjs.Dayjs | null) => {
    onFiltersChange({ ...filters, dateTo: date?.format('YYYY-MM-DD') });
  };

  const selectedCoin = coins.find((c) => c.id === filters.coinId) || null;
  const selectedStrategy = strategies.find((s) => s.id === filters.strategyId) || null;

  return (
    <Card sx={{ p: 3 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        alignItems={{ sm: 'center' }}
      >
        {coinsLoading ? (
          <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 1 }} />
        ) : (
          <Autocomplete
            size="small"
            options={coins}
            value={selectedCoin}
            onChange={handleCoinChange}
            getOptionLabel={(option) => `${option.symbol} - ${option.name}`}
            renderInput={(params) => (
              <TextField {...params} label="Coin" placeholder="All coins" />
            )}
            sx={{ minWidth: 200 }}
          />
        )}

        {strategiesLoading ? (
          <Skeleton variant="rectangular" width={200} height={56} sx={{ borderRadius: 1 }} />
        ) : (
          <Autocomplete
            size="small"
            options={strategies}
            value={selectedStrategy}
            onChange={handleStrategyChange}
            getOptionLabel={(option) => option.name}
            renderInput={(params) => (
              <TextField {...params} label="Strategy" placeholder="All strategies" />
            )}
            sx={{ minWidth: 200 }}
          />
        )}

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
            variant="soft"
            color="error"
            size="small"
            startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
            onClick={onClearFilters}
          >
            Clear
          </Button>
        )}
      </Stack>
    </Card>
  );
}
