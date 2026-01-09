import type { Theme, SxProps } from '@mui/material/styles';

import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

type FormCardProps = {
  title?: string;
  subheader?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  sx?: SxProps<Theme>;
  contentSx?: SxProps<Theme>;
};

export function FormCard({
  title,
  subheader,
  children,
  action,
  sx,
  contentSx,
}: FormCardProps) {
  return (
    <Card sx={sx}>
      {(title || subheader || action) && (
        <CardHeader title={title} subheader={subheader} action={action} />
      )}
      <CardContent sx={contentSx}>
        <Stack spacing={3}>{children}</Stack>
      </CardContent>
    </Card>
  );
}

// ----------------------------------------------------------------------

type FormSectionProps = {
  title?: string;
  description?: string;
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function FormSection({ title, description, children, sx }: FormSectionProps) {
  return (
    <Stack spacing={2} sx={sx}>
      {(title || description) && (
        <Stack spacing={0.5}>
          {title && (
            <span style={{ fontWeight: 600, fontSize: '0.875rem' }}>{title}</span>
          )}
          {description && (
            <span style={{ color: 'var(--palette-text-secondary)', fontSize: '0.875rem' }}>
              {description}
            </span>
          )}
        </Stack>
      )}
      {children}
    </Stack>
  );
}
