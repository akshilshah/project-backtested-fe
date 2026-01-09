import { CONFIG } from 'src/global-config';

import { CoinsCreateView } from 'src/sections/coins/view/coins-create-view';

// ----------------------------------------------------------------------

const metadata = { title: `New Coin - ${CONFIG.appName}` };

export default function CoinCreatePage() {
  return (
    <>
      <title>{metadata.title}</title>

      <CoinsCreateView />
    </>
  );
}
