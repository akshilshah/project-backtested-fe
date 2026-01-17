import type { BacktestTrade } from 'src/types/backtest';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDate, fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { PriceDisplay } from 'src/components/trade/price-display';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

type BacktestTradesTableRowProps = {
  row: BacktestTrade;
  onEdit: (trade: BacktestTrade) => void;
  onDelete: (id: number) => void;
  deleting?: boolean;
};

export const BacktestTradesTableRow = memo(function BacktestTradesTableRow({
  row,
  onEdit,
  onDelete,
  deleting,
}: BacktestTradesTableRowProps) {
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

  const handleEdit = useCallback(() => {
    onEdit(row);
  }, [onEdit, row]);

  return (
    <>
      <TableRow>
        {/* # */}
        <TableCell>
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {row.id}
          </Typography>
        </TableCell>

        {/* Coin */}
        <TableCell>
          <CoinDisplay
            symbol={row.coin?.symbol ?? 'N/A'}
            name={row.coin?.name}
            showName
            size="small"
          />
        </TableCell>

        {/* Direction */}
        <TableCell>
          <Chip
            label={row.direction}
            size="small"
            sx={{
              bgcolor: row.direction === 'Long' ? 'success.lighter' : 'error.lighter',
              color: row.direction === 'Long' ? 'success.dark' : 'error.dark',
              fontWeight: 700,
              fontSize: '0.6875rem',
            }}
          />
        </TableCell>

        {/* Entry */}
        <TableCell>
          <Stack spacing={0.25}>
            <PriceDisplay value={row.entry} size="small" />
            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
              {fDate(row.tradeDate)} {fTime(row.tradeTime)}
            </Typography>
          </Stack>
        </TableCell>

        {/* Stop Loss */}
        <TableCell>
          <PriceDisplay value={row.stopLoss} size="small" />
        </TableCell>

        {/* Exit */}
        <TableCell>
          <PriceDisplay value={row.exit} size="small" />
        </TableCell>

        {/* R+/- */}
        <TableCell align="right">
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: row.rValue >= 0 ? 'success.lighter' : 'error.lighter',
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: row.rValue >= 0 ? 'success.dark' : 'error.dark',
              }}
            >
              {row.rValue >= 0 ? '+' : ''}
              {row.rValue.toFixed(2)}R
            </Typography>
          </Box>
        </TableCell>

        {/* Actions */}
        <TableCell align="right">
          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton size="small" onClick={handleEdit}>
                <Iconify icon={'solar:pen-bold' as any} width={20} />
              </IconButton>
            </Tooltip>

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
        title="Delete Backtest Trade"
        itemName={`${row.coin?.symbol ?? 'Trade'} from ${fDate(row.tradeDate)}`}
        loading={deleting}
      />
    </>
  );
});
