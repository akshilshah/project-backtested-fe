import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

const QUICK_ACTIONS = [
  {
    label: 'New Trade',
    description: 'Record a new trade entry',
    icon: 'solar:add-square-bold-duotone',
    href: paths.dashboard.trades.new,
    color: 'primary',
  },
  {
    label: 'View All Trades',
    description: 'Browse your trading journal',
    icon: 'solar:document-text-bold-duotone',
    href: paths.dashboard.trades.root,
    color: 'info',
  },
  {
    label: 'Analytics',
    description: 'Analyze your performance',
    icon: 'solar:chart-bold-duotone',
    href: paths.dashboard.analytics,
    color: 'success',
  },
] as const;

export function DashboardQuickActions() {
  const theme = useTheme();

  return (
    <Card sx={{ p: 3 }}>
      <Typography variant="h6" sx={{ mb: 3 }}>
        Quick Actions
      </Typography>

      <Stack spacing={2}>
        {QUICK_ACTIONS.map((action) => (
          <Button
            key={action.label}
            component={RouterLink}
            href={action.href}
            variant="soft"
            color={action.color}
            sx={{
              py: 2,
              px: 2.5,
              justifyContent: 'flex-start',
              textAlign: 'left',
              '&:hover': {
                bgcolor: alpha(theme.palette[action.color].main, 0.16),
              },
            }}
          >
            <Box
              sx={{
                p: 1.5,
                borderRadius: 1.5,
                mr: 2,
                bgcolor: alpha(theme.palette[action.color].main, 0.08),
              }}
            >
              <Iconify
                icon={action.icon as any}
                width={24}
                sx={{ color: `${action.color}.main` }}
              />
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography variant="subtitle2">{action.label}</Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {action.description}
              </Typography>
            </Box>

            <Iconify
              icon="eva:arrow-ios-forward-fill"
              width={20}
              sx={{ color: 'text.disabled' }}
            />
          </Button>
        ))}
      </Stack>
    </Card>
  );
}
