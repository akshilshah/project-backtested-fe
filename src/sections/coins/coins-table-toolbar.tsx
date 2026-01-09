import type { Theme, SxProps } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type CoinsTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sx?: SxProps<Theme>;
};

export function CoinsTableToolbar({
  searchValue,
  onSearchChange,
  sx,
}: CoinsTableToolbarProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{ p: 2.5, ...sx }}
    >
      <TextField
        size="small"
        placeholder="Search coins..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
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

      <Button
        component={RouterLink}
        href={paths.dashboard.coins.new}
        variant="contained"
        startIcon={<Iconify icon="mingcute:add-line" />}
      >
        New Coin
      </Button>
    </Stack>
  );
}
