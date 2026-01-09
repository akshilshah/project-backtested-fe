import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Coin | Dashboard - ${CONFIG.appName}` };

export default function CoinEditPage() {
  const { id } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Edit Coin" description={`Editing coin: ${id}`} />
    </>
  );
}
