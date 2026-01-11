import type { User, UserSettings } from 'src/types/auth';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import MenuItem from '@mui/material/MenuItem';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';

import { useAuthUser } from 'src/hooks/use-auth-user';

import { AuthService } from 'src/services/auth.service';

import { Form, RHFSwitch, RHFSelect, RHFTextField } from 'src/components/hook-form';
import { DashboardContent } from 'src/layouts/dashboard';
import { PageHeader } from 'src/components/page/page-header';
import { FormActions } from 'src/components/form/form-actions';

// ----------------------------------------------------------------------

export type AccountFormValues = zod.infer<typeof AccountSchema>;

const AccountSchema = zod.object({
  // Profile
  firstName: zod.string().min(1, 'First name is required'),
  lastName: zod.string().min(1, 'Last name is required'),
  email: zod.string().email('Must be a valid email'),
  // General
  currency: zod.string().min(1, 'Currency is required'),
  timezone: zod.string().min(1, 'Timezone is required'),
  // Display
  theme: zod.enum(['light', 'dark', 'system']),
  compactMode: zod.boolean(),
  tableDensity: zod.enum(['comfortable', 'compact', 'standard']),
  // Notifications
  emailNotifications: zod.boolean(),
  tradeAlerts: zod.boolean(),
  weeklyReport: zod.boolean(),
  marketNews: zod.boolean(),
});

const CURRENCY_OPTIONS = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'INR', label: 'INR - Indian Rupee' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
];

const TIMEZONE_OPTIONS = [
  { value: 'UTC', label: 'UTC - Coordinated Universal Time' },
  { value: 'America/New_York', label: 'America/New York (EST/EDT)' },
  { value: 'America/Chicago', label: 'America/Chicago (CST/CDT)' },
  { value: 'America/Denver', label: 'America/Denver (MST/MDT)' },
  { value: 'America/Los_Angeles', label: 'America/Los Angeles (PST/PDT)' },
  { value: 'Europe/London', label: 'Europe/London (GMT/BST)' },
  { value: 'Europe/Paris', label: 'Europe/Paris (CET/CEST)' },
  { value: 'Europe/Berlin', label: 'Europe/Berlin (CET/CEST)' },
  { value: 'Asia/Tokyo', label: 'Asia/Tokyo (JST)' },
  { value: 'Asia/Shanghai', label: 'Asia/Shanghai (CST)' },
  { value: 'Asia/Kolkata', label: 'Asia/Kolkata (IST)' },
  { value: 'Asia/Dubai', label: 'Asia/Dubai (GST)' },
  { value: 'Australia/Sydney', label: 'Australia/Sydney (AEST/AEDT)' },
];

const THEME_OPTIONS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System Default' },
];

const TABLE_DENSITY_OPTIONS = [
  { value: 'comfortable', label: 'Comfortable' },
  { value: 'standard', label: 'Standard' },
  { value: 'compact', label: 'Compact' },
];

const DEFAULT_VALUES: AccountFormValues = {
  firstName: '',
  lastName: '',
  email: '',
  currency: 'USD',
  timezone: 'UTC',
  theme: 'system',
  compactMode: false,
  tableDensity: 'standard',
  emailNotifications: true,
  tradeAlerts: true,
  weeklyReport: false,
  marketNews: false,
};

// ----------------------------------------------------------------------

type TabValue = 'profile' | 'general' | 'display' | 'notifications';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'profile', label: 'Profile' },
  { value: 'general', label: 'General' },
  { value: 'display', label: 'Display' },
  { value: 'notifications', label: 'Notifications' },
];

export function AccountView() {
  const user = useAuthUser();
  const [currentTab, setCurrentTab] = useState<TabValue>('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const methods = useForm<AccountFormValues>({
    resolver: zodResolver(AccountSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset } = methods;

  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const settings = await AuthService.getSettings();

        reset({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          currency: settings.currency || DEFAULT_VALUES.currency,
          timezone: settings.timezone || DEFAULT_VALUES.timezone,
          theme: settings.theme || DEFAULT_VALUES.theme,
          compactMode: settings.compactMode ?? DEFAULT_VALUES.compactMode,
          tableDensity: settings.tableDensity || DEFAULT_VALUES.tableDensity,
          emailNotifications: DEFAULT_VALUES.emailNotifications,
          tradeAlerts: DEFAULT_VALUES.tradeAlerts,
          weeklyReport: DEFAULT_VALUES.weeklyReport,
          marketNews: DEFAULT_VALUES.marketNews,
        });
      } catch (error) {
        console.error('Failed to fetch account data:', error);
        toast.error('Failed to load account data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChangeTab = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSaving(true);

      // Update profile if profile fields changed
      if (currentTab === 'profile') {
        await AuthService.updateProfile({
          firstName: data.firstName,
          lastName: data.lastName,
        });
      }

      // Update settings if settings fields changed
      if (currentTab === 'general' || currentTab === 'display') {
        await AuthService.updateSettings({
          currency: data.currency,
          timezone: data.timezone,
          theme: data.theme,
          compactMode: data.compactMode,
          tableDensity: data.tableDensity,
        });
      }

      toast.success('Changes saved successfully');
    } catch (error) {
      console.error('Failed to save changes:', error);
      toast.error('Failed to save changes');
    } finally {
      setSaving(false);
    }
  });

  const getInitials = (firstName: string, lastName: string) => {
    const first = firstName?.charAt(0)?.toUpperCase() || '';
    const last = lastName?.charAt(0)?.toUpperCase() || '';
    return `${first}${last}` || 'U';
  };

  if (loading || !user) {
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
      <PageHeader title="Account" subtitle="Manage your profile and application preferences" />

      <Form methods={methods} onSubmit={onSubmit}>
        <Stack spacing={3}>
          <Tabs
            value={currentTab}
            onChange={handleChangeTab}
            sx={{
              mb: 1,
              '& .MuiTabs-indicator': {
                height: 3,
                borderRadius: 1.5,
              },
            }}
          >
            {TABS.map((tab) => (
              <Tab key={tab.value} value={tab.value} label={tab.label} />
            ))}
          </Tabs>

          <Box sx={{ maxWidth: 720 }}>
            {/* Profile Tab */}
            {currentTab === 'profile' && (
              <Stack spacing={3}>
                <Card>
                  <CardHeader
                    title="Profile Information"
                    subheader="Update your personal information"
                  />
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
                  loading={saving}
                  submitText="Save Changes"
                  onCancel={() =>
                    reset({
                      firstName: user.firstName || '',
                      lastName: user.lastName || '',
                      email: user.email || '',
                    })
                  }
                  cancelText="Reset"
                />
              </Stack>
            )}

            {/* General Settings Tab */}
            {currentTab === 'general' && (
              <Stack spacing={3}>
                <Card>
                  <CardHeader
                    title="General Settings"
                    subheader="Configure your regional and display preferences"
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <RHFSelect name="currency" label="Currency">
                        {CURRENCY_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </RHFSelect>

                      <RHFSelect name="timezone" label="Timezone">
                        {TIMEZONE_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </RHFSelect>
                    </Stack>
                  </CardContent>
                </Card>

                <FormActions loading={saving} submitText="Save Settings" sx={{ mt: 3 }} />
              </Stack>
            )}

            {/* Display Settings Tab */}
            {currentTab === 'display' && (
              <Stack spacing={3}>
                <Card>
                  <CardHeader
                    title="Display Settings"
                    subheader="Customize how the application looks"
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <RHFSelect name="theme" label="Theme Mode">
                        {THEME_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </RHFSelect>

                      <RHFSelect name="tableDensity" label="Table Density">
                        {TABLE_DENSITY_OPTIONS.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </RHFSelect>

                      <Stack spacing={1}>
                        <RHFSwitch
                          name="compactMode"
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">Compact Mode</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Use a more compact layout with reduced spacing
                              </Typography>
                            </Stack>
                          }
                          sx={{ alignItems: 'flex-start' }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <FormActions loading={saving} submitText="Save Settings" sx={{ mt: 3 }} />
              </Stack>
            )}

            {/* Notifications Tab */}
            {currentTab === 'notifications' && (
              <Stack spacing={3}>
                <Card>
                  <CardHeader
                    title="Notifications"
                    subheader="Manage how you receive notifications"
                  />
                  <CardContent>
                    <Stack spacing={3}>
                      <Stack spacing={1}>
                        <RHFSwitch
                          name="emailNotifications"
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">Email Notifications</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Receive email updates about your trades and account activity
                              </Typography>
                            </Stack>
                          }
                          sx={{ alignItems: 'flex-start' }}
                        />
                      </Stack>

                      <Stack spacing={1}>
                        <RHFSwitch
                          name="tradeAlerts"
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">Trade Alerts</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Get notified when trades hit stop loss or take profit levels
                              </Typography>
                            </Stack>
                          }
                          sx={{ alignItems: 'flex-start' }}
                        />
                      </Stack>

                      <Stack spacing={1}>
                        <RHFSwitch
                          name="weeklyReport"
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">Weekly Report</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Receive a weekly summary of your trading performance
                              </Typography>
                            </Stack>
                          }
                          sx={{ alignItems: 'flex-start' }}
                        />
                      </Stack>

                      <Stack spacing={1}>
                        <RHFSwitch
                          name="marketNews"
                          label={
                            <Stack spacing={0.5}>
                              <Typography variant="subtitle2">Market News</Typography>
                              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Stay updated with relevant market news and analysis
                              </Typography>
                            </Stack>
                          }
                          sx={{ alignItems: 'flex-start' }}
                        />
                      </Stack>
                    </Stack>
                  </CardContent>
                </Card>

                <FormActions loading={saving} submitText="Save Settings" sx={{ mt: 3 }} />
              </Stack>
            )}
          </Box>
        </Stack>
      </Form>
    </DashboardContent>
  );
}
