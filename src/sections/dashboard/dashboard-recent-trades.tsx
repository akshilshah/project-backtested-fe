import type { Trade } from 'src/types/trade';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Skeleton from '@mui/material/Skeleton';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';

import { fDate, fTime } from 'src/utils/format-time';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { ProfitLossDisplay } from 'src/components/stats/profit-loss-display';

// ----------------------------------------------------------------------

type DashboardRecentTradesProps = {
  trades: Trade[];
  loading: boolean;
};

export function DashboardRecentTrades({ trades, loading }: DashboardRecentTradesProps) {
  const closedTrades = trades
    .filter((trade) => trade.status === 'CLOSED')
    .sort((a, b) => {
      const dateA = new Date(`${a.exitDate}T${a.exitTime || '00:00:00'}`);
      const dateB = new Date(`${b.exitDate}T${b.exitTime || '00:00:00'}`);
      return dateB.getTime() - dateA.getTime();
    })
    .slice(0, 5);

  return (
    <Card>
      <CardHeader
        title="Recent Closed Trades"
        subheader="Latest trading activity"
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.trades.root}?status=CLOSED`}
            size="small"
            color="inherit"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
          >
            View All
          </Button>
        }
        sx={{ mb: 1 }}
      />

      <Stack divider={<Divider sx={{ borderStyle: 'dashed' }} />}>
        {loading ? (
          [...Array(3)].map((_, index) => (
            <RecentTradeItemSkeleton key={index} />
          ))
        ) : closedTrades.length === 0 ? (
          <Box sx={{ py: 6, textAlign: 'center' }}>
            <Iconify
              icon={"solar:document-text-bold-duotone" as any}
              width={48}
              sx={{ color: 'text.disabled', mb: 2 }}
            />
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              No closed trades yet
            </Typography>
            <Typography variant="caption" sx={{ color: 'text.disabled', display: 'block', mt: 1 }}>
              Complete some trades to see your history here
            </Typography>
          </Box>
        ) : (
          closedTrades.map((trade) => (
            <RecentTradeItem key={trade.id} trade={trade} />
          ))
        )}
      </Stack>
    </Card>
  );
}

// ----------------------------------------------------------------------

type RecentTradeItemProps = {
  trade: Trade;
};

function RecentTradeItem({ trade }: RecentTradeItemProps) {
  const { coin, strategy, exitDate, exitTime, profitLoss, profitLossPercentage } = trade;

  return (
    <Stack
      component={RouterLink}
      href={paths.dashboard.trades.details(trade.id)}
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{
        px: 3,
        py: 2,
        textDecoration: 'none',
        color: 'inherit',
        transition: 'background-color 0.2s',
        '&:hover': {
          bgcolor: 'action.hover',
        },
      }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        {coin && <CoinDisplay symbol={coin.symbol} name={coin.name} showName />}
        <Box>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            {strategy?.name ?? 'No strategy'}
          </Typography>
          <Typography variant="caption" sx={{ color: 'text.disabled' }}>
            Closed {fDate(exitDate)} at {exitTime ? fTime(`2000-01-01T${exitTime}`) : '--'}
          </Typography>
        </Box>
      </Stack>

      {profitLoss !== undefined && (
        <ProfitLossDisplay
          value={profitLoss}
          percentage={profitLossPercentage}
          size="small"
          variant="filled"
        />
      )}
    </Stack>
  );
}

// ----------------------------------------------------------------------

function RecentTradeItemSkeleton() {
  return (
    <Stack
      direction="row"
      alignItems="center"
      justifyContent="space-between"
      sx={{ px: 3, py: 2 }}
    >
      <Stack direction="row" alignItems="center" spacing={2}>
        <Skeleton variant="circular" width={32} height={32} />
        <Box>
          <Skeleton width={100} height={20} />
          <Skeleton width={80} height={16} />
        </Box>
      </Stack>
      <Skeleton width={80} height={28} />
    </Stack>
  );
}
