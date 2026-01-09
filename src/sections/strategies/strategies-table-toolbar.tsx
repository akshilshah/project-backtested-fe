import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type StrategiesTableToolbarProps = {
  searchValue: string;
  onSearchChange: (value: string) => void;
};

export function StrategiesTableToolbar({
  searchValue,
  onSearchChange,
}: StrategiesTableToolbarProps) {
  return (
    <TextField
      value={searchValue}
      onChange={(e) => onSearchChange(e.target.value)}
      placeholder="Search strategies..."
      size="small"
      sx={{ width: 280 }}
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
          </InputAdornment>
        ),
      }}
    />
  );
}
