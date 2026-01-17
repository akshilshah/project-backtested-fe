import { CONFIG } from 'src/global-config';

import { BacktestStrategyView } from 'src/sections/backtest/view/backtest-strategy-view';

// ----------------------------------------------------------------------

const metadata = { title: `Backtest Strategy - ${CONFIG.appName}` };

export default function Page() {
  return (
    <>
      <title>{metadata.title}</title>

      <BacktestStrategyView />
    </>
  );
}
