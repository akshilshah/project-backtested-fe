import type { Theme, SxProps } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

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
      direction="row"
      alignItems="center"
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
    </Stack>
  );
}
