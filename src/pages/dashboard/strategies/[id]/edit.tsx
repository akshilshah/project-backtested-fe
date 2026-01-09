import { useParams } from 'react-router';

import { CONFIG } from 'src/global-config';

import { BlankView } from 'src/sections/blank/view';

// ----------------------------------------------------------------------

const metadata = { title: `Edit Strategy | Dashboard - ${CONFIG.appName}` };

export default function StrategyEditPage() {
  const { id } = useParams();

  return (
    <>
      <title>{metadata.title}</title>

      <BlankView title="Edit Strategy" description={`Editing strategy: ${id}`} />
    </>
  );
}
