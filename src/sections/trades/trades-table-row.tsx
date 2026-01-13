import type { Trade } from 'src/types/trade';

import { memo, useState, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

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

type TradesTableRowProps = {
  row: Trade;
  onDelete: (id: number) => void;
  onExit: (trade: Trade) => void;
  deleting?: boolean;
};

export const TradesTableRow = memo(function TradesTableRow({ row, onDelete, onExit, deleting }: TradesTableRowProps) {
  const theme = useTheme();
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
              >
                <Iconify icon={'solar:eye-bold' as any} width={20} />
              </IconButton>
            </Tooltip>

            {isOpen && (
              <>
                <Tooltip title="Edit">
                  <IconButton
                    component={RouterLink}
                    href={paths.dashboard.trades.edit(String(row.id))}
                    size="small"
                  >
                    <Iconify icon={'solar:pen-bold' as any} width={20} />
                  </IconButton>
                </Tooltip>

                <Tooltip title="Exit Trade">
                  <IconButton size="small" color="warning" onClick={handleExit}>
                    <Iconify icon={'solar:logout-2-bold' as any} width={20} />
                  </IconButton>
                </Tooltip>
              </>
            )}

            <Tooltip title="Delete">
              <IconButton size="small" color="error" onClick={handleOpenDelete}>
                <Iconify icon={'solar:trash-bin-trash-bold' as any} width={20} />
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
