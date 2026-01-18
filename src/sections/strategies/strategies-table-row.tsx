import type { Strategy } from 'src/types/strategy';

import { memo, useCallback } from 'react';
import { usePopover } from 'minimal-shared/hooks';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type StrategiesTableRowProps = {
  row: Strategy;
  onDelete: (strategy: Strategy) => void;
  onEdit: (strategy: Strategy) => void;
};

export const StrategiesTableRow = memo(function StrategiesTableRow({ row, onDelete, onEdit }: StrategiesTableRowProps) {
  const popover = usePopover();

  const handleEdit = useCallback(() => {
    onEdit(row);
    popover.onClose();
  }, [onEdit, row, popover]);

  const handleRowClick = useCallback(() => {
    onEdit(row);
  }, [onEdit, row]);

  const handleDelete = useCallback(() => {
    onDelete(row);
    popover.onClose();
  }, [onDelete, row, popover]);

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={handleRowClick}>
        <TableCell>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2" noWrap>
              {row.name}
            </Typography>
            {row.description && (
              <Typography variant="caption" sx={{ color: 'text.secondary' }} noWrap>
                {row.description}
              </Typography>
            )}
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {row.entryRule || '-'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {row.exitRule || '-'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }} noWrap>
            {row.stopLossRule || '-'}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fDateTime(row.updatedAt)}
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

        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <Iconify icon="solar:trash-bin-trash-bold" />
          Delete
        </MenuItem>
      </CustomPopover>
    </>
  );
});
