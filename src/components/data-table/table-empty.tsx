import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type TableEmptyProps = {
  title?: string;
  description?: string;
  colSpan?: number;
  icon?: string;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function TableEmpty({
  title = 'No data found',
  description,
  colSpan = 6,
  icon = 'solar:inbox-outline',
  action,
  sx,
}: TableEmptyProps) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ py: 10, textAlign: 'center', ...sx }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
          }}
        >
          <Iconify
            icon={icon as any}
            width={64}
            sx={{ color: 'text.disabled', opacity: 0.48 }}
          />
          <Box>
            <Typography variant="h6" sx={{ mb: 0.5 }}>
              {title}
            </Typography>
            {description && (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                {description}
              </Typography>
            )}
          </Box>
          {action}
        </Box>
      </TableCell>
    </TableRow>
  );
}

// ----------------------------------------------------------------------

type TableNoDataProps = {
  query?: string;
  colSpan?: number;
  sx?: SxProps<Theme>;
};

export function TableNoData({ query, colSpan = 6, sx }: TableNoDataProps) {
  return (
    <TableEmpty
      colSpan={colSpan}
      title="No results found"
      description={query ? `No results found for "${query}". Try adjusting your search.` : undefined}
      icon="solar:inbox-bold"
      sx={sx}
    />
  );
}
