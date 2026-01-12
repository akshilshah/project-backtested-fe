import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { CreateTradeRequest } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useState, useCallback } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';

import { Form } from 'src/components/hook-form';
import { RHFAutocomplete } from 'src/components/hook-form/rhf-autocomplete';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const TradeSchema = z.object({
  coinId: z.number({ message: 'Coin is required' }).min(1, 'Coin is required'),
  strategyId: z.number({ message: 'Strategy is required' }).min(1, 'Strategy is required'),
  tradeDate: z.any().refine((val) => val !== null && val !== undefined, 'Trade date is required'),
  tradeTime: z.any().refine((val) => val !== null && val !== undefined, 'Trade time is required'),
});

type TradeFormValues = z.infer<typeof TradeSchema>;

type TradingCalculatorDialogProps = {
  open: boolean;
  onClose: () => void;
  coins: Coin[];
  strategies: Strategy[];
  coinsLoading?: boolean;
  strategiesLoading?: boolean;
  onTakeTrade?: (data: CreateTradeRequest) => Promise<void>;
};

export function TradingCalculatorDialog({
  open,
  onClose,
  coins = [],
  strategies = [],
  coinsLoading = false,
  strategiesLoading = false,
  onTakeTrade,
}: TradingCalculatorDialogProps) {
  const [entry, setEntry] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [stopLossPercentage, setStopLossPercentage] = useState<string>('1.8');
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultValues: TradeFormValues = {
    coinId: 0,
    strategyId: 0,
    tradeDate: dayjs(),
    tradeTime: dayjs(),
  };

  const methods = useForm<TradeFormValues>({
    resolver: zodResolver(TradeSchema),
    defaultValues,
  });

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

  // Calculate quantity: Trade Value / Entry Price
  const calculateQuantity = useCallback(() => {
    const tradeValue = parseFloat(calculateTradeValue()) || 0;
    const entryValue = parseFloat(entry) || 0;

    if (entryValue === 0) return 0;

    return tradeValue / entryValue;
  }, [calculateTradeValue, entry]);

  const handleTakeTradeClick = () => {
    setShowTradeForm(true);
  };

  const handleCancelTrade = () => {
    setShowTradeForm(false);
    methods.reset(defaultValues);
  };

  const { handleSubmit, watch, setValue } = methods;

  const coinIdValue = watch('coinId');
  const strategyIdValue = watch('strategyId');

  const selectedCoin = coins.find((c) => c.id === Number(coinIdValue)) ?? null;
  const selectedStrategy = strategies.find((s) => s.id === Number(strategyIdValue)) ?? null;

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!onTakeTrade) return;

    try {
      setLoading(true);
      const tradeDate = dayjs(data.tradeDate).format('YYYY-MM-DD');
      const tradeTime = dayjs(data.tradeTime).format('HH:mm:ss');
      const quantity = calculateQuantity();

      await onTakeTrade({
        coinId: data.coinId,
        strategyId: data.strategyId,
        tradeDate,
        tradeTime,
        avgEntry: Number(entry),
        stopLoss: Number(stopLoss),
        stopLossPercentage: Number(stopLossPercentage),
        quantity,
        amount: Number(account),
      });

      // Reset form
      setShowTradeForm(false);
      methods.reset(defaultValues);
      setEntry('');
      setStopLoss('');
      setAccount('');
      setStopLossPercentage('1.8');
    } catch (error) {
      console.error('Failed to create trade:', error);
    } finally {
      setLoading(false);
    }
  });

  const tradeValue = calculateTradeValue();
  const leverage = calculateLeverage();
  const riskAmount = calculateStopLossAmount();
  const quantity = calculateQuantity();

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 2 }}>
        <Typography variant="h5" fontWeight={600}>
          Trading Calculator
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
          Calculate your position size and risk
        </Typography>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent>
          <Stack spacing={3}>
            {/* Input Section */}
            <Card sx={{ p: 3, bgcolor: 'background.neutral' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                Input Values
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Entry Price"
                    value={entry}
                    onChange={handleEntryChange}
                    type="number"
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    slotProps={{
                      htmlInput: {
                        step: '0.00000001',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Stop Loss Price"
                    value={stopLoss}
                    onChange={handleStopLossChange}
                    type="number"
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    slotProps={{
                      htmlInput: {
                        step: '0.00000001',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Account Balance"
                    value={account}
                    onChange={handleAccountChange}
                    type="number"
                    placeholder="0.00"
                    InputProps={{
                      startAdornment: <InputAdornment position="start">$</InputAdornment>,
                    }}
                    slotProps={{
                      htmlInput: {
                        step: '0.01',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 6 }}>
                  <TextField
                    fullWidth
                    label="Risk Percentage"
                    value={stopLossPercentage}
                    onChange={handleStopLossPercentageChange}
                    type="number"
                    placeholder="1.8"
                    InputProps={{
                      endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                    slotProps={{
                      htmlInput: {
                        step: '0.1',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Card>

            {/* Results Section */}
            <Card sx={{ p: 3, bgcolor: 'primary.lighter' }}>
              <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2, color: 'primary.main' }}>
                Calculated Results
              </Typography>
              <Grid container spacing={2}>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Risk Amount
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'error.main' }}>
                      ${riskAmount}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {stopLossPercentage || '0'}% of account
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Position Size
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'primary.main' }}>
                      ${tradeValue}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Total value
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Quantity
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'success.main' }}>
                      {quantity.toFixed(8)}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Units to buy
                    </Typography>
                  </Box>
                </Grid>
                <Grid size={{ xs: 6, sm: 3 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" fontWeight={500}>
                      Leverage
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 0.5, color: 'warning.main' }}>
                      {leverage}x
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Position leverage
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Card>

            {/* Trade Form Section */}
            {showTradeForm && (
              <Card sx={{ p: 3, border: '2px solid', borderColor: 'primary.main' }}>
                <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 2 }}>
                  Trade Details
                </Typography>
                <Stack spacing={2.5}>
                  <Grid container spacing={2}>
                    <Grid size={{ xs: 6 }}>
                      <RHFAutocomplete
                        name="coinId"
                        label="Coin"
                        placeholder="Select a coin"
                        options={coins}
                        loading={coinsLoading}
                        value={selectedCoin}
                        onChange={(_: any, newValue: Coin | null) => {
                          setValue('coinId', newValue?.id ?? 0, { shouldValidate: true });
                        }}
                        getOptionLabel={(option: Coin) => `${option.symbol} - ${option.name}`}
                        isOptionEqualToValue={(option: Coin, value: Coin) => option.id === value.id}
                        renderOption={(props, option: Coin) => (
                          <Box component="li" {...props} key={option.id}>
                            <Stack direction="row" alignItems="center" spacing={1.5}>
                              <Box
                                sx={{
                                  width: 28,
                                  height: 28,
                                  borderRadius: 0.75,
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  bgcolor: 'primary.lighter',
                                  color: 'primary.main',
                                  fontWeight: 700,
                                  fontSize: '0.75rem',
                                }}
                              >
                                {option.symbol.slice(0, 2)}
                              </Box>
                              <Box>
                                <Typography variant="body2" fontWeight={600}>
                                  {option.symbol}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {option.name}
                                </Typography>
                              </Box>
                            </Stack>
                          </Box>
                        )}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <RHFAutocomplete
                        name="strategyId"
                        label="Strategy"
                        placeholder="Select a strategy"
                        options={strategies}
                        loading={strategiesLoading}
                        value={selectedStrategy}
                        onChange={(_: any, newValue: Strategy | null) => {
                          setValue('strategyId', newValue?.id ?? 0, { shouldValidate: true });
                        }}
                        getOptionLabel={(option: Strategy) => option.name}
                        isOptionEqualToValue={(option: Strategy, value: Strategy) =>
                          option.id === value.id
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <RHFDatePicker
                        name="tradeDate"
                        label="Trade Date"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <RHFTimePicker
                        name="tradeTime"
                        label="Trade Time"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
            )}
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: 2.5 }}>
          <Button variant="outlined" color="inherit" onClick={onClose}>
            Close
          </Button>
          {!showTradeForm ? (
            <Button
              variant="contained"
              size="large"
              onClick={handleTakeTradeClick}
              disabled={!entry || !stopLoss || !account || Number(tradeValue) === 0}
            >
              Take Trade
            </Button>
          ) : (
            <Stack direction="row" spacing={1.5}>
              <Button variant="outlined" onClick={handleCancelTrade}>
                Cancel Trade
              </Button>
              <LoadingButton type="submit" variant="contained" size="large" loading={loading}>
                Execute Trade
              </LoadingButton>
            </Stack>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
}
