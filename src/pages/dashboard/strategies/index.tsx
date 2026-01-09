import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Strategies | Dashboard - ${CONFIG.appName}` };

export default function StrategiesListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Strategies" description="Manage your trading strategies" />
    </>
  );
}
