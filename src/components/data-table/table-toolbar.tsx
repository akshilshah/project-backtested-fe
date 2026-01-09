import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TableToolbarProps = {
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  searchPlaceholder?: string;
  numSelected?: number;
  actions?: React.ReactNode;
  filters?: React.ReactNode;
  onRefresh?: () => void;
  sx?: SxProps<Theme>;
};

export function TableToolbar({
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Search...',
  numSelected = 0,
  actions,
  filters,
  onRefresh,
  sx,
}: TableToolbarProps) {
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onSearchChange?.(event.target.value);
  };

  const handleClearSearch = () => {
    onSearchChange?.('');
  };

  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      justifyContent="space-between"
      spacing={2}
      sx={{
        p: 2.5,
        ...(numSelected > 0 && {
          bgcolor: 'primary.lighter',
        }),
        ...sx,
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2} sx={{ flexGrow: 1 }}>
        {onSearchChange && (
          <TextField
            size="small"
            value={searchValue}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            slotProps={{
              input: {
                startAdornment: (
                  <InputAdornment position="start">
                    <Iconify icon={'solar:magnifer-outline' as any} sx={{ color: 'text.disabled' }} />
                  </InputAdornment>
                ),
                endAdornment: searchValue ? (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={handleClearSearch}>
                      <Iconify icon="solar:close-circle-bold" width={18} />
                    </IconButton>
                  </InputAdornment>
                ) : null,
              },
            }}
            sx={{ width: { xs: 1, sm: 260 } }}
          />
        )}

        {filters}
      </Stack>

      <Stack direction="row" alignItems="center" spacing={1}>
        {onRefresh && (
          <Tooltip title="Refresh">
            <IconButton onClick={onRefresh}>
              <Iconify icon="solar:restart-bold" />
            </IconButton>
          </Tooltip>
        )}

        {actions}
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type TableSelectedActionsProps = {
  numSelected: number;
  onDelete?: () => void;
  actions?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function TableSelectedActions({
  numSelected,
  onDelete,
  actions,
  sx,
}: TableSelectedActionsProps) {
  if (numSelected === 0) return null;

  return (
    <Box
      sx={{
        pl: 2,
        pr: 1,
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9,
        height: 58,
        display: 'flex',
        position: 'absolute',
        alignItems: 'center',
        bgcolor: 'primary.lighter',
        ...sx,
      }}
    >
      <Box component="span" sx={{ color: 'primary.main', fontWeight: 600 }}>
        {numSelected} selected
      </Box>

      <Box sx={{ flexGrow: 1 }} />

      {actions}

      {onDelete && (
        <Tooltip title="Delete">
          <IconButton color="primary" onClick={onDelete}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
      )}
    </Box>
  );
}
