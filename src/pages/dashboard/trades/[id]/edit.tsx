import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Trade | Dashboard - ${CONFIG.appName}` };

export default function TradeEditPage() {
  const { id } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Edit Trade" description={`Editing trade: ${id}`} />
    </>
  );
}
