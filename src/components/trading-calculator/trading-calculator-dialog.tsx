import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { Trade, CreateTradeRequest } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
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
  currentTrade?: Trade;
  isEditMode?: boolean;
};

export function TradingCalculatorDialog({
  open,
  onClose,
  coins = [],
  strategies = [],
  coinsLoading = false,
  strategiesLoading = false,
  onTakeTrade,
  currentTrade,
  isEditMode = false,
}: TradingCalculatorDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [entry, setEntry] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [stopLossPercentage, setStopLossPercentage] = useState<string>('1.8');
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const defaultValues: TradeFormValues = {
    coinId: currentTrade?.coinId || 0,
    strategyId: currentTrade?.strategyId || 0,
    tradeDate: currentTrade?.tradeDate ? dayjs(currentTrade.tradeDate) : dayjs(),
    tradeTime: currentTrade?.tradeTime ? dayjs(`2000-01-01 ${currentTrade.tradeTime}`) : dayjs(),
  };

  const methods = useForm<TradeFormValues>({
    resolver: zodResolver(TradeSchema),
    defaultValues,
  });

  // Pre-populate calculator values when editing
  useEffect(() => {
    if (currentTrade && isEditMode) {
      setEntry(currentTrade.avgEntry.toString());
      setStopLoss(currentTrade.stopLoss.toString());
      setAccount(currentTrade.amount.toString());
      setStopLossPercentage(currentTrade.stopLossPercentage.toString());
      setShowTradeForm(true); // Auto-show trade form in edit mode
    }
  }, [currentTrade, isEditMode]);

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
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle sx={{ pb: isMobile ? 1 : 2, px: isMobile ? 2 : 3 }}>
        <Typography variant={isMobile ? 'h6' : 'h5'} fontWeight={600}>
          {isEditMode ? 'Edit Trade' : 'Trading Calculator'}
        </Typography>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
          {isEditMode ? 'Update trade details and recalculate' : 'Calculate your position size and risk'}
        </Typography>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent sx={{ px: isMobile ? 2 : 3 }}>
          <Stack spacing={isMobile ? 2 : 3}>
            {/* Input Section */}
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, mb: 2, display: 'block' }}>
                Input Values
              </Typography>
              <Grid container spacing={isMobile ? 2 : 2.5}>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Entry Price"
                    value={entry}
                    onChange={handleEntryChange}
                    type="number"
                    placeholder="0.00"
                    size={isMobile ? 'small' : 'medium'}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      },
                      htmlInput: {
                        step: '0.00000001',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Stop Loss Price"
                    value={stopLoss}
                    onChange={handleStopLossChange}
                    type="number"
                    placeholder="0.00"
                    size={isMobile ? 'small' : 'medium'}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      },
                      htmlInput: {
                        step: '0.00000001',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Account Balance"
                    value={account}
                    onChange={handleAccountChange}
                    type="number"
                    placeholder="0.00"
                    size={isMobile ? 'small' : 'medium'}
                    slotProps={{
                      input: {
                        startAdornment: <InputAdornment position="start">$</InputAdornment>,
                      },
                      htmlInput: {
                        step: '0.01',
                      },
                    }}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label="Risk Percentage"
                    value={stopLossPercentage}
                    onChange={handleStopLossPercentageChange}
                    type="number"
                    placeholder="1.8"
                    size={isMobile ? 'small' : 'medium'}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      },
                      htmlInput: {
                        step: '0.1',
                      },
                    }}
                  />
                </Grid>
              </Grid>
            </Box>

            {/* Results Section */}
            <Box>
              <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, mb: 2, display: 'block' }}>
                Calculated Results
              </Typography>

              {/* Primary Results - Large emphasis */}
              <Stack spacing={3}>
                <Grid container spacing={3}>
                  {/* Position Size - Most Important */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card
                      sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Position Size
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mt: 1, mb: 0.5 }}>
                        {Number(tradeValue) === 0 ? '-' : `$${tradeValue}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Total value
                      </Typography>
                    </Card>
                  </Grid>

                  {/* Quantity - Second Most Important */}
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <Card
                      sx={{
                        p: 3,
                        border: '2px solid',
                        borderColor: 'primary.main',
                        bgcolor: 'background.paper',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
                      }}
                    >
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 0.5, textTransform: 'uppercase' }}>
                        Quantity
                      </Typography>
                      <Typography variant="h3" sx={{ fontWeight: 700, color: 'primary.main', mt: 1, mb: 0.5 }}>
                        {quantity === 0 ? '-' : quantity.toFixed(4)}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                        Units to buy
                      </Typography>
                    </Card>
                  </Grid>
                </Grid>

                {/* Secondary Results - Smaller */}
                <Grid container spacing={2}>
                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Risk Amount
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                        {Number(riskAmount) === 0 ? '-' : `$${riskAmount}`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        {stopLossPercentage || '0'}% of account
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid size={{ xs: 6 }}>
                    <Box sx={{ p: 2, borderRadius: 1.5, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 500, textTransform: 'uppercase', letterSpacing: 0.5 }}>
                        Leverage
                      </Typography>
                      <Typography variant="h5" sx={{ fontWeight: 600, color: 'text.primary', mt: 0.5 }}>
                        {Number(leverage) === 0 ? '-' : `${leverage}x`}
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
                        Position leverage
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </Stack>
            </Box>

            {/* Trade Form Section */}
            {showTradeForm && (
              <Box>
                <Typography variant="overline" sx={{ color: 'text.secondary', fontWeight: 600, letterSpacing: 1, mb: 2, display: 'block' }}>
                  Trade Details
                </Typography>
                <Box sx={{ p: isMobile ? 2 : 3, borderRadius: 1.5, border: '1px solid', borderColor: 'divider', bgcolor: 'background.paper' }}>
                  <Grid container spacing={isMobile ? 1.5 : 2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                        slotProps={{
                          textField: {
                            size: isMobile ? 'small' : 'medium',
                          },
                        }}
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
                    <Grid size={{ xs: 12, sm: 6 }}>
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
                        slotProps={{
                          textField: {
                            size: isMobile ? 'small' : 'medium',
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RHFDatePicker
                        name="tradeDate"
                        label="Trade Date"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: isMobile ? 'small' : 'medium',
                          },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RHFTimePicker
                        name="tradeTime"
                        label="Trade Time"
                        slotProps={{
                          textField: {
                            fullWidth: true,
                            size: isMobile ? 'small' : 'medium',
                          },
                        }}
                      />
                    </Grid>
                  </Grid>
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <Divider />

        <DialogActions sx={{ p: isMobile ? 1.5 : 2.5, gap: 1 }}>
          <Button variant="outlined" color="inherit" onClick={onClose} size={isMobile ? 'medium' : 'large'}>
            Close
          </Button>
          {!showTradeForm ? (
            <Button
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              onClick={handleTakeTradeClick}
              disabled={!entry || !stopLoss || !account || Number(tradeValue) === 0}
            >
              {isEditMode ? 'Continue' : 'Take Trade'}
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleCancelTrade} size={isMobile ? 'medium' : 'large'}>
                Cancel
              </Button>
              <LoadingButton type="submit" variant="contained" size={isMobile ? 'medium' : 'large'} loading={loading}>
                {isEditMode ? 'Update Trade' : 'Execute Trade'}
              </LoadingButton>
            </Stack>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
}
