import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';

// ----------------------------------------------------------------------

type StatsGridProps = {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  spacing?: number;
  sx?: SxProps<Theme>;
};

export function StatsGrid({
  children,
  columns = { xs: 1, sm: 2, md: 4 },
  spacing = 3,
  sx,
}: StatsGridProps) {
  const getGridColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    return undefined;
  };

  const getResponsiveColumns = () => {
    if (typeof columns === 'object') {
      return {
        xs: columns.xs ? `repeat(${columns.xs}, 1fr)` : undefined,
        sm: columns.sm ? `repeat(${columns.sm}, 1fr)` : undefined,
        md: columns.md ? `repeat(${columns.md}, 1fr)` : undefined,
        lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : undefined,
      };
    }
    return {};
  };

  const responsiveColumns = getResponsiveColumns();

  return (
    <Box
      sx={{
        display: 'grid',
        gap: spacing,
        gridTemplateColumns: getGridColumns() || {
          xs: responsiveColumns.xs || 'repeat(1, 1fr)',
          sm: responsiveColumns.sm || 'repeat(2, 1fr)',
          md: responsiveColumns.md || 'repeat(4, 1fr)',
          lg: responsiveColumns.lg,
        },
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
