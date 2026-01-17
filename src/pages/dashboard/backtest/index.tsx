import { CONFIG } from 'src/global-config';

import { BacktestListView } from 'src/sections/backtest/view/backtest-list-view';

// ----------------------------------------------------------------------

const metadata = { title: `Backtest - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BacktestListView />
    </>
  );
}
