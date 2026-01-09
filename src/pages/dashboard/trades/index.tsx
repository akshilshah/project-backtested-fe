import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Trades | Dashboard - ${CONFIG.appName}` };

export default function TradesListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Trades" description="Manage all your trades" />
    </>
  );
}
