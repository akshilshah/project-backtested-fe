import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import ToggleButton from '@mui/material/ToggleButton';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Direction = 'Long' | 'Short';

type BacktestTradesTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  directionFilter: Direction | 'ALL';
  onDirectionFilterChange: (value: Direction | 'ALL') => void;
};

export function BacktestTradesTableToolbar({
  searchValue,
  onSearchChange,
  directionFilter,
  onDirectionFilterChange,
}: BacktestTradesTableToolbarProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange(event.target.value);
  };

  const handleDirectionChange = (
    _: React.MouseEvent<HTMLElement>,
    newValue: Direction | 'ALL' | null
  ) => {
    if (newValue !== null) {
      onDirectionFilterChange(newValue);
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
        placeholder="Search by coin..."
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
        value={directionFilter}
        exclusive
        onChange={handleDirectionChange}
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
        <ToggleButton value="Long">Long</ToggleButton>
        <ToggleButton value="Short">Short</ToggleButton>
      </ToggleButtonGroup>
    </Stack>
  );
}
