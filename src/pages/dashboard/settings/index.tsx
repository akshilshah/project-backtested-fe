import { CONFIG } from 'src/global-config';

import { SettingsView } from 'src/sections/settings';

// ----------------------------------------------------------------------

const metadata = { title: `Settings | Dashboard - ${CONFIG.appName}` };

export default function SettingsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <SettingsView />
    </>
  );
}
