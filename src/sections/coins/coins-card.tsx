import type { Coin } from 'src/types/coin';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { type Theme } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import { S3_ASSETS_BASE_URL } from 'src/lib/api-endpoints';

import { Iconify } from 'src/components/iconify';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

type CoinsCardProps = {
  row: Coin;
  onDelete: (id: number) => void;
  onEdit: (coin: Coin) => void;
  deleting?: boolean;
};

export const CoinsCard = memo(function CoinsCard({
  row,
  onDelete,
  onEdit,
  deleting,
}: CoinsCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.id);
    setDeleteDialogOpen(false);
  }, [onDelete, row.id]);

  const handleEdit = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit(row);
  }, [onEdit, row]);

  const handleCardClick = useCallback(() => {
    onEdit(row);
  }, [onEdit, row]);

  return (
    <>
      <Box
        onClick={handleCardClick}
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
        {/* Header: Avatar + Name + Actions */}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Avatar
              src={row.image ? `${S3_ASSETS_BASE_URL}/${row.image}` : undefined}
              alt={row.symbol}
              sx={{
                width: 44,
                height: 44,
                borderRadius: 1.5,
                bgcolor: (theme: Theme) =>
                  row.image
                    ? 'transparent'
                    : theme.palette.mode === 'dark'
                      ? 'rgba(99, 102, 241, 0.16)'
                      : 'rgba(99, 102, 241, 0.1)',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              {!row.image && (row.symbol?.slice(0, 2).toUpperCase() || '--')}
            </Avatar>
            <Box>
              <Typography variant="subtitle1" fontWeight={600}>
                {row.name}
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography
                  variant="caption"
                  sx={{
                    fontFamily: 'monospace',
                    color: 'text.secondary',
                    bgcolor: (theme: Theme) =>
                      theme.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.06)'
                        : 'rgba(0, 0, 0, 0.04)',
                    px: 0.75,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontWeight: 500,
                  }}
                >
                  {row.symbol || 'N/A'}
                </Typography>
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {fDateTime(row.createdAt)}
                </Typography>
              </Stack>
            </Box>
          </Stack>

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
        title="Delete Coin"
        itemName={row.name}
        loading={deleting}
      />
    </>
  );
});
