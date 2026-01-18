import type { Strategy } from 'src/types/strategy';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { type Theme } from '@mui/material/styles';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

type StrategiesCardProps = {
  row: Strategy;
  onDelete: (strategy: Strategy) => void;
  onEdit: (strategy: Strategy) => void;
  deleting?: boolean;
};

export const StrategiesCard = memo(function StrategiesCard({
  row,
  onDelete,
  onEdit,
  deleting,
}: StrategiesCardProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const handleOpenDelete = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setDeleteDialogOpen(true);
  }, []);

  const handleCloseDelete = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row);
    setDeleteDialogOpen(false);
  }, [onDelete, row]);

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
        {/* Header: Name + Actions */}
        <Stack direction="row" alignItems="flex-start" justifyContent="space-between" sx={{ mb: 1.5 }}>
          <Box sx={{ flex: 1, minWidth: 0, mr: 1 }}>
            <Typography variant="subtitle1" fontWeight={600} noWrap>
              {row.name}
            </Typography>
            {row.description && (
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
                {row.description}
              </Typography>
            )}
          </Box>

          {/* Actions */}
          <Stack direction="row" spacing={0.5} sx={{ flexShrink: 0 }}>
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

        {/* Rules Grid */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 1,
            mb: 1.5,
          }}
        >
          {/* Entry Rule */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
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
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                color: row.entryRule ? 'text.primary' : 'text.disabled',
                fontSize: '0.75rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {row.entryRule || '-'}
            </Typography>
          </Box>

          {/* Exit Rule */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
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
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                color: row.exitRule ? 'text.primary' : 'text.disabled',
                fontSize: '0.75rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {row.exitRule || '-'}
            </Typography>
          </Box>

          {/* Stop Loss Rule */}
          <Box
            sx={{
              p: 1.5,
              borderRadius: 1.5,
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.04)'
                  : 'rgba(0, 0, 0, 0.02)',
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
              Stop Loss
            </Typography>
            <Typography
              variant="body2"
              fontWeight={500}
              sx={{
                color: row.stopLossRule ? 'text.primary' : 'text.disabled',
                fontSize: '0.75rem',
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
              }}
            >
              {row.stopLossRule || '-'}
            </Typography>
          </Box>
        </Box>

        {/* Footer: Updated Date */}
        <Box
          sx={{
            pt: 1.5,
            borderTop: (theme: Theme) => `1px solid ${theme.palette.divider}`,
          }}
        >
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Updated {fDateTime(row.updatedAt)}
          </Typography>
        </Box>
      </Box>

      <DeleteDialog
        open={deleteDialogOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        title="Delete Strategy"
        itemName={row.name}
        loading={deleting}
      />
    </>
  );
});
