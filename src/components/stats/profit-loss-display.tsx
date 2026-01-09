import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type ProfitLossDisplayProps = {
  value: number;
  percentage?: number;
  currency?: string;
  showIcon?: boolean;
  showSign?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'text' | 'filled' | 'outlined';
  sx?: SxProps<Theme>;
};

export function ProfitLossDisplay({
  value,
  percentage,
  currency = 'USD',
  showIcon = false,
  showSign = true,
  size = 'medium',
  variant = 'text',
  sx,
}: ProfitLossDisplayProps) {
  const isProfit = value >= 0;
  const isZero = value === 0;

  const getColor = () => {
    if (isZero) return 'text.secondary';
    return isProfit ? 'success.main' : 'error.main';
  };

  const getBgColor = () => {
    if (variant !== 'filled') return undefined;
    if (isZero) return 'action.hover';
    return isProfit ? 'success.lighter' : 'error.lighter';
  };

  const getBorderColor = () => {
    if (variant !== 'outlined') return undefined;
    if (isZero) return 'divider';
    return isProfit ? 'success.main' : 'error.main';
  };

  const formatCurrency = (val: number) => {
    const absValue = Math.abs(val);
    const formatted = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(absValue);

    if (!showSign || isZero) return formatted;
    return isProfit ? `+${formatted}` : `-${formatted}`;
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          iconSize: 14,
          valueVariant: 'body2' as const,
          percentVariant: 'caption' as const,
          padding: variant !== 'text' ? '2px 6px' : undefined,
        };
      case 'large':
        return {
          iconSize: 22,
          valueVariant: 'h6' as const,
          percentVariant: 'body2' as const,
          padding: variant !== 'text' ? '6px 12px' : undefined,
        };
      default:
        return {
          iconSize: 18,
          valueVariant: 'subtitle1' as const,
          percentVariant: 'body2' as const,
          padding: variant !== 'text' ? '4px 8px' : undefined,
        };
    }
  };

  const { iconSize, valueVariant, percentVariant, padding } = getSizeStyles();
  const color = getColor();

  return (
    <Stack
      direction="row"
      alignItems="center"
      spacing={0.75}
      sx={{
        color,
        padding,
        borderRadius: 1,
        bgcolor: getBgColor(),
        border: variant === 'outlined' ? 1 : undefined,
        borderColor: getBorderColor(),
        display: 'inline-flex',
        ...sx,
      }}
    >
      {showIcon && !isZero && (
        <Iconify
          icon={(isProfit ? 'solar:arrow-up-outline' : 'solar:arrow-down-outline') as any}
          width={iconSize}
        />
      )}

      <Typography variant={valueVariant} sx={{ fontWeight: 600, color: 'inherit' }}>
        {formatCurrency(value)}
      </Typography>

      {percentage !== undefined && (
        <Typography
          variant={percentVariant}
          sx={{
            color: 'inherit',
            opacity: 0.8,
          }}
        >
          ({percentage >= 0 ? '+' : ''}
          {percentage.toFixed(2)}%)
        </Typography>
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

type ProfitLossBadgeProps = {
  value: number;
  sx?: SxProps<Theme>;
};

export function ProfitLossBadge({ value, sx }: ProfitLossBadgeProps) {
  const isProfit = value >= 0;
  const isZero = value === 0;

  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 0.75,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        bgcolor: isZero ? 'action.hover' : isProfit ? 'success.lighter' : 'error.lighter',
        color: isZero ? 'text.secondary' : isProfit ? 'success.dark' : 'error.dark',
        ...sx,
      }}
    >
      {!isZero && (
        <Iconify
          icon={(isProfit ? 'solar:arrow-up-outline' : 'solar:arrow-down-outline') as any}
          width={14}
        />
      )}
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {value >= 0 ? '+' : ''}
        {value.toFixed(2)}%
      </Typography>
    </Box>
  );
}
