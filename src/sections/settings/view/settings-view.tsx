import type { UserSettings } from 'src/types/auth';

import { z as zod } from 'zod';
import { useForm } from 'react-hook-form';
import { useState, useEffect, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import { toast } from 'sonner';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';

import { AuthService } from 'src/services/auth.service';

import { Form } from 'src/components/hook-form';
import { DashboardContent } from 'src/layouts/dashboard';
import { PageHeader } from 'src/components/page/page-header';
import { FormActions } from 'src/components/form/form-actions';

import { SettingsGeneral } from '../settings-general';
import { SettingsDisplay } from '../settings-display';
import { SettingsNotifications } from '../settings-notifications';

// ----------------------------------------------------------------------

export type SettingsFormValues = zod.infer<typeof SettingsSchema>;

const SettingsSchema = zod.object({
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

const DEFAULT_VALUES: SettingsFormValues = {
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

type TabValue = 'general' | 'display' | 'notifications';

const TABS: { value: TabValue; label: string }[] = [
  { value: 'general', label: 'General' },
  { value: 'display', label: 'Display' },
  { value: 'notifications', label: 'Notifications' },
];

export function SettingsView() {
  const [currentTab, setCurrentTab] = useState<TabValue>('general');
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const methods = useForm<SettingsFormValues>({
    resolver: zodResolver(SettingsSchema),
    defaultValues: DEFAULT_VALUES,
  });

  const { handleSubmit, reset } = methods;

  const fetchSettings = useCallback(async () => {
    try {
      setLoading(true);
      const data = await AuthService.getSettings();
      setSettings(data);

      // Update form with fetched settings
      reset({
        currency: data.currency || DEFAULT_VALUES.currency,
        timezone: data.timezone || DEFAULT_VALUES.timezone,
        theme: data.theme || DEFAULT_VALUES.theme,
        compactMode: data.compactMode ?? DEFAULT_VALUES.compactMode,
        tableDensity: data.tableDensity || DEFAULT_VALUES.tableDensity,
        // Notification preferences might not be in the API yet, use defaults
        emailNotifications: DEFAULT_VALUES.emailNotifications,
        tradeAlerts: DEFAULT_VALUES.tradeAlerts,
        weeklyReport: DEFAULT_VALUES.weeklyReport,
        marketNews: DEFAULT_VALUES.marketNews,
      });
    } catch (error) {
      console.error('Failed to fetch settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [reset]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleChangeTab = useCallback((_event: React.SyntheticEvent, newValue: TabValue) => {
    setCurrentTab(newValue);
  }, []);

  const onSubmit = handleSubmit(async (data) => {
    try {
      setSaving(true);
      await AuthService.updateSettings({
        currency: data.currency,
        timezone: data.timezone,
        theme: data.theme,
        compactMode: data.compactMode,
        tableDensity: data.tableDensity,
      });
      toast.success('Settings saved successfully');
    } catch (error) {
      console.error('Failed to save settings:', error);
      toast.error('Failed to save settings');
    } finally {
      setSaving(false);
    }
  });

  if (loading) {
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
        title="Settings"
        subtitle="Manage your application preferences and configurations"
      />

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
            {currentTab === 'general' && <SettingsGeneral settings={settings} />}

            {currentTab === 'display' && <SettingsDisplay settings={settings} />}

            {currentTab === 'notifications' && <SettingsNotifications />}

            <FormActions loading={saving} submitText="Save Settings" sx={{ mt: 3 }} />
          </Box>
        </Stack>
      </Form>
    </DashboardContent>
  );
}
