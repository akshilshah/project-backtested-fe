import { CONFIG } from 'src/global-config';

import { AccountView } from 'src/sections/account';

// ----------------------------------------------------------------------

const metadata = { title: `Account | Dashboard - ${CONFIG.appName}` };

export default function AccountPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <AccountView />
    </>
  );
}
