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
  index: number;
  onEdit: (trade: BacktestTrade) => void;
  onDelete: (id: number) => void;
  deleting?: boolean;
};

export const BacktestTradesTableRow = memo(function BacktestTradesTableRow({
  row,
  index,
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
            {index}
          </Typography>
        </TableCell>

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

        {/* Direction */}
        <TableCell>
          <Chip
            label={row.direction}
            size="small"
            sx={{
              bgcolor: (theme) =>
                row.direction === 'Long'
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(16, 185, 129, 0.12)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(244, 63, 94, 0.16)'
                    : 'rgba(244, 63, 94, 0.12)',
              color: row.direction === 'Long' ? 'success.main' : 'error.main',
              fontWeight: 600,
              fontSize: '0.6875rem',
              border: (theme) =>
                `1px solid ${row.direction === 'Long' ? theme.palette.success.main : theme.palette.error.main}`,
              borderColor: (theme) =>
                row.direction === 'Long'
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(16, 185, 129, 0.3)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(244, 63, 94, 0.4)'
                    : 'rgba(244, 63, 94, 0.3)',
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
              px: 1.25,
              py: 0.375,
              borderRadius: 1,
              bgcolor: (theme) =>
                row.rValue >= 0
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(16, 185, 129, 0.1)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(244, 63, 94, 0.16)'
                    : 'rgba(244, 63, 94, 0.1)',
              border: (theme) =>
                `1px solid ${
                  row.rValue >= 0
                    ? theme.palette.mode === 'dark'
                      ? 'rgba(16, 185, 129, 0.3)'
                      : 'rgba(16, 185, 129, 0.25)'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(244, 63, 94, 0.3)'
                      : 'rgba(244, 63, 94, 0.25)'
                }`,
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: 600,
                fontVariantNumeric: 'tabular-nums',
                color: row.rValue >= 0 ? 'success.main' : 'error.main',
                fontSize: '0.8125rem',
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
              <IconButton
                size="small"
                onClick={handleEdit}
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
        title="Delete Backtest Trade"
        itemName={`${row.coin?.symbol ?? 'Trade'} from ${fDate(row.tradeDate)}`}
        loading={deleting}
      />
    </>
  );
});
