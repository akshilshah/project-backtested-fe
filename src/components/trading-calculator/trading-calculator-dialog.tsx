import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Dialog from '@mui/material/Dialog';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

// ----------------------------------------------------------------------

type TradingCalculatorDialogProps = {
  open: boolean;
  onClose: () => void;
};

export function TradingCalculatorDialog({ open, onClose }: TradingCalculatorDialogProps) {
  const [entry, setEntry] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [stopLossPercentage, setStopLossPercentage] = useState<string>('1.8');

  // Calculate Stop Loss Amount (configurable % of account as risk amount)
  const calculateStopLossAmount = useCallback(() => {
    const accountValue = parseFloat(account) || 0;
    const slPercentage = parseFloat(stopLossPercentage) || 0;
    return (accountValue * (slPercentage / 100)).toFixed(2);
  }, [account, stopLossPercentage]);

  // Calculate Trade Value
  const calculateTradeValue = useCallback(() => {
    const entryValue = parseFloat(entry) || 0;
    const stopLossValue = parseFloat(stopLoss) || 0;
    const accountValue = parseFloat(account) || 0;
    const slPercentage = parseFloat(stopLossPercentage) || 0;

    const difference = Math.abs(entryValue - stopLossValue);
    if (difference === 0) return '0.00';

    const riskAmount = accountValue * (slPercentage / 100);
    const tradeValue = (riskAmount / difference) * entryValue;

    return tradeValue.toFixed(2);
  }, [entry, stopLoss, account, stopLossPercentage]);

  // Calculate Leverage
  const calculateLeverage = useCallback(() => {
    const tradeValue = parseFloat(calculateTradeValue()) || 0;
    const accountValue = parseFloat(account) || 0;

    if (accountValue === 0) return '0.00';

    const leverage = tradeValue / accountValue;
    return leverage.toFixed(2);
  }, [calculateTradeValue, account]);

  const handleEntryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setEntry(event.target.value);
  };

  const handleStopLossChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStopLoss(event.target.value);
  };

  const handleAccountChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setAccount(event.target.value);
  };

  const handleStopLossPercentageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setStopLossPercentage(event.target.value);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Trading Calculator</DialogTitle>
      <DialogContent sx={{ pb: 3 }}>
        <Stack spacing={4} sx={{ mt: 2 }}>
          {/* Input Fields */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2.5, color: 'text.secondary' }}>
              Input Values
            </Typography>
            <Stack spacing={2.5}>
              <TextField
                fullWidth
                label="Entry"
                value={entry}
                onChange={handleEntryChange}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Stop Loss"
                value={stopLoss}
                onChange={handleStopLossChange}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Account"
                value={account}
                onChange={handleAccountChange}
                type="number"
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
              />
              <TextField
                fullWidth
                label="Stop Loss Percentage"
                value={stopLossPercentage}
                onChange={handleStopLossPercentageChange}
                type="number"
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
              />
            </Stack>
          </Box>

          {/* Auto-Calculated Values */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 2.5, color: 'text.secondary' }}>
              Calculated Results
            </Typography>
            <Stack spacing={2.5}>
              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Risk Amount ({stopLossPercentage || '0'}% of Account)
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${calculateStopLossAmount()}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Trade Value
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  ${calculateTradeValue()}
                </Typography>
              </Box>

              <Box
                sx={{
                  p: 2.5,
                  borderRadius: 1.5,
                  bgcolor: 'background.neutral',
                }}
              >
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  Leverage
                </Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>
                  {calculateLeverage()}x
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
