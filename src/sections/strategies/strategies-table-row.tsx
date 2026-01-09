import type { Strategy } from 'src/types/strategy';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { paths } from 'src/routes/paths';

import { usePopover } from 'minimal-shared/hooks';

import { Iconify } from 'src/components/iconify';
import { CustomPopover } from 'src/components/custom-popover';

// ----------------------------------------------------------------------

type StrategiesTableRowProps = {
  row: Strategy;
  onDelete: (strategy: Strategy) => void;
};

export const StrategiesTableRow = memo(function StrategiesTableRow({ row, onDelete }: StrategiesTableRowProps) {
  const router = useRouter();
  const popover = usePopover();

  const handleViewDetails = useCallback(() => {
    router.push(paths.dashboard.strategies.details(row.id));
  }, [router, row.id]);

  const handleEdit = useCallback(() => {
    router.push(paths.dashboard.strategies.edit(row.id));
    popover.onClose();
  }, [router, row.id, popover]);

  const handleDelete = useCallback(() => {
    onDelete(row);
    popover.onClose();
  }, [onDelete, row, popover]);

  const hasRules = row.rules && Object.keys(row.rules).length > 0;

  return (
    <>
      <TableRow hover sx={{ cursor: 'pointer' }} onClick={handleViewDetails}>
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
          {hasRules ? (
            <Tooltip title="View rules in details">
              <Box
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  px: 1,
                  py: 0.5,
                  borderRadius: 1,
                  bgcolor: 'success.lighter',
                  color: 'success.darker',
                  typography: 'caption',
                  fontWeight: 600,
                }}
              >
                <Iconify icon="solar:check-circle-bold" width={14} />
                {Object.keys(row.rules!).length} rules
              </Box>
            </Tooltip>
          ) : (
            <Box
              sx={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 0.5,
                px: 1,
                py: 0.5,
                borderRadius: 1,
                bgcolor: 'grey.100',
                color: 'text.secondary',
                typography: 'caption',
              }}
            >
              No rules
            </Box>
          )}
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fDateTime(row.createdAt)}
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
        <MenuItem onClick={handleViewDetails}>
          <Iconify icon="solar:eye-bold" />
          View Details
        </MenuItem>

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
