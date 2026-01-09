import { CONFIG } from 'src/global-config';

import { StrategiesListView } from 'src/sections/strategies/view/strategies-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Strategies - ${CONFIG.appName}` };

export default function StrategiesListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <StrategiesListView />
    </>
  );
}
