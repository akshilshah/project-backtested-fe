import { CONFIG } from 'src/global-config';

import { TradesListView } from 'src/sections/trades/view';

// ----------------------------------------------------------------------

const metadata = { title: `Trades - ${CONFIG.appName}` };

export default function TradesListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <TradesListView />
    </>
  );
}
