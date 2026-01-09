import { CONFIG } from 'src/global-config';

import { ProfileView } from 'src/sections/profile';

// ----------------------------------------------------------------------

const metadata = { title: `Profile | Dashboard - ${CONFIG.appName}` };

export default function ProfilePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <ProfileView />
    </>
  );
}
