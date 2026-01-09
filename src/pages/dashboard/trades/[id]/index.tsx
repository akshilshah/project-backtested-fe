import { CONFIG } from 'src/global-config';

import { TradesDetailsView } from 'src/sections/trades/view';

// ----------------------------------------------------------------------

const metadata = { title: `Trade Details - ${CONFIG.appName}` };

export default function TradeDetailsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <TradesDetailsView />
    </>
  );
}
