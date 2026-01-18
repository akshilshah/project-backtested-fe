import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { CreateTradeRequest } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Form } from 'src/components/hook-form';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { RHFAutocomplete } from 'src/components/hook-form/rhf-autocomplete';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const TradeSchema = z.object({
  coinId: z.number({ message: 'Coin is required' }).min(1, 'Coin is required'),
  strategyId: z.number({ message: 'Strategy is required' }).min(1, 'Strategy is required'),
  tradeDate: z.any().refine((val) => val !== null && val !== undefined, 'Trade date is required'),
  tradeTime: z.any().refine((val) => val !== null && val !== undefined, 'Trade time is required'),
  avgEntry: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Average entry is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Average entry must be a positive number'),
  stopLoss: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Stop loss is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Stop loss must be a positive number'),
  stopLossPercentage: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Stop loss percentage is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Stop loss percentage must be a positive number'),
  quantity: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be a positive number'),
  amount: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Amount is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Amount must be a positive number'),
  notes: z.string().optional(),
});

type TradeFormValues = z.infer<typeof TradeSchema>;

type TradeCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateTradeRequest) => Promise<void>;
  coins: Coin[];
  strategies: Strategy[];
  coinsLoading?: boolean;
  strategiesLoading?: boolean;
  loading?: boolean;
};

export function TradeCreateDialog({
  open,
  onClose,
  onSubmit,
  coins,
  strategies,
  coinsLoading,
  strategiesLoading,
  loading = false,
}: TradeCreateDialogProps) {
  const defaultValues: TradeFormValues = {
    coinId: 0,
    strategyId: 0,
    tradeDate: dayjs(),
    tradeTime: dayjs(),
    avgEntry: '',
    stopLoss: '',
    stopLossPercentage: '1.8',
    quantity: '',
    amount: '',
    notes: '',
  };

  const methods = useForm<TradeFormValues>({
    resolver: zodResolver(TradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, setValue, reset } = methods;

  const avgEntryValue = watch('avgEntry');
  const stopLossValue = watch('stopLoss');
  const quantityValue = watch('quantity');
  const coinIdValue = watch('coinId');
  const strategyIdValue = watch('strategyId');

  // Calculate risk amount
  const _riskAmount = useMemo(() => {
    const entry = Number(avgEntryValue);
    const sl = Number(stopLossValue);
    const qty = Number(quantityValue);

    if (!entry || !sl || !qty || isNaN(entry) || isNaN(sl) || isNaN(qty)) {
      return null;
    }

    return Math.abs(entry - sl) * qty;
  }, [avgEntryValue, stopLossValue, quantityValue]);

  const selectedCoin = coins.find((c) => c.id === Number(coinIdValue)) ?? null;
  const selectedStrategy = strategies.find((s) => s.id === Number(strategyIdValue)) ?? null;

  const handleFormSubmit = handleSubmit(async (data) => {
    const tradeDate = dayjs(data.tradeDate).format('YYYY-MM-DD');
    const tradeTime = dayjs(data.tradeTime).format('HH:mm:ss');

    await onSubmit({
      coinId: data.coinId,
      strategyId: data.strategyId,
      tradeDate,
      tradeTime,
      avgEntry: Number(data.avgEntry),
      stopLoss: Number(data.stopLoss),
      stopLossPercentage: Number(data.stopLossPercentage),
      quantity: Number(data.quantity),
      amount: Number(data.amount),
      entryOrderType: 'LIMIT',
      entryFeePercentage: 0.02,
      notes: data.notes || undefined,
    });

    reset(defaultValues);
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>New Trade</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Coin & Strategy Selection */}
            <Grid container spacing={2}>
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
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {option.symbol}
                          </Typography>
                          <Typography variant="caption" sx={{ color: 'text.secondary' }}>
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
                  isOptionEqualToValue={(option: Strategy, value: Strategy) => option.id === value.id}
                />
              </Grid>
            </Grid>

            {/* Date & Time */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFDatePicker
                name="tradeDate"
                label="Trade Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              <RHFTimePicker
                name="tradeTime"
                label="Trade Time"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Stack>

            {/* Avg Entry, Stop Loss, Stop Loss % */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField
                  name="avgEntry"
                  label="Avg Entry"
                  type="number"
                  placeholder="0.00"
                  slotProps={{
                    htmlInput: {
                      step: '0.00000001',
                      min: '0',
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField
                  name="stopLoss"
                  label="Stop Loss"
                  type="number"
                  placeholder="0.00"
                  slotProps={{
                    htmlInput: {
                      step: '0.00000001',
                      min: '0',
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField
                  name="stopLossPercentage"
                  label="Stop Loss %"
                  type="number"
                  placeholder="1.8"
                  slotProps={{
                    htmlInput: {
                      step: '0.1',
                      min: '0',
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Quantity, Amount */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="quantity"
                  label="Quantity"
                  type="number"
                  placeholder="0"
                  slotProps={{
                    htmlInput: {
                      step: '0.00000001',
                      min: '0',
                    },
                  }}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 6 }}>
                <RHFTextField
                  name="amount"
                  label="Amount (Account Balance)"
                  type="number"
                  placeholder="0.00"
                  slotProps={{
                    htmlInput: {
                      step: '0.01',
                      min: '0',
                    },
                  }}
                />
              </Grid>
            </Grid>

            {/* Notes */}
            <RHFTextField
              name="notes"
              label="Notes (Optional)"
              multiline
              rows={3}
              placeholder="Add any notes about this trade..."
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading}>
            Create Trade
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
