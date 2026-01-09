import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Dashboard | ${CONFIG.appName}` };

export default function DashboardPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Dashboard" description="Welcome to your trading management dashboard" />
    </>
  );
}
