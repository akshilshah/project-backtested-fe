import { CONFIG } from 'src/global-config';

import { AnalyticsView } from 'src/sections/analytics/view/analytics-view';

// ----------------------------------------------------------------------

const metadata = { title: `Analytics | Dashboard - ${CONFIG.appName}` };

export default function AnalyticsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <AnalyticsView />
    </>
  );
}
