import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `New Coin | Dashboard - ${CONFIG.appName}` };

export default function CoinCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="New Coin" description="Add a new coin/cryptocurrency" />
    </>
  );
}
