import type { Theme, SxProps } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type PriceDisplayProps = {
  value: number;
  currency?: string;
  label?: string;
  size?: 'small' | 'medium' | 'large';
  color?: string;
  sx?: SxProps<Theme>;
};

export function PriceDisplay({
  value,
  currency = 'USD',
  label,
  size = 'medium',
  color,
  sx,
}: PriceDisplayProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          valueVariant: 'body2' as const,
          labelVariant: 'caption' as const,
        };
      case 'large':
        return {
          valueVariant: 'h5' as const,
          labelVariant: 'body2' as const,
        };
      default:
        return {
          valueVariant: 'subtitle1' as const,
          labelVariant: 'caption' as const,
        };
    }
  };

  const { valueVariant, labelVariant } = getSizeStyles();

  const formatPrice = () =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);

  return (
    <Stack sx={sx}>
      {label && (
        <Typography variant={labelVariant} sx={{ color: 'text.secondary', mb: 0.25 }}>
          {label}
        </Typography>
      )}
      <Typography variant={valueVariant} sx={{ fontWeight: 600, color }}>
        {formatPrice()}
      </Typography>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type PriceChangeDisplayProps = {
  currentPrice: number;
  previousPrice: number;
  currency?: string;
  showPercentage?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
};

export function PriceChangeDisplay({
  currentPrice,
  previousPrice,
  currency = 'USD',
  showPercentage = true,
  size = 'medium',
  sx,
}: PriceChangeDisplayProps) {
  const change = currentPrice - previousPrice;
  const changePercent = previousPrice !== 0 ? (change / previousPrice) * 100 : 0;
  const isPositive = change >= 0;

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return { iconSize: 14, variant: 'caption' as const };
      case 'large':
        return { iconSize: 20, variant: 'body1' as const };
      default:
        return { iconSize: 16, variant: 'body2' as const };
    }
  };

  const { iconSize, variant } = getSizeStyles();

  const formatValue = () => {
    const absChange = Math.abs(change);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absChange);
  };

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.5}
      sx={{
        color: isPositive ? 'success.main' : 'error.main',
        ...sx,
      }}
    >
      <Iconify
        icon={(isPositive ? 'solar:arrow-up-outline' : 'solar:arrow-down-outline') as any}
        width={iconSize}
      />
      <Typography variant={variant} sx={{ fontWeight: 600, color: 'inherit' }}>
        {isPositive ? '+' : '-'}
        {formatValue()}
      </Typography>
      {showPercentage && (
        <Typography variant={variant} sx={{ color: 'inherit', opacity: 0.8 }}>
          ({isPositive ? '+' : ''}
          {changePercent.toFixed(2)}%)
        </Typography>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

type EntryExitPriceProps = {
  avgEntry: number;
  avgExit?: number;
  stopLoss?: number;
  currency?: string;
  sx?: SxProps<Theme>;
};

export function EntryExitPrice({
  avgEntry,
  avgExit,
  stopLoss,
  currency = 'USD',
  sx,
}: EntryExitPriceProps) {
  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);

  return (
    <Stack spacing={0.5} sx={sx}>
      <Stack direction="row" alignItems="center" spacing={1}>
        <Typography variant="caption" sx={{ color: 'text.secondary', width: 50 }}>
          Entry
        </Typography>
        <Typography variant="body2" sx={{ fontWeight: 600 }}>
          {formatPrice(avgEntry)}
        </Typography>
      </Stack>

      {avgExit !== undefined && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary', width: 50 }}>
            Exit
          </Typography>
          <Typography
            variant="body2"
            sx={{
              fontWeight: 600,
              color: avgExit >= avgEntry ? 'success.main' : 'error.main',
            }}
          >
            {formatPrice(avgExit)}
          </Typography>
        </Stack>
      )}

      {stopLoss !== undefined && (
        <Stack direction="row" alignItems="center" spacing={1}>
          <Typography variant="caption" sx={{ color: 'text.secondary', width: 50 }}>
            SL
          </Typography>
          <Typography variant="body2" sx={{ color: 'warning.main' }}>
            {formatPrice(stopLoss)}
          </Typography>
        </Stack>
      )}
    </Stack>
  );
}
