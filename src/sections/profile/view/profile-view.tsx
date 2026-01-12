import type { ProfileFormValues } from '../profile-form';

import { toast } from 'sonner';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuthUser } from 'src/hooks/use-auth-user';

import { AuthService } from 'src/services/auth.service';
import { DashboardContent } from 'src/layouts/dashboard';

import { PageHeader } from 'src/components/page/page-header';

import { ProfileForm } from '../profile-form';

// ----------------------------------------------------------------------

export function ProfileView() {
  const user = useAuthUser();
  const [loading, setLoading] = useState(false);

  const handleSubmit = useCallback(async (data: ProfileFormValues) => {
    try {
      setLoading(true);
      await AuthService.updateProfile({
        firstName: data.firstName,
        lastName: data.lastName,
      });
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Failed to update profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setLoading(false);
    }
  }, []);

  if (!user) {
    return (
      <DashboardContent maxWidth="lg">
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: 400,
          }}
        >
          <CircularProgress />
        </Box>
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth="lg">
      <PageHeader
        title="Profile"
        subtitle="Manage your personal information and account settings"
      />

      <Box sx={{ maxWidth: 720 }}>
        <ProfileForm user={user} onSubmit={handleSubmit} loading={loading} />
      </Box>
    </DashboardContent>
  );
}
