import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

// ----------------------------------------------------------------------

type PageContainerProps = {
  children: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | false;
  disableGutters?: boolean;
  sx?: SxProps<Theme>;
};

export function PageContainer({
  children,
  maxWidth = 'xl',
  disableGutters = false,
  sx,
}: PageContainerProps) {
  return (
    <Container
      maxWidth={maxWidth}
      disableGutters={disableGutters}
      sx={{
        py: { xs: 3, md: 5 },
        ...sx,
      }}
    >
      {children}
    </Container>
  );
}

// ----------------------------------------------------------------------

type PageContentProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function PageContent({ children, sx }: PageContentProps) {
  return <Box sx={sx}>{children}</Box>;
}

// ----------------------------------------------------------------------

type PageSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function PageSection({
  title,
  description,
  children,
  action,
  sx,
}: PageSectionProps) {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      {(title || description || action) && (
        <Box
          sx={{
            mb: 3,
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            gap: 2,
          }}
        >
          <Box>
            {title && (
              <Box component="h3" sx={{ typography: 'h6', m: 0 }}>
                {title}
              </Box>
            )}
            {description && (
              <Box
                component="p"
                sx={{ typography: 'body2', color: 'text.secondary', m: 0, mt: 0.5 }}
              >
                {description}
              </Box>
            )}
          </Box>
          {action}
        </Box>
      )}
      {children}
    </Box>
  );
}

// ----------------------------------------------------------------------

type PageGridProps = {
  children: React.ReactNode;
  columns?: number | { xs?: number; sm?: number; md?: number; lg?: number };
  spacing?: number;
  sx?: SxProps<Theme>;
};

export function PageGrid({
  children,
  columns = { xs: 1, md: 2 },
  spacing = 3,
  sx,
}: PageGridProps) {
  const getResponsiveColumns = () => {
    if (typeof columns === 'number') {
      return `repeat(${columns}, 1fr)`;
    }
    return {
      xs: columns.xs ? `repeat(${columns.xs}, 1fr)` : 'repeat(1, 1fr)',
      sm: columns.sm ? `repeat(${columns.sm}, 1fr)` : undefined,
      md: columns.md ? `repeat(${columns.md}, 1fr)` : 'repeat(2, 1fr)',
      lg: columns.lg ? `repeat(${columns.lg}, 1fr)` : undefined,
    };
  };

  return (
    <Box
      sx={{
        display: 'grid',
        gap: spacing,
        gridTemplateColumns: getResponsiveColumns(),
        ...sx,
      }}
    >
      {children}
    </Box>
  );
}
