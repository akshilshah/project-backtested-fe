import { CONFIG } from 'src/global-config';

import { CoinsListView } from 'src/sections/coins/view/coins-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Coins - ${CONFIG.appName}` };

export default function CoinsListPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <CoinsListView />
    </>
  );
}
