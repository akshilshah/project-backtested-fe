import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { AnimateCountUp } from 'src/components/animate';

// ----------------------------------------------------------------------

type StatCardProps = {
  title: string;
  value: number | string;
  icon?: string;
  iconColor?: string;
  trend?: {
    value: number;
    direction: 'up' | 'down';
  };
  subtitle?: string;
  loading?: boolean;
  format?: 'number' | 'currency' | 'percent';
  prefix?: string;
  suffix?: string;
  decimals?: number;
  sx?: SxProps<Theme>;
};

export function StatCard({
  title,
  value,
  icon,
  iconColor = 'primary.main',
  trend,
  subtitle,
  loading = false,
  format = 'number',
  prefix,
  suffix,
  decimals = 0,
  sx,
}: StatCardProps) {
  const theme = useTheme();

  const formatValue = () => {
    if (typeof value === 'string') return value;

    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('en-US', {
          style: 'currency',
          currency: 'USD',
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        }).format(value);
      case 'percent':
        return `${value.toFixed(decimals)}%`;
      default:
        return value.toLocaleString('en-US', {
          minimumFractionDigits: decimals,
          maximumFractionDigits: decimals,
        });
    }
  };

  if (loading) {
    return (
      <Card sx={{ p: 3, ...sx }}>
        <Stack spacing={2}>
          <Skeleton variant="text" width={100} height={20} />
          <Skeleton variant="text" width={150} height={40} />
          <Skeleton variant="text" width={80} height={16} />
        </Stack>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        p: 3,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        ...sx,
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
            {title}
          </Typography>

          {icon && (
            <Box
              sx={{
                p: 1,
                borderRadius: 1.5,
                bgcolor: alpha(theme.palette.primary.main, 0.08),
                transition: 'transform 0.2s ease-in-out',
                '.MuiCard-root:hover &': {
                  transform: 'scale(1.1)',
                },
              }}
            >
              <Iconify icon={icon as any} width={24} sx={{ color: iconColor }} />
            </Box>
          )}
        </Stack>

        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5 }}>
          {prefix && (
            <Typography variant="h4" component="span">
              {prefix}
            </Typography>
          )}

          {typeof value === 'number' ? (
            <AnimateCountUp to={value} toFixed={decimals} sx={{ typography: 'h4' }} />
          ) : (
            <Typography variant="h4">{value}</Typography>
          )}

          {suffix && (
            <Typography variant="body1" component="span" sx={{ color: 'text.secondary' }}>
              {suffix}
            </Typography>
          )}
        </Box>

        {(trend || subtitle) && (
          <Stack direction="row" alignItems="center" spacing={1}>
            {trend && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{
                  color: trend.direction === 'up' ? 'success.main' : 'error.main',
                }}
              >
                <Iconify
                  icon={(trend.direction === 'up' ? 'solar:arrow-up-outline' : 'solar:arrow-down-outline') as any}
                  width={16}
                />
                <Typography variant="caption" sx={{ fontWeight: 600 }}>
                  {trend.value > 0 ? '+' : ''}
                  {trend.value.toFixed(1)}%
                </Typography>
              </Stack>
            )}

            {subtitle && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                {subtitle}
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
