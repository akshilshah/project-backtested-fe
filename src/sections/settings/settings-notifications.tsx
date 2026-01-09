import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import CardContent from '@mui/material/CardContent';

import { RHFSwitch } from 'src/components/hook-form';

// ----------------------------------------------------------------------

export function SettingsNotifications() {
  return (
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
  );
}
