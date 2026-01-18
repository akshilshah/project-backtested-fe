import type { Trade } from 'src/types/trade';

import { memo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDate, fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { PriceDisplay } from 'src/components/trade/price-display';
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

// ----------------------------------------------------------------------

type TradesTableRowProps = {
  row: Trade;
  onDelete: (id: number) => void;
  onExit: (trade: Trade) => void;
  deleting?: boolean;
};

export const TradesTableRow = memo(function TradesTableRow({ row, onDelete, onExit, deleting }: TradesTableRowProps) {
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

  return (
    <>
      <TableRow>
        {/* Coin */}
        <TableCell>
          <CoinDisplay
            symbol={row.coin?.symbol ?? 'N/A'}
            name={row.coin?.name}
            image={row.coin?.image}
            showName
            size="small"
          />
        </TableCell>

        {/* Strategy */}
        <TableCell>
          <Typography variant="body2">{row.strategy?.name ?? 'N/A'}</Typography>
        </TableCell>

        {/* Status */}
        <TableCell>
          <TradeStatusBadge status={row.status} />
        </TableCell>

        {/* Avg Entry */}
        <TableCell>
          <Stack spacing={0.25}>
            <PriceDisplay value={row.avgEntry} size="small" />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {fDate(row.tradeDate)} {fTime(row.tradeTime)}
            </Typography>
          </Stack>
        </TableCell>

        {/* Avg Exit */}
        <TableCell>
          {row.avgExit ? (
            <Stack spacing={0.25}>
              <PriceDisplay value={row.avgExit} size="small" />
              {row.exitDate && row.exitTime && (
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  {fDate(row.exitDate)} {fTime(row.exitTime)}
                </Typography>
              )}
            </Stack>
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              -
            </Typography>
          )}
        </TableCell>

        {/* Quantity */}
        <TableCell>
          <Typography variant="body2">{row.quantity?.toFixed(4)}</Typography>
        </TableCell>

        {/* Duration */}
        <TableCell>
          <Typography variant="body2" sx={{ color: row.status === 'CLOSED' ? 'text.primary' : 'text.disabled' }}>
            {row.status === 'CLOSED' ? formatDuration(row.duration) : '-'}
          </Typography>
        </TableCell>

        {/* P&L */}
        <TableCell>
          {row.status === 'CLOSED' && row.profitLoss !== undefined ? (
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
        </TableCell>

        {/* Actions */}
        <TableCell align="right">
          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                component={RouterLink}
                href={paths.dashboard.trades.details(String(row.id))}
                size="small"
                sx={{
                  color: 'text.secondary',
                  '&:hover': {
                    color: 'primary.main',
                    bgcolor: (theme) =>
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
                        bgcolor: (theme) =>
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
                        bgcolor: (theme) =>
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
                    bgcolor: (theme) =>
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
        </TableCell>
      </TableRow>

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
