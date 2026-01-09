import { CONFIG } from 'src/global-config';

import { TradesCreateView } from 'src/sections/trades/view';

// ----------------------------------------------------------------------

const metadata = { title: `New Trade - ${CONFIG.appName}` };

export default function TradeCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <TradesCreateView />
    </>
  );
}
