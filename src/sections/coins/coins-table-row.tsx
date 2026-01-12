import type { Coin } from 'src/types/coin';

import { usePopover } from 'minimal-shared/hooks';
import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

type CoinsTableRowProps = {
  row: Coin;
  onDelete: (id: number) => void;
  onEdit: (coin: Coin) => void;
  deleting?: boolean;
};

export const CoinsTableRow = memo(function CoinsTableRow({ row, onDelete, onEdit, deleting }: CoinsTableRowProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const popover = usePopover();

  const handleOpenDelete = useCallback(() => {
    setDeleteDialogOpen(true);
    popover.onClose();
  }, [popover]);

  const handleCloseDelete = useCallback(() => {
    setDeleteDialogOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(row.id);
    setDeleteDialogOpen(false);
  }, [onDelete, row.id]);

  const handleEdit = useCallback(() => {
    onEdit(row);
    popover.onClose();
  }, [onEdit, row, popover]);

  const handleRowClick = useCallback(() => {
    onEdit(row);
  }, [onEdit, row]);

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={handleRowClick}>
        <TableCell>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'primary.lighter',
                color: 'primary.main',
                fontWeight: 700,
                fontSize: '0.875rem',
              }}
            >
              {row.symbol?.slice(0, 2).toUpperCase() || '--'}
            </Box>
            <Box>
              <Typography variant="subtitle2" noWrap>
                {row.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {row.symbol || 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {row.symbol || 'N/A'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fDateTime(row.createdAt)}
          </Typography>
        </TableCell>

        <TableCell align="right" onClick={(e) => e.stopPropagation()}>
          <IconButton onClick={popover.onOpen}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <CustomPopover
        open={popover.open}
        anchorEl={popover.anchorEl}
        onClose={popover.onClose}
        slotProps={{ arrow: { placement: 'right-top' } }}
      >
        <MenuItem onClick={handleEdit}>
          <Iconify icon="solar:pen-bold" />
          Edit
        </MenuItem>

        <MenuItem onClick={handleOpenDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>

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
