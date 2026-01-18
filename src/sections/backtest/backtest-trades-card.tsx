import type { BacktestTrade } from 'src/types/backtest';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { type Theme } from '@mui/material/styles';

import { fDate, fTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

function formatPrice(value: number | null | undefined): string {
  if (value === null || value === undefined) return '-';
  return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
}

// ----------------------------------------------------------------------

type BacktestTradesCardProps = {
  row: BacktestTrade;
  index: number;
  onEdit: (trade: BacktestTrade) => void;
  onDelete: (id: number) => void;
  deleting?: boolean;
};

export const BacktestTradesCard = memo(function BacktestTradesCard({
  row,
  index,
  onEdit,
  onDelete,
  deleting,
}: BacktestTradesCardProps) {
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

  const isLong = row.direction === 'Long';
  const isWin = row.rValue >= 0;

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
        {/* Header: # + Coin + Direction */}
        <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box
              sx={{
                width: 32,
                height: 32,
                borderRadius: 1,
                bgcolor: (theme: Theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                #{index}
              </Typography>
            </Box>
            <Box>
              <Typography variant="subtitle2" fontWeight={600}>
                {row.coin?.symbol ?? 'N/A'}
              </Typography>
              <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                {fDate(row.tradeDate)} {fTime(row.tradeTime)}
              </Typography>
            </Box>
          </Stack>

          <Chip
            label={row.direction}
            size="small"
            sx={{
              bgcolor: (theme: Theme) =>
                isLong
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(16, 185, 129, 0.12)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(244, 63, 94, 0.16)'
                    : 'rgba(244, 63, 94, 0.12)',
              color: isLong ? 'success.main' : 'error.main',
              fontWeight: 600,
              fontSize: '0.6875rem',
              borderColor: (theme: Theme) =>
                isLong
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(16, 185, 129, 0.4)'
                    : 'rgba(16, 185, 129, 0.3)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(244, 63, 94, 0.4)'
                    : 'rgba(244, 63, 94, 0.3)',
              border: 1,
            }}
          />
        </Stack>

        {/* Price Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            mb: 1.5,
          }}
        >
          {/* Entry */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
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
              Entry
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
              {formatPrice(row.entry)}
            </Typography>
          </Box>

          {/* Stop Loss */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
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
              SL
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
              {formatPrice(row.stopLoss)}
            </Typography>
          </Box>

          {/* Exit */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
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
              Exit
            </Typography>
            <Typography variant="subtitle2" fontWeight={600} sx={{ fontSize: '0.75rem' }}>
              {formatPrice(row.exit)}
            </Typography>
          </Box>
        </Box>

        {/* R Value + Actions Row */}
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            pt: 1.5,
            borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          {/* R Value */}
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              px: 1.5,
              py: 0.5,
              borderRadius: 1,
              bgcolor: (theme: Theme) =>
                isWin
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(16, 185, 129, 0.16)'
                    : 'rgba(16, 185, 129, 0.1)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(244, 63, 94, 0.16)'
                    : 'rgba(244, 63, 94, 0.1)',
              border: (theme: Theme) =>
                `1px solid ${
                  isWin
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
                fontWeight: 700,
                fontVariantNumeric: 'tabular-nums',
                color: isWin ? 'success.main' : 'error.main',
              }}
            >
              {isWin ? '+' : ''}
              {row.rValue.toFixed(2)}R
            </Typography>
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={0.5}>
            <Tooltip title="Edit">
              <IconButton
                size="small"
                onClick={handleEdit}
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
        title="Delete Backtest Trade"
        itemName={`${row.coin?.symbol ?? 'Trade'} from ${fDate(row.tradeDate)}`}
        loading={deleting}
      />
    </>
  );
});
