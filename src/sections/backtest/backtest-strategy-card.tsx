import type { Strategy } from 'src/types/strategy';
import type { BacktestAnalytics } from 'src/types/backtest';

import { memo } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { type Theme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BacktestStrategyCardProps = {
  strategy: Strategy;
  analytics: BacktestAnalytics | null;
  onClick: (strategyId: number) => void;
  onEditNotes: (strategy: Strategy, event: React.MouseEvent) => void;
};

export const BacktestStrategyCard = memo(function BacktestStrategyCard({
  strategy,
  analytics,
  onClick,
  onEditNotes,
}: BacktestStrategyCardProps) {
  const totalTrades = analytics?.totalTrades ?? 0;
  const winRate = analytics?.winPercentage ?? 0;
  const ev = analytics?.ev ?? 0;

  const handleClick = () => {
    onClick(strategy.id);
  };

  const handleEditNotes = (event: React.MouseEvent) => {
    event.stopPropagation();
    onEditNotes(strategy, event);
  };

  return (
    <Box
      onClick={handleClick}
      sx={{
        p: 2,
        borderRadius: 2,
        bgcolor: (theme: Theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
        border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
        cursor: 'pointer',
        transition: 'all 0.2s',
        '&:hover': {
          borderColor: 'primary.main',
          bgcolor: (theme: Theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.04)'
              : 'rgba(99, 102, 241, 0.02)',
        },
      }}
    >
      {/* Header: Strategy Name + Actions */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar
            sx={{
              width: 40,
              height: 40,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            {strategy.name.charAt(0).toUpperCase()}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={600}>
              {strategy.name}
            </Typography>
            {strategy.notes && (
              <Typography
                variant="caption"
                sx={{
                  color: 'text.secondary',
                  display: '-webkit-box',
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}
              >
                {strategy.notes}
              </Typography>
            )}
          </Box>
        </Stack>

        <Tooltip title="Edit Notes">
          <IconButton
            size="small"
            onClick={handleEditNotes}
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                bgcolor: (theme: Theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.12)'
                    : 'rgba(99, 102, 241, 0.08)',
              },
            }}
          >
            <Iconify icon={'solar:pen-bold' as any} width={18} />
          </IconButton>
        </Tooltip>
      </Stack>

      {/* Stats Grid */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: 1,
        }}
      >
        {/* Trades */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme: Theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 0.25,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.6rem',
            }}
          >
            Trades
          </Typography>
          <Typography variant="subtitle2" fontWeight={600}>
            {totalTrades > 0 ? totalTrades : '—'}
          </Typography>
        </Box>

        {/* Win Rate */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme: Theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 0.25,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.6rem',
            }}
          >
            Win Rate
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              color:
                totalTrades > 0
                  ? winRate >= 0.5
                    ? 'success.main'
                    : 'text.primary'
                  : 'text.disabled',
            }}
          >
            {totalTrades > 0 ? `${(winRate * 100).toFixed(0)}%` : '—'}
          </Typography>
        </Box>

        {/* EV */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme: Theme) =>
              totalTrades > 0
                ? ev >= 0
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(34, 197, 94, 0.12)'
                    : 'rgba(34, 197, 94, 0.08)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(239, 68, 68, 0.12)'
                    : 'rgba(239, 68, 68, 0.08)'
                : theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 0.25,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.6rem',
            }}
          >
            EV
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              color:
                totalTrades > 0
                  ? ev >= 0
                    ? 'success.main'
                    : 'error.main'
                  : 'text.disabled',
            }}
          >
            {totalTrades > 0 ? `${ev >= 0 ? '+' : ''}${ev.toFixed(2)}` : '—'}
          </Typography>
        </Box>

        {/* Days to 100 */}
        <Box
          sx={{
            p: 1.5,
            borderRadius: 1.5,
            bgcolor: (theme: Theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
            textAlign: 'center',
          }}
        >
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              display: 'block',
              mb: 0.25,
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.6rem',
            }}
          >
            D_100T
          </Typography>
          <Typography
            variant="subtitle2"
            fontWeight={600}
            sx={{
              color: analytics?.daysTo100Trades ? 'text.primary' : 'text.disabled',
            }}
          >
            {analytics?.daysTo100Trades ? `${analytics.daysTo100Trades}d` : '—'}
          </Typography>
        </Box>
      </Box>
    </Box>
  );
});
