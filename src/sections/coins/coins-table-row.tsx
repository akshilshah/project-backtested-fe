import type { Coin } from 'src/types/coin';

import { memo, useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';
import { DeleteDialog } from 'src/components/form/confirm-dialog';

// ----------------------------------------------------------------------

type CoinsTableRowProps = {
  row: Coin;
  onDelete: (id: number) => void;
  deleting?: boolean;
};

export const CoinsTableRow = memo(function CoinsTableRow({ row, onDelete, deleting }: CoinsTableRowProps) {
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

  return (
    <>
      <TableRow hover>
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
              {row.symbol.slice(0, 2).toUpperCase()}
            </Box>
            <Box>
              <Typography
                component={RouterLink}
                href={paths.dashboard.coins.details(String(row.id))}
                variant="subtitle2"
                sx={{
                  color: 'text.primary',
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                {row.name}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {row.symbol}
              </Typography>
            </Box>
          </Stack>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
            {row.symbol}
          </Typography>
        </TableCell>

        <TableCell>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {fDateTime(row.createdAt)}
          </Typography>
        </TableCell>

        <TableCell align="right">
          <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
            <Tooltip title="View">
              <IconButton
                component={RouterLink}
                href={paths.dashboard.coins.details(String(row.id))}
                size="small"
              >
                <Iconify icon={'solar:eye-bold' as any} width={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Edit">
              <IconButton
                component={RouterLink}
                href={paths.dashboard.coins.edit(String(row.id))}
                size="small"
              >
                <Iconify icon={'solar:pen-bold' as any} width={20} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Delete">
              <IconButton
                size="small"
                color="error"
                onClick={handleOpenDelete}
              >
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
        title="Delete Coin"
        itemName={row.name}
        loading={deleting}
      />
    </>
  );
});
