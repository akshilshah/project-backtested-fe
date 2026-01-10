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
import Alert from '@mui/material/Alert';
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
  coinId: z.string().min(1, 'Coin is required'),
  strategyId: z.string().min(1, 'Strategy is required'),
  tradeDate: z.any().refine((val) => val !== null && val !== undefined, 'Trade date is required'),
  tradeTime: z.any().refine((val) => val !== null && val !== undefined, 'Trade time is required'),
  entryPrice: z
    .string()
    .min(1, 'Entry price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Entry price must be a positive number'),
  stopLoss: z
    .string()
    .min(1, 'Stop loss is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Stop loss must be a positive number'),
  quantity: z
    .string()
    .min(1, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be a positive number'),
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
    coinId: '',
    strategyId: '',
    tradeDate: dayjs(),
    tradeTime: dayjs(),
    entryPrice: '',
    stopLoss: '',
    quantity: '',
    notes: '',
  };

  const methods = useForm<TradeFormValues>({
    resolver: zodResolver(TradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, setValue, reset } = methods;

  const entryPriceValue = watch('entryPrice');
  const stopLossValue = watch('stopLoss');
  const quantityValue = watch('quantity');
  const coinIdValue = watch('coinId');
  const strategyIdValue = watch('strategyId');

  // Calculate risk amount
  const riskAmount = useMemo(() => {
    const entry = Number(entryPriceValue);
    const sl = Number(stopLossValue);
    const qty = Number(quantityValue);

    if (!entry || !sl || !qty || isNaN(entry) || isNaN(sl) || isNaN(qty)) {
      return null;
    }

    return Math.abs(entry - sl) * qty;
  }, [entryPriceValue, stopLossValue, quantityValue]);

  const selectedCoin = coins.find((c) => c.id === coinIdValue) ?? null;
  const selectedStrategy = strategies.find((s) => s.id === strategyIdValue) ?? null;

  const handleFormSubmit = handleSubmit(async (data) => {
    const tradeDate = dayjs(data.tradeDate).format('YYYY-MM-DD');
    const tradeTime = dayjs(data.tradeTime).format('HH:mm');

    await onSubmit({
      coinId: data.coinId,
      strategyId: data.strategyId,
      tradeDate,
      tradeTime,
      entryPrice: Number(data.entryPrice),
      stopLoss: Number(data.stopLoss),
      quantity: Number(data.quantity),
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
                    setValue('coinId', newValue?.id ?? '', { shouldValidate: true });
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
                    setValue('strategyId', newValue?.id ?? '', { shouldValidate: true });
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

            {/* Entry Price, Stop Loss, Quantity */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 4 }}>
                <RHFTextField
                  name="entryPrice"
                  label="Entry Price"
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
            </Grid>

            {/* Risk Amount Display */}
            {riskAmount !== null && (
              <Alert severity="info" icon={false}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">Risk Amount</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700 }}>
                    {new Intl.NumberFormat('en-US', {
                      style: 'currency',
                      currency: 'USD',
                    }).format(riskAmount)}
                  </Typography>
                </Stack>
              </Alert>
            )}

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
