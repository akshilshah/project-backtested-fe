import { CONFIG } from 'src/global-config';

import { StrategiesCreateView } from 'src/sections/strategies/view/strategies-create-view';

// ----------------------------------------------------------------------

const metadata = { title: `Create Strategy - ${CONFIG.appName}` };

export default function StrategyCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <StrategiesCreateView />
    </>
  );
}
