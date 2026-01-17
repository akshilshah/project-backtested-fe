import type { BacktestTrade } from 'src/types/backtest';

import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';

import { Scrollbar } from 'src/components/scrollbar';
import { TableEmpty } from 'src/components/data-table/table-empty';

import { BacktestTradesTableRow } from './backtest-trades-table-row';

// ----------------------------------------------------------------------

const TABLE_HEAD = [
  { id: 'number', label: '#', width: 80 },
  { id: 'coin', label: 'Coin', width: 160 },
  { id: 'direction', label: 'Direction', width: 100 },
  { id: 'entry', label: 'Entry', width: 140 },
  { id: 'stopLoss', label: 'Stop Loss', width: 140 },
  { id: 'exit', label: 'Exit', width: 140 },
  { id: 'rValue', label: 'R +/-', width: 120, align: 'right' as const },
  { id: 'actions', label: '', width: 120, align: 'right' as const },
];

type BacktestTradesTableProps = {
  trades: BacktestTrade[];
  onEdit?: (trade: BacktestTrade) => void;
  onDelete?: (id: number) => void;
  deletingId?: number | null;
};

export function BacktestTradesTable({ trades, onEdit, onDelete, deletingId }: BacktestTradesTableProps) {
  const isEmpty = trades.length === 0;

  return (
    <Card>
      <Scrollbar>
        <TableContainer sx={{ minWidth: 1000, position: 'relative' }}>
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
                {TABLE_HEAD.map((cell) => (
                  <TableCell
                    key={cell.id}
                    align={cell.align ?? 'left'}
                    sx={{
                      width: cell.width,
                      bgcolor: 'background.paper',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      fontSize: '0.75rem',
                      letterSpacing: '0.5px',
                      color: 'text.secondary',
                      py: 2,
                    }}
                  >
                    {cell.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>

            <TableBody
              sx={{
                '& .MuiTableRow-root': {
                  // Zebra striping
                  '&:nth-of-type(even)': {
                    bgcolor: (theme) => theme.palette.action.hover,
                  },
                  // Enhanced hover
                  '&:hover': {
                    bgcolor: (theme) => theme.palette.action.selected,
                  },
                  // Smooth transitions
                  transition: 'background-color 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                },
                // Better cell borders
                '& .MuiTableCell-root': {
                  borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
                },
              }}
            >
              {isEmpty ? (
                <TableEmpty
                  title="No Trades Yet"
                  description="Click 'Add Trade' to start backtesting this strategy"
                  colSpan={TABLE_HEAD.length}
                />
              ) : (
                trades.map((row, index) => (
                  <BacktestTradesTableRow
                    key={row.id}
                    row={row}
                    index={index + 1}
                    onEdit={(trade) => onEdit?.(trade)}
                    onDelete={(id) => onDelete?.(id)}
                    deleting={deletingId === row.id}
                  />
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Scrollbar>
    </Card>
  );
}
