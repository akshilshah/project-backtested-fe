import type { TradeStatus } from 'src/types/trade';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TradesTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  statusFilter: TradeStatus | 'ALL';
  onStatusFilterChange: (value: TradeStatus | 'ALL') => void;
};

export function TradesTableToolbar({
  searchValue,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
}: TradesTableToolbarProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleStatusChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: TradeStatus | 'ALL' | null
  ) => {
    if (newValue !== null) {
      onStatusFilterChange(newValue);
    }
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'stretch', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ p: 2, py: 1.5 }}
    >
      <TextField
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Search trades..."
        size="small"
        sx={{
          width: { xs: '100%', sm: 260 },
          '& .MuiOutlinedInput-root': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.02)',
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.03)',
            },
            '&.Mui-focused': {
              bgcolor: 'transparent',
            },
          },
        }}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Iconify icon={'eva:search-fill' as any} sx={{ color: 'text.disabled' }} />
              </InputAdornment>
            ),
          },
        }}
      />

      <ToggleButtonGroup
        value={statusFilter}
        exclusive
        onChange={handleStatusChange}
        size="small"
        sx={{
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.02)',
          borderRadius: 1,
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.625,
            fontSize: '0.8125rem',
            fontWeight: 500,
            border: 'none',
            color: 'text.secondary',
            '&.Mui-selected': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(99, 102, 241, 0.16)'
                  : 'rgba(99, 102, 241, 0.12)',
              color: 'primary.main',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.24)'
                    : 'rgba(99, 102, 241, 0.16)',
              },
            },
            '&:hover': {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.08)'
                  : 'rgba(0, 0, 0, 0.04)',
            },
          },
          '& .MuiToggleButtonGroup-grouped:not(:first-of-type)': {
            borderLeft: 'none',
            marginLeft: 0,
          },
        }}
      >
        <ToggleButton value="ALL">All</ToggleButton>
        <ToggleButton value="OPEN">Open</ToggleButton>
        <ToggleButton value="CLOSED">Closed</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
