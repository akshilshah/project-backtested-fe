import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `New Strategy | Dashboard - ${CONFIG.appName}` };

export default function StrategyCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="New Strategy" description="Create a new trading strategy" />
    </>
  );
}
