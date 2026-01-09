import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import CardContent from '@mui/material/CardContent';

// ----------------------------------------------------------------------

type DetailSkeletonProps = {
  sx?: SxProps<Theme>;
};

export function DetailSkeleton({ sx }: DetailSkeletonProps) {
  return (
    <Box sx={sx}>
      {/* Header skeleton */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={150} height={20} sx={{ mt: 0.5 }} />
        </Box>
        <Stack direction="row" spacing={1}>
          <Skeleton variant="rounded" width={100} height={36} />
          <Skeleton variant="rounded" width={100} height={36} />
        </Stack>
      </Stack>

      <Grid container spacing={3}>
        {/* Main content */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Stack spacing={3}>
                {/* Title row */}
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Skeleton variant="circular" width={48} height={48} />
                    <Box>
                      <Skeleton variant="text" width={120} height={24} />
                      <Skeleton variant="text" width={80} height={16} />
                    </Box>
                  </Stack>
                  <Skeleton variant="rounded" width={80} height={24} />
                </Stack>

                <Skeleton variant="rectangular" height={1} />

                {/* Detail rows */}
                <Box>
                  <Skeleton variant="text" width={100} height={16} sx={{ mb: 2 }} />
                  <Grid container spacing={2}>
                    {[1, 2, 3, 4].map((item) => (
                      <Grid key={item} size={{ xs: 6, sm: 3 }}>
                        <Skeleton variant="text" width={60} height={14} />
                        <Skeleton variant="text" width={80} height={20} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>

                <Skeleton variant="rectangular" height={1} />

                {/* Additional section */}
                <Box>
                  <Skeleton variant="text" width={80} height={16} sx={{ mb: 2 }} />
                  <Skeleton variant="text" width="100%" height={16} />
                  <Skeleton variant="text" width="80%" height={16} />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        </Grid>

        {/* Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Stack spacing={3}>
            {[1, 2, 3].map((item) => (
              <Card key={item}>
                <CardContent>
                  <Skeleton variant="text" width={100} height={16} sx={{ mb: 2 }} />
                  <Stack spacing={1.5}>
                    <Stack direction="row" justifyContent="space-between">
                      <Skeleton variant="text" width={80} height={16} />
                      <Skeleton variant="text" width={60} height={16} />
                    </Stack>
                    <Stack direction="row" justifyContent="space-between">
                      <Skeleton variant="text" width={80} height={16} />
                      <Skeleton variant="text" width={60} height={16} />
                    </Stack>
                  </Stack>
                </CardContent>
              </Card>
            ))}
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}

// ----------------------------------------------------------------------

type FormSkeletonProps = {
  sx?: SxProps<Theme>;
};

export function FormSkeleton({ sx }: FormSkeletonProps) {
  return (
    <Box sx={sx}>
      {/* Header skeleton */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 3 }}>
        <Box>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={150} height={20} sx={{ mt: 0.5 }} />
        </Box>
      </Stack>

      <Card>
        <CardContent>
          <Stack spacing={3}>
            {/* Form fields */}
            {[1, 2, 3, 4].map((item) => (
              <Box key={item}>
                <Skeleton variant="text" width={100} height={16} sx={{ mb: 1 }} />
                <Skeleton variant="rounded" width="100%" height={56} />
              </Box>
            ))}

            {/* Row of fields */}
            <Grid container spacing={2}>
              {[1, 2].map((item) => (
                <Grid key={item} size={{ xs: 12, sm: 6 }}>
                  <Skeleton variant="text" width={100} height={16} sx={{ mb: 1 }} />
                  <Skeleton variant="rounded" width="100%" height={56} />
                </Grid>
              ))}
            </Grid>

            {/* Textarea */}
            <Box>
              <Skeleton variant="text" width={100} height={16} sx={{ mb: 1 }} />
              <Skeleton variant="rounded" width="100%" height={120} />
            </Box>

            {/* Actions */}
            <Stack direction="row" justifyContent="flex-end" spacing={1.5} sx={{ pt: 2 }}>
              <Skeleton variant="rounded" width={80} height={36} />
              <Skeleton variant="rounded" width={80} height={36} />
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

// ----------------------------------------------------------------------

type CardSkeletonProps = {
  sx?: SxProps<Theme>;
};

export function CardSkeleton({ sx }: CardSkeletonProps) {
  return (
    <Card sx={sx}>
      <CardContent>
        <Stack spacing={2}>
          <Stack direction="row" alignItems="center" spacing={2}>
            <Skeleton variant="circular" width={40} height={40} />
            <Box sx={{ flex: 1 }}>
              <Skeleton variant="text" width="60%" height={20} />
              <Skeleton variant="text" width="40%" height={16} />
            </Box>
          </Stack>
          <Skeleton variant="text" width="100%" height={16} />
          <Skeleton variant="text" width="80%" height={16} />
        </Stack>
      </CardContent>
    </Card>
  );
}
