import type { Theme, SxProps } from '@mui/material/styles';
import type { TradeStatus } from 'src/types/trade';
import type { LabelColor } from 'src/components/label';

import { Label } from 'src/components/label';

// ----------------------------------------------------------------------

type TradeStatusBadgeProps = {
  status: TradeStatus;
  variant?: 'filled' | 'outlined' | 'soft' | 'inverted';
  sx?: SxProps<Theme>;
};

export function TradeStatusBadge({
  status,
  variant = 'soft',
  sx,
}: TradeStatusBadgeProps) {
  const getColor = (): LabelColor => {
    switch (status) {
      case 'OPEN':
        return 'info';
      case 'CLOSED':
        return 'success';
      default:
        return 'default';
    }
  };

  const getLabel = () => {
    switch (status) {
      case 'OPEN':
        return 'Open';
      case 'CLOSED':
        return 'Closed';
      default:
        return status;
    }
  };

  return (
    <Label color={getColor()} variant={variant} sx={sx}>
      {getLabel()}
    </Label>
  );
}

// ----------------------------------------------------------------------

type TradeResultBadgeProps = {
  profitLoss: number;
  variant?: 'filled' | 'outlined' | 'soft' | 'inverted';
  sx?: SxProps<Theme>;
};

export function TradeResultBadge({
  profitLoss,
  variant = 'soft',
  sx,
}: TradeResultBadgeProps) {
  const isProfit = profitLoss > 0;
  const isLoss = profitLoss < 0;

  const getColor = (): LabelColor => {
    if (isProfit) return 'success';
    if (isLoss) return 'error';
    return 'default';
  };

  const getLabel = () => {
    if (isProfit) return 'Profit';
    if (isLoss) return 'Loss';
    return 'Break Even';
  };

  return (
    <Label color={getColor()} variant={variant} sx={sx}>
      {getLabel()}
    </Label>
  );
}
