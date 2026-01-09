import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Coins | Dashboard - ${CONFIG.appName}` };

export default function CoinsListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Coins" description="Manage your coin/cryptocurrency master data" />
    </>
  );
}
