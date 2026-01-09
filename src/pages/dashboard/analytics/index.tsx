import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Analytics | Dashboard - ${CONFIG.appName}` };

export default function AnalyticsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Analytics" description="View your trading performance analytics" />
    </>
  );
}
