import type { TradeAnalytics } from 'src/types/trade';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import Stack from '@mui/material/Stack';
import Skeleton from '@mui/material/Skeleton';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import LinearProgress from '@mui/material/LinearProgress';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

// ----------------------------------------------------------------------

type AnalyticsByStrategyProps = {
  analytics: TradeAnalytics | undefined;
  loading: boolean;
};

export function AnalyticsByStrategy({ analytics, loading }: AnalyticsByStrategyProps) {
  const byStrategy = analytics?.byStrategy ?? [];

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);

  return (
    <Card>
      <CardHeader
        title="Performance by Strategy"
        subheader="Breakdown of trading results by strategy"
      />

      <TableContainer sx={{ overflow: 'unset' }}>
        <Scrollbar>
          <Table sx={{ minWidth: 500 }}>
            <TableHead>
              <TableRow>
                <TableCell>Strategy</TableCell>
                <TableCell align="center">Trades</TableCell>
                <TableCell>Win Rate</TableCell>
                <TableCell align="right">P&L</TableCell>
              </TableRow>
            </TableHead>

            <TableBody>
              {loading ? (
                [...Array(3)].map((_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Skeleton variant="circular" width={32} height={32} />
                        <Skeleton width={100} height={20} />
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Skeleton width={40} height={20} sx={{ mx: 'auto' }} />
                    </TableCell>
                    <TableCell>
                      <Skeleton width={100} height={20} />
                    </TableCell>
                    <TableCell align="right">
                      <Skeleton width={80} height={20} sx={{ ml: 'auto' }} />
                    </TableCell>
                  </TableRow>
                ))
              ) : byStrategy.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4}>
                    <Box sx={{ py: 6, textAlign: 'center' }}>
                      <Iconify
                        icon={"solar:lightbulb-bolt-bold-duotone" as any}
                        width={48}
                        sx={{ color: 'text.disabled', mb: 2 }}
                      />
                      <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                        No strategy data available
                      </Typography>
                    </Box>
                  </TableCell>
                </TableRow>
              ) : (
                byStrategy.map((item) => (
                  <TableRow key={item.strategyId} hover>
                    <TableCell>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Box
                          sx={{
                            width: 32,
                            height: 32,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: 1,
                            bgcolor: 'primary.lighter',
                          }}
                        >
                          <Iconify
                            icon={"solar:lightbulb-bolt-bold" as any}
                            width={18}
                            sx={{ color: 'primary.main' }}
                          />
                        </Box>
                        <Typography variant="subtitle2">{item.strategyName}</Typography>
                      </Stack>
                    </TableCell>
                    <TableCell align="center">
                      <Typography variant="body2" sx={{ fontWeight: 500 }}>
                        {item.trades}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Stack spacing={0.5}>
                        <Stack direction="row" alignItems="center" justifyContent="space-between">
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {item.winRate?.toFixed(1) ?? '0.0'}%
                          </Typography>
                        </Stack>
                        <LinearProgress
                          variant="determinate"
                          value={item.winRate ?? 0}
                          color={(item.winRate ?? 0) >= 50 ? 'success' : 'error'}
                          sx={{ height: 6, borderRadius: 1 }}
                        />
                      </Stack>
                    </TableCell>
                    <TableCell align="right">
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: 600,
                          color: (item.profitLoss ?? 0) >= 0 ? 'success.main' : 'error.main',
                        }}
                      >
                        {(item.profitLoss ?? 0) >= 0 ? '+' : ''}
                        {formatCurrency(item.profitLoss ?? 0)}
                      </Typography>
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
