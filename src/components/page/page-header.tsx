import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type BreadcrumbItem = {
  label: string;
  href?: string;
};

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  breadcrumbs?: BreadcrumbItem[];
  action?: React.ReactNode;
  backHref?: string;
  sx?: SxProps<Theme>;
};

export function PageHeader({
  title,
  subtitle,
  breadcrumbs,
  action,
  backHref,
  sx,
}: PageHeaderProps) {
  const renderBreadcrumbs = () => {
    if (!breadcrumbs?.length) return null;

    return (
      <Breadcrumbs
        separator={<Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'text.disabled' }} />}
        sx={{ mb: 2 }}
      >
        {breadcrumbs.map((item, index) => {
          const isLast = index === breadcrumbs.length - 1;

          if (isLast || !item.href) {
            return (
              <Typography
                key={index}
                variant="body2"
                sx={{
                  color: isLast ? 'text.primary' : 'text.secondary',
                  fontWeight: isLast ? 600 : 400,
                }}
              >
                {item.label}
              </Typography>
            );
          }

          return (
            <Typography
              key={index}
              component={RouterLink}
              href={item.href}
              variant="body2"
              sx={{
                color: 'text.secondary',
                textDecoration: 'none',
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              {item.label}
            </Typography>
          );
        })}
      </Breadcrumbs>
    );
  };

  return (
    <Box sx={{ mb: 4, ...sx }}>
      {renderBreadcrumbs()}

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        alignItems={{ xs: 'flex-start', sm: 'center' }}
        justifyContent="space-between"
        spacing={2}
      >
        <Stack direction="row" alignItems="center" spacing={2}>
          {backHref && (
            <Button
              component={RouterLink}
              href={backHref}
              variant="outlined"
              color="inherit"
              size="small"
              startIcon={<Iconify icon={'solar:arrow-left-outline' as any} />}
            >
              Back
            </Button>
          )}

          <Box>
            <Typography variant="h4">{title}</Typography>
            {subtitle && (
              <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Stack>

        {action && <Box>{action}</Box>}
      </Stack>
    </Box>
  );
}

// ----------------------------------------------------------------------

type PageTitleProps = {
  title: string;
  subtitle?: string;
  sx?: SxProps<Theme>;
};

export function PageTitle({ title, subtitle, sx }: PageTitleProps) {
  return (
    <Box sx={{ mb: 4, ...sx }}>
      <Typography variant="h4">{title}</Typography>
      {subtitle && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
          {subtitle}
        </Typography>
      )}
    </Box>
  );
}
