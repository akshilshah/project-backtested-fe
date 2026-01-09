import { CONFIG } from 'src/global-config';

import { CoinsEditView } from 'src/sections/coins/view/coins-edit-view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Coin - ${CONFIG.appName}` };

export default function CoinEditPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <CoinsEditView />
    </>
  );
}
