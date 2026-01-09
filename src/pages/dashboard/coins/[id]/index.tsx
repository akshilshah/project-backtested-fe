import { CONFIG } from 'src/global-config';

import { CoinsDetailsView } from 'src/sections/coins/view/coins-details-view';

// ----------------------------------------------------------------------

const metadata = { title: `Coin Details - ${CONFIG.appName}` };

export default function CoinDetailsPage() {
  return (
    <>
      <title>{metadata.title}</title>

      <CoinsDetailsView />
    </>
  );
}
