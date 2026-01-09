import type { Theme, SxProps } from '@mui/material/styles';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varFade } from 'src/components/animate';

// ----------------------------------------------------------------------

type TableEmptyProps = {
  title?: string;
  description?: string;
  colSpan?: number;
  icon?: string;
  iconColor?: string;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function TableEmpty({
  title = 'No data found',
  description,
  colSpan = 6,
  icon = 'solar:inbox-bold-duotone',
  iconColor,
  action,
  sx,
}: TableEmptyProps) {
  const theme = useTheme();

  return (
    <TableRow>
      <TableCell colSpan={colSpan} sx={{ py: 10, textAlign: 'center', ...sx }}>
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2.5,
          }}
        >
          <m.div {...varFade('inUp')}>
            <Box
              sx={{
                width: 96,
                height: 96,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: alpha(iconColor || theme.palette.text.disabled, 0.08),
              }}
            >
              <Iconify
                icon={icon as any}
                width={48}
                sx={{ color: iconColor || 'text.disabled' }}
              />
            </Box>
          </m.div>

          <m.div {...varFade('inUp')}>
            <Box>
              <Typography variant="h6" sx={{ mb: 0.5 }}>
                {title}
              </Typography>
              {description && (
                <Typography
                  variant="body2"
                  sx={{ color: 'text.secondary', maxWidth: 360, mx: 'auto' }}
                >
                  {description}
                </Typography>
              )}
            </Box>
          </m.div>

          {action && <m.div {...varFade('inUp')}>{action}</m.div>}
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
      icon="solar:magnifer-bold-duotone"
      sx={sx}
    />
  );
}
