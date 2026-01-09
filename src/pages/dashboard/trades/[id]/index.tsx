import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Trade Details | Dashboard - ${CONFIG.appName}` };

export default function TradeDetailsPage() {
  const { id } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Trade Details" description={`Viewing trade: ${id}`} />
    </>
  );
}
