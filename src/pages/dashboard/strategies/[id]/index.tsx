import { CONFIG } from 'src/global-config';

import { StrategiesDetailsView } from 'src/sections/strategies/view/strategies-details-view';

// ----------------------------------------------------------------------

const metadata = { title: `Strategy Details - ${CONFIG.appName}` };

export default function StrategyDetailsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <StrategiesDetailsView />
    </>
  );
}
