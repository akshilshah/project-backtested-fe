import { CONFIG } from 'src/global-config';

import { TradesEditView } from 'src/sections/trades/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Trade - ${CONFIG.appName}` };

export default function TradeEditPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <TradesEditView />
    </>
  );
}
