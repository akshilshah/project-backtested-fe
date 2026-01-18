import type { Trade } from 'src/types/trade';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { type Theme } from '@mui/material/styles';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { DeleteDialog } from 'src/components/form/confirm-dialog';
import { TradeStatusBadge } from 'src/components/trade/trade-status-badge';
import { ProfitLossDisplay } from 'src/components/stats/profit-loss-display';

// ----------------------------------------------------------------------

function formatDuration(durationInHours: number | null | undefined): string {
  if (!durationInHours || durationInHours <= 0) return '-';

  const hours = Math.floor(durationInHours);
  const minutes = Math.round((durationInHours - hours) * 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    if (remainingHours > 0) {
      return `${days}d ${remainingHours}h`;
    }
    return `${days}d`;
  }
  if (hours > 0) {
    if (minutes > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${hours}h`;
  }
  if (minutes > 0) return `${minutes}m`;
  return '< 1m';
}

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
}

// ----------------------------------------------------------------------

type TradesCardProps = {
  row: Trade;
  onDelete: (id: number) => void;
  onExit: (trade: Trade) => void;
  deleting?: boolean;
};

export const TradesCard = memo(function TradesCard({
  row,
  onDelete,
  onExit,
  deleting,
}: TradesCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenDelete = useCallback(() => {
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.id);
    setDeleteDialogOpen(false);
  }, [onDelete, row.id]);

  const handleExit = useCallback(() => {
    onExit(row);
  }, [onExit, row]);

  const isOpen = row.status === 'OPEN';
  const isClosed = row.status === 'CLOSED';

  return (
    <>
      <Box
        sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: (theme: Theme) =>
            theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : '#ffffff',
          border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
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
        {/* Header: Coin + Status + Actions */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1.5,
                bgcolor: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: 'white', fontWeight: 700, fontSize: '0.7rem' }}
              >
                {row.coin?.symbol?.slice(0, 3) ?? 'N/A'}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {row.coin?.symbol ?? 'N/A'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {row.strategy?.name ?? 'N/A'}
              </Typography>
            </Box>
          </Stack>

          <Stack direction="row" alignItems="center" spacing={1}>
            <TradeStatusBadge status={row.status} />
          </Stack>
        </Stack>

        {/* Info Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 1.5,
            mb: 1.5,
          }}
        >
          {/* Entry */}
          <Box>
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
              Entry
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {formatPrice(row.avgEntry)}
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
              {fDate(row.tradeDate)} {fTime(row.tradeTime)}
            </Typography>
          </Box>

          {/* Exit */}
          <Box>
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
              Exit
            </Typography>
            {row.avgExit ? (
              <>
                <Typography variant="body2" fontWeight={600}>
                  {formatPrice(row.avgExit)}
                </Typography>
                {row.exitDate && row.exitTime && (
                  <Typography variant="caption" sx={{ color: 'text.disabled', fontSize: '0.65rem' }}>
                    {fDate(row.exitDate)} {fTime(row.exitTime)}
                  </Typography>
                )}
              </>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                -
              </Typography>
            )}
          </Box>

          {/* Quantity */}
          <Box>
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
              Quantity
            </Typography>
            <Typography variant="body2" fontWeight={600}>
              {row.quantity?.toFixed(4)}
            </Typography>
          </Box>

          {/* Duration */}
          <Box>
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
              Duration
            </Typography>
            <Typography
              variant="body2"
              fontWeight={600}
              sx={{ color: isClosed ? 'text.primary' : 'text.disabled' }}
            >
              {isClosed ? formatDuration(row.duration) : '-'}
            </Typography>
          </Box>
        </Box>

        {/* P&L + Actions Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            pt: 1.5,
            borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* P&L */}
          <Box>
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
              P&L
            </Typography>
            {isClosed && row.profitLoss !== undefined ? (
              <ProfitLossDisplay
                value={row.profitLoss}
                percentage={row.profitLossPercentage}
                size="small"
                showIcon
              />
            ) : (
              <Typography variant="body2" sx={{ color: 'text.disabled' }}>
                -
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                component={RouterLink}
                href={paths.dashboard.trades.details(String(row.id))}
                size="small"
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
                <Iconify icon={'solar:eye-bold' as any} width={18} />
              </IconButton>
            </Tooltip>

            {isOpen && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    component={RouterLink}
                    href={paths.dashboard.trades.edit(String(row.id))}
                    size="small"
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

                <Tooltip title="Exit Trade">
                  <IconButton
                    size="small"
                    onClick={handleExit}
                    sx={{
                      color: 'text.secondary',
                      '&:hover': {
                        color: 'warning.main',
                        bgcolor: (theme: Theme) =>
                          theme.palette.mode === 'dark'
                            ? 'rgba(245, 158, 11, 0.12)'
                            : 'rgba(245, 158, 11, 0.08)',
                      },
                    }}
                  >
                    <Iconify icon={'solar:logout-2-bold' as any} width={18} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Tooltip title="Delete">
              <IconButton
                size="small"
                onClick={handleOpenDelete}
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'error.main',
                    bgcolor: (theme: Theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(244, 63, 94, 0.12)'
                        : 'rgba(244, 63, 94, 0.08)',
                  },
                }}
              >
                <Iconify icon={'solar:trash-bin-trash-bold' as any} width={18} />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Trade"
        itemName={`${row.coin?.symbol ?? 'Trade'} trade from ${fDate(row.tradeDate)}`}
        loading={deleting}
      />
    </>
  );
});
