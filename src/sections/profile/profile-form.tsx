import type { User } from 'src/types/auth';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import CardHeader from '@mui/material/CardHeader';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { Form, RHFTextField } from 'src/components/hook-form';
import { FormActions } from 'src/components/form/form-actions';

// ----------------------------------------------------------------------

export type ProfileFormValues = zod.infer<typeof ProfileSchema>;

const ProfileSchema = zod.object({
  firstName: zod.string().min(1, 'First name is required'),
  lastName: zod.string().min(1, 'Last name is required'),
  email: zod.string().email('Must be a valid email'),
});

type ProfileFormProps = {
  user: User;
  onSubmit: (data: ProfileFormValues) => Promise<void>;
  loading?: boolean;
};

export function ProfileForm({ user, onSubmit, loading = false }: ProfileFormProps) {
  const methods = useForm<ProfileFormValues>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
    },
  });

  const { handleSubmit, reset } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit(data);
  });

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || 'U';
  };

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <Stack spacing={3}>
        <Card>
          <CardHeader title="Profile Information" subheader="Update your personal information" />
          <CardContent>
            <Stack spacing={3}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar
                  sx={{
                    width: 80,
                    height: 80,
                    fontSize: '1.5rem',
                    bgcolor: 'primary.main',
                  }}
                >
                  {getInitials(user.firstName, user.lastName)}
                </Avatar>
                <Box>
                  <Typography variant="h6">
                    {user.firstName} {user.lastName}
                  </Typography>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {user.role === 'admin' ? 'Administrator' : 'User'}
                  </Typography>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gap: 3,
                  gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                }}
              >
                <RHFTextField name="firstName" label="First Name" />
                <RHFTextField name="lastName" label="Last Name" />
              </Box>

              <RHFTextField name="email" label="Email Address" disabled />
            </Stack>
          </CardContent>
        </Card>

        {user.organization && (
          <Card>
            <CardHeader title="Organization" subheader="Your organization details" />
            <CardContent>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Organization Name
                  </Typography>
                  <Typography variant="body1">{user.organization.name}</Typography>
                </Box>
                <Box>
                  <Typography variant="subtitle2" sx={{ color: 'text.secondary' }}>
                    Member Since
                  </Typography>
                  <Typography variant="body1">
                    {new Date(user.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </Typography>
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        <FormActions
          loading={loading}
          submitText="Save Changes"
          onCancel={() => reset()}
          cancelText="Reset"
        />
      </Stack>
    </Form>
  );
}
