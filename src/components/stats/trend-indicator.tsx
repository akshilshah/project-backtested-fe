import type { Theme, SxProps } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TrendIndicatorProps = {
  value: number;
  direction?: 'up' | 'down' | 'auto';
  label?: string;
  format?: 'percent' | 'number';
  positiveColor?: string;
  negativeColor?: string;
  neutralColor?: string;
  showIcon?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
};

export function TrendIndicator({
  value,
  direction = 'auto',
  label,
  format = 'percent',
  positiveColor = 'success.main',
  negativeColor = 'error.main',
  neutralColor = 'text.secondary',
  showIcon = true,
  size = 'medium',
  sx,
}: TrendIndicatorProps) {
  const getDirection = (): 'up' | 'down' | 'neutral' => {
    if (direction === 'auto') {
      if (value > 0) return 'up';
      if (value < 0) return 'down';
      return 'neutral';
    }
    if (value === 0) return 'neutral';
    return direction;
  };

  const actualDirection = getDirection();

  const getColor = () => {
    switch (actualDirection) {
      case 'up':
        return positiveColor;
      case 'down':
        return negativeColor;
      default:
        return neutralColor;
    }
  };

  const getIcon = () => {
    switch (actualDirection) {
      case 'up':
        return 'solar:arrow-up-outline';
      case 'down':
        return 'solar:arrow-down-outline';
      default:
        return 'solar:minus-outline';
    }
  };

  const formatValue = () => {
    const absValue = Math.abs(value);
    const prefix = value > 0 ? '+' : value < 0 ? '-' : '';

    if (format === 'percent') {
      return `${prefix}${absValue.toFixed(1)}%`;
    }
    return `${prefix}${absValue.toLocaleString()}`;
  };

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
  const color = getColor();

  return (
    <Stack direction="row" alignItems="center" spacing={0.5} sx={{ color, ...sx }}>
      {showIcon && <Iconify icon={getIcon() as any} width={iconSize} />}

      <Typography variant={variant} sx={{ fontWeight: 600, color: 'inherit' }}>
        {formatValue()}
      </Typography>

      {label && (
        <Typography variant={variant} sx={{ color: 'text.secondary', fontWeight: 400 }}>
          {label}
        </Typography>
      )}
    </Stack>
  );
}
