import type { Trade } from 'src/types/trade';
import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { useTheme } from '@mui/material/styles';

import { fDate, fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

import { CoinDisplay } from './coin-display';
import { TradeStatusBadge } from './trade-status-badge';
import { ProfitLossDisplay } from '../stats/profit-loss-display';

// ----------------------------------------------------------------------

type TradeCardProps = {
  trade: Trade;
  onView?: () => void;
  onEdit?: () => void;
  onExit?: () => void;
  onDelete?: () => void;
  sx?: SxProps<Theme>;
};

export function TradeCard({
  trade,
  onView,
  onEdit,
  onExit,
  onDelete,
  sx,
}: TradeCardProps) {
  const theme = useTheme();
  const {
    coin,
    strategy,
    status,
    tradeDate,
    tradeTime,
    entryPrice,
    exitPrice,
    profitLoss,
    profitLossPercentage,
    quantity,
  } = trade;

  const isOpen = status === 'OPEN';
  const isClosed = status === 'CLOSED';

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 8,
    }).format(value);

  return (
    <Card
      sx={{
        p: 2.5,
        cursor: onView ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: theme.shadows[8],
        },
        ...sx,
      }}
      onClick={onView}
    >
      <Stack spacing={2}>
        {/* Header */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            {coin && <CoinDisplay symbol={coin.symbol} name={coin.name} showName />}
            <TradeStatusBadge status={status} />
          </Stack>

          <Stack direction="row" spacing={0.5}>
            {onView && (
              <IconButton size="small" onClick={onView}>
                <Iconify icon="solar:eye-bold" width={18} />
              </IconButton>
            )}
            {isOpen && onEdit && (
              <IconButton size="small" onClick={onEdit}>
                <Iconify icon="solar:pen-bold" width={18} />
              </IconButton>
            )}
            {isOpen && onExit && (
              <IconButton size="small" color="success" onClick={onExit}>
                <Iconify icon="solar:export-bold" width={18} />
              </IconButton>
            )}
            {onDelete && (
              <IconButton size="small" color="error" onClick={onDelete}>
                <Iconify icon="solar:trash-bin-trash-bold" width={18} />
              </IconButton>
            )}
          </Stack>
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        {/* Trade Details */}
        <Stack direction="row" spacing={3}>
          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Entry Price
            </Typography>
            <Typography variant="subtitle2">{formatPrice(entryPrice)}</Typography>
          </Box>

          {isClosed && exitPrice !== undefined && (
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
                Exit Price
              </Typography>
              <Typography variant="subtitle2">{formatPrice(exitPrice)}</Typography>
            </Box>
          )}

          <Box sx={{ flex: 1 }}>
            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
              Quantity
            </Typography>
            <Typography variant="subtitle2">{quantity.toLocaleString()}</Typography>
          </Box>
        </Stack>

        {/* Footer */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack spacing={0.5}>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {fDate(tradeDate)} at {tradeTime ? fTime(`2000-01-01T${tradeTime}`) : '--'}
            </Typography>
            {strategy && (
              <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                Strategy: {strategy.name}
              </Typography>
            )}
          </Stack>

          {isClosed && profitLoss !== undefined && (
            <ProfitLossDisplay
              value={profitLoss}
              percentage={profitLossPercentage}
              size="medium"
              variant="filled"
            />
          )}
        </Stack>
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type TradeCardSkeletonProps = {
  sx?: SxProps<Theme>;
};

export function TradeCardSkeleton({ sx }: TradeCardSkeletonProps) {
  return (
    <Card sx={{ p: 2.5, ...sx }}>
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'action.hover',
              }}
            />
            <Box>
              <Box sx={{ width: 60, height: 16, bgcolor: 'action.hover', borderRadius: 0.5, mb: 0.5 }} />
              <Box sx={{ width: 80, height: 12, bgcolor: 'action.hover', borderRadius: 0.5 }} />
            </Box>
          </Stack>
          <Box sx={{ width: 50, height: 22, bgcolor: 'action.hover', borderRadius: 0.75 }} />
        </Stack>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Stack direction="row" spacing={3}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ flex: 1 }}>
              <Box sx={{ width: 60, height: 12, bgcolor: 'action.hover', borderRadius: 0.5, mb: 0.5 }} />
              <Box sx={{ width: 80, height: 18, bgcolor: 'action.hover', borderRadius: 0.5 }} />
            </Box>
          ))}
        </Stack>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Box>
            <Box sx={{ width: 100, height: 12, bgcolor: 'action.hover', borderRadius: 0.5, mb: 0.5 }} />
            <Box sx={{ width: 120, height: 12, bgcolor: 'action.hover', borderRadius: 0.5 }} />
          </Box>
          <Box sx={{ width: 80, height: 28, bgcolor: 'action.hover', borderRadius: 0.75 }} />
        </Stack>
      </Stack>
    </Card>
  );
}
