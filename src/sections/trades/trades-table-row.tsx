import type { Trade } from 'src/types/trade';

import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
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

type TradesTableRowProps = {
  row: Trade;
  onDelete: (id: string) => void;
  onExit: (trade: Trade) => void;
  deleting?: boolean;
};

export function TradesTableRow({ row, onDelete, onExit, deleting }: TradesTableRowProps) {
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
      <TableRow hover>
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

        {/* Date */}
        <TableCell>
          <Stack>
            <Typography variant="body2">{fDate(row.tradeDate)}</Typography>
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {row.tradeTime}
            </Typography>
          </Stack>
        </TableCell>

        {/* Entry Price */}
        <TableCell>
          <PriceDisplay value={row.entryPrice} size="small" />
        </TableCell>

        {/* Exit Price */}
        <TableCell>
          {row.exitPrice ? (
            <PriceDisplay value={row.exitPrice} size="small" />
          ) : (
            <Typography variant="body2" sx={{ color: 'text.disabled' }}>
              -
            </Typography>
          )}
        </TableCell>

        {/* Quantity */}
        <TableCell>
          <Typography variant="body2">{row.quantity}</Typography>
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
                href={paths.dashboard.trades.details(row.id)}
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
                    href={paths.dashboard.trades.edit(row.id)}
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
}
