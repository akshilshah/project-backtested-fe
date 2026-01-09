import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Coin Details | Dashboard - ${CONFIG.appName}` };

export default function CoinDetailsPage() {
  const { id } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Coin Details" description={`Viewing coin: ${id}`} />
    </>
  );
}
