import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { Trade, CreateTradeRequest } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Collapse from '@mui/material/Collapse';
import TextField from '@mui/material/TextField';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import ToggleButton from '@mui/material/ToggleButton';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import useMediaQuery from '@mui/material/useMediaQuery';
import InputAdornment from '@mui/material/InputAdornment';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
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

// Result Card Component
function ResultCard({
  label,
  value,
  subtitle,
  primary = false,
  icon,
}: {
  label: string;
  value: string;
  subtitle?: string;
  primary?: boolean;
  icon?: string;
}) {
  return (
    <Box
      sx={{
        p: primary ? 2.5 : 2,
        borderRadius: 2,
        bgcolor: (theme) =>
          primary
            ? theme.palette.mode === 'dark'
              ? 'rgba(99, 102, 241, 0.12)'
              : 'rgba(99, 102, 241, 0.06)'
            : theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.02)',
        border: (theme) =>
          primary
            ? `1px solid ${theme.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.3)' : 'rgba(99, 102, 241, 0.2)'}`
            : `1px solid ${theme.palette.divider}`,
        transition: 'all 0.2s ease-in-out',
      }}
    >
      <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
        <Box>
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: 0.5,
              fontSize: '0.65rem',
            }}
          >
            {label}
          </Typography>
          <Typography
            variant={primary ? 'h4' : 'h6'}
            sx={{
              fontWeight: 700,
              color: primary ? 'primary.main' : 'text.primary',
              mt: 0.5,
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {value}
          </Typography>
          {subtitle && (
            <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.7rem' }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {icon && (
          <Box
            sx={{
              width: 36,
              height: 36,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (theme) =>
                primary
                  ? theme.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(99, 102, 241, 0.12)'
                  : theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
            }}
          >
            <Iconify
              icon={icon as any}
              width={20}
              sx={{ color: primary ? 'primary.main' : 'text.secondary' }}
            />
          </Box>
        )}
      </Stack>
    </Box>
  );
}

// Input Field Component with premium styling
function CalculatorInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  placeholder,
  step,
  size = 'medium',
}: {
  label: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  prefix?: string;
  suffix?: string;
  placeholder?: string;
  step?: string;
  size?: 'small' | 'medium';
}) {
  return (
    <TextField
      fullWidth
      label={label}
      value={value}
      onChange={onChange}
      type="number"
      placeholder={placeholder}
      size={size}
      sx={{
        '& .MuiOutlinedInput-root': {
          bgcolor: (theme) =>
            theme.palette.mode === 'dark'
              ? 'rgba(255, 255, 255, 0.04)'
              : 'rgba(0, 0, 0, 0.02)',
          '&:hover': {
            bgcolor: (theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.06)'
                : 'rgba(0, 0, 0, 0.03)',
          },
          '&.Mui-focused': {
            bgcolor: 'transparent',
          },
        },
      }}
      slotProps={{
        input: {
          ...(prefix && { startAdornment: <InputAdornment position="start">{prefix}</InputAdornment> }),
          ...(suffix && { endAdornment: <InputAdornment position="end">{suffix}</InputAdornment> }),
        },
        htmlInput: {
          step: step || 'any',
        },
      }}
    />
  );
}

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
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  const [entry, setEntry] = useState<string>('');
  const [stopLoss, setStopLoss] = useState<string>('');
  const [account, setAccount] = useState<string>('');
  const [stopLossPercentage, setStopLossPercentage] = useState<string>('1.8');
  const [entryOrderType, setEntryOrderType] = useState<'MARKET' | 'LIMIT'>('LIMIT');
  const [entryFeePercentage, setEntryFeePercentage] = useState<string>('0.02');
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
      setEntryOrderType(currentTrade.entryOrderType);
      setEntryFeePercentage(currentTrade.entryFeePercentage.toString());
      setShowTradeForm(true);
    }
  }, [currentTrade, isEditMode]);

  // Update entry fee when order type changes
  const handleOrderTypeChange = (newOrderType: 'MARKET' | 'LIMIT') => {
    setEntryOrderType(newOrderType);
    setEntryFeePercentage(newOrderType === 'MARKET' ? '0.05' : '0.02');
  };

  // Calculate Stop Loss Amount
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
    return (tradeValue / accountValue).toFixed(2);
  }, [calculateTradeValue, account]);

  // Calculate Quantity
  const calculateQuantity = useCallback(() => {
    const tradeValue = parseFloat(calculateTradeValue()) || 0;
    const entryValue = parseFloat(entry) || 0;

    if (entryValue === 0) return 0;
    return tradeValue / entryValue;
  }, [calculateTradeValue, entry]);

  const handleTakeTradeClick = () => setShowTradeForm(true);

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
        entryOrderType,
        entryFeePercentage: Number(entryFeePercentage),
      });

      // Reset form
      setShowTradeForm(false);
      methods.reset(defaultValues);
      setEntry('');
      setStopLoss('');
      setAccount('');
      setStopLossPercentage('1.8');
      setEntryOrderType('LIMIT');
      setEntryFeePercentage('0.02');
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

  const hasValidInput = entry && stopLoss && account && Number(tradeValue) > 0;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth fullScreen={isMobile}>
      <DialogTitle
        sx={{
          pb: 1,
          px: { xs: 2, sm: 3 },
          borderBottom: (t) => `1px solid ${t.palette.divider}`,
          bgcolor: (t) =>
            t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 1.5,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              bgcolor: (t) =>
                t.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(99, 102, 241, 0.1)',
            }}
          >
            <Iconify icon={"solar:calculator-bold" as any} width={22} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {isEditMode ? 'Edit Trade' : 'Position Calculator'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {isEditMode ? 'Update trade details' : 'Calculate position size and risk'}
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent sx={{ p: { xs: 2, sm: 3 } }}>
          <Grid container spacing={3}>
            {/* Left Column - Inputs */}
            <Grid size={{ xs: 12, md: 5 }}>
              <Stack spacing={2.5}>
                {/* Price Inputs */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.65rem',
                      mb: 1.5,
                      display: 'block',
                    }}
                  >
                    Price Levels
                  </Typography>
                  <Stack spacing={1.5}>
                    <CalculatorInput
                      label="Entry Price"
                      value={entry}
                      onChange={(e) => setEntry(e.target.value)}
                      prefix="$"
                      placeholder="0.00"
                      step="0.00000001"
                      size={isMobile ? 'small' : 'medium'}
                    />
                    <CalculatorInput
                      label="Stop Loss"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(e.target.value)}
                      prefix="$"
                      placeholder="0.00"
                      step="0.00000001"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Stack>
                </Box>

                {/* Account & Risk */}
                <Box>
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.65rem',
                      mb: 1.5,
                      display: 'block',
                    }}
                  >
                    Risk Management
                  </Typography>
                  <Stack spacing={1.5}>
                    <CalculatorInput
                      label="Account Balance"
                      value={account}
                      onChange={(e) => setAccount(e.target.value)}
                      prefix="$"
                      placeholder="10000"
                      step="0.01"
                      size={isMobile ? 'small' : 'medium'}
                    />
                    <CalculatorInput
                      label="Risk per Trade"
                      value={stopLossPercentage}
                      onChange={(e) => setStopLossPercentage(e.target.value)}
                      suffix="%"
                      placeholder="1.8"
                      step="0.1"
                      size={isMobile ? 'small' : 'medium'}
                    />
                  </Stack>
                </Box>
              </Stack>
            </Grid>

            {/* Right Column - Results */}
            <Grid size={{ xs: 12, md: 7 }}>
              <Box
                sx={{
                  height: '100%',
                  p: { xs: 2, sm: 2.5 },
                  borderRadius: 2,
                  bgcolor: (t) =>
                    t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
                  border: (t) => `1px solid ${t.palette.divider}`,
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    letterSpacing: 0.5,
                    fontSize: '0.65rem',
                    mb: 2,
                    display: 'block',
                  }}
                >
                  Calculated Results
                </Typography>

                <Stack spacing={2}>
                  {/* Primary Results */}
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <ResultCard
                        label="Position Size"
                        value={hasValidInput ? `$${Number(tradeValue).toLocaleString()}` : '-'}
                        subtitle="Total value"
                        primary
                        icon="solar:wallet-bold"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <ResultCard
                        label="Quantity"
                        value={hasValidInput ? quantity.toFixed(4) : '-'}
                        subtitle="Units to buy"
                        primary
                        icon="solar:box-bold"
                      />
                    </Grid>
                  </Grid>

                  {/* Secondary Results */}
                  <Grid container spacing={1.5}>
                    <Grid size={{ xs: 6 }}>
                      <ResultCard
                        label="Risk Amount"
                        value={hasValidInput ? `$${riskAmount}` : '-'}
                        subtitle={`${stopLossPercentage || '0'}% of account`}
                        icon="solar:shield-warning-bold"
                      />
                    </Grid>
                    <Grid size={{ xs: 6 }}>
                      <ResultCard
                        label="Leverage"
                        value={hasValidInput ? `${leverage}x` : '-'}
                        subtitle="Position leverage"
                        icon="solar:scale-bold"
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Box>
            </Grid>

            {/* Trade Form Section */}
            <Grid size={{ xs: 12 }}>
              <Collapse in={showTradeForm}>
                <Box
                  sx={{
                    p: { xs: 2, sm: 2.5 },
                    borderRadius: 2,
                    bgcolor: (t) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.02)'
                        : 'rgba(0, 0, 0, 0.01)',
                    border: (t) => `1px solid ${t.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{
                      color: 'text.secondary',
                      fontWeight: 600,
                      textTransform: 'uppercase',
                      letterSpacing: 0.5,
                      fontSize: '0.65rem',
                      mb: 2,
                      display: 'block',
                    }}
                  >
                    Trade Details
                  </Typography>

                  <Grid container spacing={2}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <RHFAutocomplete
                        name="coinId"
                        label="Coin"
                        placeholder="Select coin"
                        options={coins}
                        loading={coinsLoading}
                        value={selectedCoin}
                        onChange={(_: any, newValue: Coin | null) => {
                          setValue('coinId', newValue?.id ?? 0, { shouldValidate: true });
                        }}
                        getOptionLabel={(option: Coin) => `${option.symbol} - ${option.name}`}
                        isOptionEqualToValue={(option: Coin, value: Coin) => option.id === value.id}
                        slotProps={{ textField: { size: isMobile ? 'small' : 'medium' } }}
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
                                  bgcolor: (t) =>
                                    t.palette.mode === 'dark'
                                      ? 'rgba(99, 102, 241, 0.16)'
                                      : 'rgba(99, 102, 241, 0.1)',
                                  color: 'primary.main',
                                  fontWeight: 600,
                                  fontSize: '0.7rem',
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
                        placeholder="Select strategy"
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
                        slotProps={{ textField: { size: isMobile ? 'small' : 'medium' } }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <RHFDatePicker
                        name="tradeDate"
                        label="Date"
                        slotProps={{
                          textField: { fullWidth: true, size: isMobile ? 'small' : 'medium' },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, sm: 3 }}>
                      <RHFTimePicker
                        name="tradeTime"
                        label="Time"
                        slotProps={{
                          textField: { fullWidth: true, size: isMobile ? 'small' : 'medium' },
                        }}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <Stack spacing={1}>
                        <Typography
                          variant="caption"
                          sx={{
                            color: 'text.secondary',
                            fontWeight: 500,
                            fontSize: '0.7rem',
                          }}
                        >
                          Order Type
                        </Typography>
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <ToggleButtonGroup
                            value={entryOrderType}
                            exclusive
                            onChange={(_, newValue) => {
                              if (newValue !== null) handleOrderTypeChange(newValue);
                            }}
                            size="small"
                            sx={{
                              bgcolor: (t) =>
                                t.palette.mode === 'dark'
                                  ? 'rgba(255, 255, 255, 0.04)'
                                  : 'rgba(0, 0, 0, 0.02)',
                              '& .MuiToggleButton-root': {
                                border: 'none',
                                px: 2,
                                py: 0.625,
                                fontSize: '0.75rem',
                                fontWeight: 500,
                                '&.Mui-selected': {
                                  bgcolor: (t) =>
                                    t.palette.mode === 'dark'
                                      ? 'rgba(99, 102, 241, 0.16)'
                                      : 'rgba(99, 102, 241, 0.12)',
                                  color: 'primary.main',
                                },
                              },
                            }}
                          >
                            <ToggleButton value="LIMIT">Limit</ToggleButton>
                            <ToggleButton value="MARKET">Market</ToggleButton>
                          </ToggleButtonGroup>
                          <TextField
                            label="Fee"
                            value={entryFeePercentage}
                            onChange={(e) => setEntryFeePercentage(e.target.value)}
                            type="number"
                            size="small"
                            sx={{ width: 100 }}
                            slotProps={{
                              input: {
                                endAdornment: <InputAdornment position="end">%</InputAdornment>,
                              },
                              htmlInput: { step: '0.01', min: '0' },
                            }}
                          />
                        </Stack>
                      </Stack>
                    </Grid>
                  </Grid>
                </Box>
              </Collapse>
            </Grid>
          </Grid>
        </DialogContent>

        <Divider />

        <DialogActions
          sx={{
            p: { xs: 1.5, sm: 2 },
            gap: 1,
            bgcolor: (t) =>
              t.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.02)' : 'rgba(0, 0, 0, 0.01)',
          }}
        >
          <Button variant="outlined" color="inherit" onClick={onClose} size={isMobile ? 'medium' : 'large'}>
            Close
          </Button>
          {!showTradeForm ? (
            <Button
              variant="contained"
              size={isMobile ? 'medium' : 'large'}
              onClick={handleTakeTradeClick}
              disabled={!hasValidInput}
              startIcon={<Iconify icon={"solar:arrow-right-bold" as any} />}
            >
              {isEditMode ? 'Continue' : 'Take Trade'}
            </Button>
          ) : (
            <Stack direction="row" spacing={1}>
              <Button variant="outlined" onClick={handleCancelTrade} size={isMobile ? 'medium' : 'large'}>
                Back
              </Button>
              <LoadingButton
                type="submit"
                variant="contained"
                size={isMobile ? 'medium' : 'large'}
                loading={loading}
                startIcon={<Iconify icon="solar:check-circle-bold" />}
              >
                {isEditMode ? 'Update Trade' : 'Execute Trade'}
              </LoadingButton>
            </Stack>
          )}
        </DialogActions>
      </Form>
    </Dialog>
  );
}
