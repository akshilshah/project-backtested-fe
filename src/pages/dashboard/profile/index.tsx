import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Profile | Dashboard - ${CONFIG.appName}` };

export default function ProfilePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Profile" description="Manage your profile information" />
    </>
  );
}
