import type { Theme, SxProps } from '@mui/material/styles';

import { m } from 'framer-motion';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';
import { varBounce, MotionContainer } from 'src/components/animate';

// ----------------------------------------------------------------------

type ErrorDisplayProps = {
  title?: string;
  description?: string;
  icon?: string;
  onRetry?: () => void;
  retryText?: string;
  action?: React.ReactNode;
  compact?: boolean;
  sx?: SxProps<Theme>;
};

export function ErrorDisplay({
  title = 'Something went wrong',
  description = 'An unexpected error occurred. Please try again later.',
  icon = 'solar:danger-triangle-bold-duotone',
  onRetry,
  retryText = 'Try Again',
  action,
  compact = false,
  sx,
}: ErrorDisplayProps) {
  const theme = useTheme();

  return (
    <Container
      component={MotionContainer}
      sx={{
        py: compact ? 5 : 10,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        minHeight: compact ? 'auto' : 400,
        ...sx,
      }}
    >
      <m.div variants={varBounce('in')}>
        <Box
          sx={{
            width: compact ? 80 : 120,
            height: compact ? 80 : 120,
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: alpha(theme.palette.error.main, 0.08),
            mb: 3,
          }}
        >
          <Iconify
            icon={icon as any}
            width={compact ? 48 : 64}
            sx={{ color: 'error.main' }}
          />
        </Box>
      </m.div>

      <m.div variants={varBounce('in')}>
        <Typography variant={compact ? 'h6' : 'h4'} sx={{ mb: 1 }}>
          {title}
        </Typography>
      </m.div>

      <m.div variants={varBounce('in')}>
        <Typography
          variant="body2"
          sx={{
            color: 'text.secondary',
            maxWidth: 400,
            mb: 4,
          }}
        >
          {description}
        </Typography>
      </m.div>

      {(onRetry || action) && (
        <m.div variants={varBounce('in')}>
          <Stack direction="row" spacing={2}>
            {onRetry && (
              <Button
                variant="contained"
                onClick={onRetry}
                startIcon={<Iconify icon={'solar:refresh-bold' as any} />}
              >
                {retryText}
              </Button>
            )}
            {action}
          </Stack>
        </m.div>
      )}
    </Container>
  );
}

// ----------------------------------------------------------------------

type NetworkErrorProps = {
  onRetry?: () => void;
  sx?: SxProps<Theme>;
};

export function NetworkError({ onRetry, sx }: NetworkErrorProps) {
  return (
    <ErrorDisplay
      title="Connection Error"
      description="Unable to connect to the server. Please check your internet connection and try again."
      icon="solar:wi-fi-router-bold-duotone"
      onRetry={onRetry}
      sx={sx}
    />
  );
}

// ----------------------------------------------------------------------

type NotFoundErrorProps = {
  resource?: string;
  onBack?: () => void;
  backText?: string;
  sx?: SxProps<Theme>;
};

export function NotFoundError({
  resource = 'page',
  onBack,
  backText = 'Go Back',
  sx,
}: NotFoundErrorProps) {
  return (
    <ErrorDisplay
      title={`${resource.charAt(0).toUpperCase() + resource.slice(1)} Not Found`}
      description={`The ${resource} you're looking for doesn't exist or has been removed.`}
      icon="solar:ghost-bold-duotone"
      action={
        onBack && (
          <Button
            variant="contained"
            onClick={onBack}
            startIcon={<Iconify icon={'solar:arrow-left-bold' as any} />}
          >
            {backText}
          </Button>
        )
      }
      sx={sx}
    />
  );
}

// ----------------------------------------------------------------------

type ForbiddenErrorProps = {
  onBack?: () => void;
  sx?: SxProps<Theme>;
};

export function ForbiddenError({ onBack, sx }: ForbiddenErrorProps) {
  return (
    <ErrorDisplay
      title="Access Denied"
      description="You don't have permission to access this resource."
      icon="solar:lock-bold-duotone"
      action={
        onBack && (
          <Button
            variant="contained"
            onClick={onBack}
            startIcon={<Iconify icon={'solar:arrow-left-bold' as any} />}
          >
            Go Back
          </Button>
        )
      }
      sx={sx}
    />
  );
}
