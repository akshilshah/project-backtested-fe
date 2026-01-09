import type { TradeStatus } from 'src/types/trade';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButton from '@mui/material/ToggleButton';
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
      sx={{ p: 2.5 }}
    >
      <TextField
        value={searchValue}
        onChange={handleSearchChange}
        placeholder="Search trades..."
        size="small"
        sx={{ width: { xs: '100%', sm: 280 } }}
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
          '& .MuiToggleButton-root': {
            px: 2,
            py: 0.75,
            fontSize: '0.8125rem',
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
