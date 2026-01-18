import type { Theme, SxProps } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type StrategiesTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
  sx?: SxProps<Theme>;
};

export function StrategiesTableToolbar({
  searchValue,
  onSearchChange,
  sx,
}: StrategiesTableToolbarProps) {
  return (
    <Stack
      direction="row"
      alignItems="center"
      sx={{
        p: 2,
        py: 1.5,
        borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark'
            ? 'rgba(255, 255, 255, 0.02)'
            : 'rgba(0, 0, 0, 0.01)',
        ...sx,
      }}
    >
      <TextField
        size="small"
        placeholder="Search strategies..."
        value={searchValue}
        onChange={(e) => onSearchChange(e.target.value)}
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
    </Stack>
  );
}
