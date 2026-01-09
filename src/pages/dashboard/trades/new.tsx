import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `New Trade | Dashboard - ${CONFIG.appName}` };

export default function TradeCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="New Trade" description="Create a new trade entry" />
    </>
  );
}
