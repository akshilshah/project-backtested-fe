import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Settings | Dashboard - ${CONFIG.appName}` };

export default function SettingsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Settings" description="Manage your application settings" />
    </>
  );
}
