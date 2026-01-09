import { CONFIG } from 'src/global-config';

import { StrategiesEditView } from 'src/sections/strategies/view/strategies-edit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Strategy - ${CONFIG.appName}` };

export default function StrategyEditPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <StrategiesEditView />
    </>
  );
}
