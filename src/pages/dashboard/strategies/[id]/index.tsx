import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Strategy Details | Dashboard - ${CONFIG.appName}` };

export default function StrategyDetailsPage() {
  const { id } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Strategy Details" description={`Viewing strategy: ${id}`} />
    </>
  );
}
