import type { UserSettings } from 'src/types/auth';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { RHFSelect, RHFSwitch } from 'src/components/hook-form';

// ----------------------------------------------------------------------

type SettingsDisplayProps = {
  settings: UserSettings | null;
};

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' },
];

const TABLE_DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' },
];

export function SettingsDisplay({ settings }: SettingsDisplayProps) {
  return (
    <Card>
      <CardHeader
        title="Display Settings"
        subheader="Customize how the application looks"
      />
      <CardContent>
        <Stack spacing={3}>
          <RHFSelect name="theme" label="Theme Mode">
            {THEME_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </RHFSelect>

          <RHFSelect name="tableDensity" label="Table Density">
            {TABLE_DENSITY_OPTIONS.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </RHFSelect>

          <Stack spacing={1}>
            <RHFSwitch
              name="compactMode"
              label={
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2">Compact Mode</Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    Use a more compact layout with reduced spacing
                  </Typography>
                </Stack>
              }
              sx={{ alignItems: 'flex-start' }}
            />
          </Stack>
        </Stack>
      </CardContent>
    </Card>
  );
}
