import dayjs from 'dayjs';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import TableContainer from '@mui/material/TableContainer';

import { Iconify } from 'src/components/iconify';

import type { BacktestTrade } from 'src/types/backtest';

// ----------------------------------------------------------------------

type BacktestTradesTableProps = {
  trades: BacktestTrade[];
  onDelete?: (id: number) => void;
};

export function BacktestTradesTable({ trades, onDelete }: BacktestTradesTableProps) {
  return (
    <Card>
      <TableContainer>
        <Table>
          <TableHead
            sx={{
              position: 'sticky',
              top: 0,
              zIndex: 10,
              bgcolor: 'background.paper',
              '&::after': {
                content: '""',
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '1px',
                bgcolor: 'divider',
                boxShadow: (theme) => `0 2px 4px ${theme.palette.action.hover}`,
              },
            }}
          >
            <TableRow>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                #
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Date / Time
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Coin
              </TableCell>
              <TableCell sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Direction
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Entry
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Stop Loss
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Exit
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                R +/-
              </TableCell>
              <TableCell align="right" sx={{ fontWeight: 700, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                Actions
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody
            sx={{
              '& .MuiTableRow-root': {
                '&:nth-of-type(even)': {
                  bgcolor: (theme) => theme.palette.action.hover,
                },
                '&:hover': {
                  bgcolor: (theme) => theme.palette.action.selected,
                },
                transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              },
            }}
          >
            {trades.map((trade) => (
              <TableRow key={trade.id}>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {trade.id}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {dayjs(trade.tradeDate).format('DD/MM/YYYY')}
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    {trade.tradeTime}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    {trade.coin?.symbol || '—'}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Chip
                    label={trade.direction}
                    size="small"
                    sx={{
                      bgcolor: trade.direction === 'Long' ? 'success.lighter' : 'error.lighter',
                      color: trade.direction === 'Long' ? 'success.dark' : 'error.dark',
                      fontWeight: 700,
                      fontSize: '0.6875rem',
                    }}
                  />
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    ${trade.entry.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography variant="body2" sx={{ fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>
                    ${trade.stopLoss.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      fontVariantNumeric: 'tabular-nums',
                      color: trade.exit > trade.entry ? 'success.main' : 'error.main',
                    }}
                  >
                    ${trade.exit.toFixed(2)}
                  </Typography>
                </TableCell>
                <TableCell align="right">
                  <Box
                    sx={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: trade.rValue >= 0 ? 'success.lighter' : 'error.lighter',
                    }}
                  >
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        fontVariantNumeric: 'tabular-nums',
                        color: trade.rValue >= 0 ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {trade.rValue >= 0 ? '+' : ''}{trade.rValue.toFixed(2)}R
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small">
                    <Iconify icon="solar:pen-bold" width={16} />
                  </IconButton>
                  <IconButton
                    size="small"
                    sx={{ color: 'error.main' }}
                    onClick={() => onDelete?.(trade.id)}
                  >
                    <Iconify icon="solar:trash-bin-trash-bold" width={16} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {trades.length === 0 && (
        <Box sx={{ p: 6, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            No Trades Yet
          </Typography>
          <Typography variant="body2" sx={{ color: 'text.secondary' }}>
            Click &ldquo;Add Trade&rdquo; to start backtesting this strategy
          </Typography>
        </Box>
      )}
    </Card>
  );
}
