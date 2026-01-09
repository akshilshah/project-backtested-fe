import type { Trade } from 'src/types/trade';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Skeleton from '@mui/material/Skeleton';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import CardHeader from '@mui/material/CardHeader';
import TableContainer from '@mui/material/TableContainer';

import { fDate, fTime } from 'src/utils/format-time';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { PriceDisplay } from 'src/components/trade/price-display';

// ----------------------------------------------------------------------

type DashboardOpenTradesProps = {
  trades: Trade[];
  loading: boolean;
  onExit?: (trade: Trade) => void;
};

export function DashboardOpenTrades({ trades, loading, onExit }: DashboardOpenTradesProps) {
  const openTrades = trades.filter((trade) => trade.status === 'OPEN').slice(0, 5);

  const formatRisk = (entryPrice: number, stopLoss: number, quantity: number) => {
    const risk = (entryPrice - stopLoss) * quantity;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(Math.abs(risk));
  };

  return (
    <Card>
      <CardHeader
        title="Open Positions"
        subheader={`${openTrades.length} active trades`}
        action={
          <Button
            component={RouterLink}
            href={`${paths.dashboard.trades.root}?status=OPEN`}
            size="small"
            color="inherit"
            endIcon={<Iconify icon="eva:arrow-ios-forward-fill" width={16} />}
          >
            View All
          </Button>
        }
        sx={{ mb: 1 }}
      />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 640 }}>
            <TableHead>
              <TableRow>
                <TableCell>Coin</TableCell>
                <TableCell>Strategy</TableCell>
                <TableCell>Entry Date</TableCell>
                <TableCell align="right">Entry Price</TableCell>
                <TableCell align="right">Stop Loss</TableCell>
                <TableCell align="right">Risk</TableCell>
                <TableCell align="right" sx={{ width: 88 }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton width={60} height={20} />
                      </Stack>
                    </TableCell>
                    <TableCell>
                      <Skeleton width={80} height={20} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} height={20} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} height={20} sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} height={20} sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={60} height={20} sx={{ ml: 'auto' }} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={60} height={32} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : openTrades.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7}>
                    <Box sx={{ py: 4, textAlign: 'center' }}>
                      <Iconify
                        icon={"solar:sleeping-square-bold-duotone" as any}
                        width={48}
                        sx={{ color: 'text.disabled', mb: 2 }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No open positions
                      </Typography>
                      <Button
                        component={RouterLink}
                        href={paths.dashboard.trades.new}
                        variant="soft"
                        color="primary"
                        size="small"
                        startIcon={<Iconify icon="mingcute:add-line" />}
                        sx={{ mt: 2 }}
                      >
                        New Trade
                      </Button>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                openTrades.map((trade) => (
                  <TableRow key={trade.id} hover>
                    <TableCell>
                      {trade.coin ? (
                        <CoinDisplay symbol={trade.coin.symbol} name={trade.coin.name} showName />
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{trade.strategy?.name ?? '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{fDate(trade.tradeDate)}</Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        {trade.tradeTime ? fTime(`2000-01-01T${trade.tradeTime}`) : '--'}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <PriceDisplay value={trade.entryPrice} />
                    </TableCell>
                    <TableCell align="right">
                      <PriceDisplay value={trade.stopLoss} />
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{ color: 'error.main', fontWeight: 500 }}
                      >
                        {formatRisk(trade.entryPrice, trade.stopLoss, trade.quantity)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Stack direction="row" justifyContent="flex-end" spacing={0.5}>
                        <Tooltip title="View">
                          <IconButton
                            component={RouterLink}
                            href={paths.dashboard.trades.details(trade.id)}
                            size="small"
                          >
                            <Iconify icon="solar:eye-bold" width={18} />
                          </IconButton>
                        </Tooltip>
                        {onExit && (
                          <Tooltip title="Exit Trade">
                            <IconButton
                              size="small"
                              color="success"
                              onClick={() => onExit(trade)}
                            >
                              <Iconify icon="solar:export-bold" width={18} />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </Scrollbar>
      </TableContainer>
    </Card>
  );
}
