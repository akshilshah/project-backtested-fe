import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';
import type { Trade, CreateTradeRequest } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { Form } from 'src/components/hook-form';
import { FormCard } from 'src/components/form/form-card';
import { FormActions } from 'src/components/form/form-actions';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { RHFAutocomplete } from 'src/components/hook-form/rhf-autocomplete';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const TradeSchema = z.object({
  coinId: z.number({ message: 'Coin is required' }).min(1, 'Coin is required'),
  strategyId: z.number({ message: 'Strategy is required' }).min(1, 'Strategy is required'),
  tradeDate: z.any().refine((val) => val !== null && val !== undefined, 'Trade date is required'),
  tradeTime: z.any().refine((val) => val !== null && val !== undefined, 'Trade time is required'),
  entryPrice: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Entry price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Entry price must be a positive number'),
  stopLoss: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Stop loss is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Stop loss must be a positive number'),
  quantity: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be a positive number'),
  notes: z.string().optional(),
});

type TradeFormValues = z.infer<typeof TradeSchema>;

type TradesFormProps = {
  currentTrade?: Trade;
  coins: Coin[];
  strategies: Strategy[];
  coinsLoading?: boolean;
  strategiesLoading?: boolean;
  onSubmit: (data: CreateTradeRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function TradesForm({
  currentTrade,
  coins,
  strategies,
  coinsLoading,
  strategiesLoading,
  onSubmit,
  onCancel,
  loading = false,
}: TradesFormProps) {
  const isEdit = !!currentTrade;

  const defaultValues: TradeFormValues = useMemo(
    () => ({
      coinId: currentTrade?.coinId ?? 0,
      strategyId: currentTrade?.strategyId ?? 0,
      tradeDate: currentTrade?.tradeDate ? dayjs(currentTrade.tradeDate) : dayjs(),
      tradeTime: currentTrade?.tradeTime
        ? dayjs(`2000-01-01 ${currentTrade.tradeTime}`)
        : dayjs(),
      entryPrice: currentTrade?.entryPrice?.toString() ?? '',
      stopLoss: currentTrade?.stopLoss?.toString() ?? '',
      quantity: currentTrade?.quantity?.toString() ?? '',
      notes: currentTrade?.notes ?? '',
    }),
    [currentTrade]
  );

  const methods = useForm<TradeFormValues>({
    resolver: zodResolver(TradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, setValue } = methods;

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

  const selectedCoin = coins.find((c) => c.id === Number(coinIdValue)) ?? null;
  const selectedStrategy = strategies.find((s) => s.id === Number(strategyIdValue)) ?? null;

  const handleFormSubmit = handleSubmit(async (data) => {
    const tradeDate = dayjs(data.tradeDate).format('YYYY-MM-DD');
    const tradeTime = dayjs(data.tradeTime).format('HH:mm:ss');

    await onSubmit({
      coinId: Number(data.coinId),
      strategyId: Number(data.strategyId),
      tradeDate,
      tradeTime,
      entryPrice: Number(data.entryPrice),
      stopLoss: Number(data.stopLoss),
      quantity: Number(data.quantity),
      notes: data.notes || undefined,
    });
  });

  // Warning if trade is closed (edit mode)
  if (isEdit && currentTrade?.status === 'CLOSED') {
    return (
      <FormCard title="Edit Trade" subheader="Trade details">
        <Alert severity="warning" sx={{ mb: 3 }}>
          This trade has been closed and cannot be edited. You can only edit open trades.
        </Alert>
        <FormActions onCancel={onCancel} submitText="Save Changes" disabled />
      </FormCard>
    );
  }

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <FormCard
        title={isEdit ? 'Edit Trade' : 'New Trade'}
        subheader={
          isEdit ? 'Update the trade information below' : 'Fill in the details to record a new trade'
        }
      >
        <Grid container spacing={3}>
          {/* Coin Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
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

          {/* Strategy Selection */}
          <Grid size={{ xs: 12, md: 6 }}>
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

          {/* Date & Time */}
          <Grid size={{ xs: 12, md: 6 }}>
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

          <Grid size={{ xs: 12, md: 6 }}>
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

          {/* Entry Price */}
          <Grid size={{ xs: 12, md: 4 }}>
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

          {/* Stop Loss */}
          <Grid size={{ xs: 12, md: 4 }}>
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

          {/* Quantity */}
          <Grid size={{ xs: 12, md: 4 }}>
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

          {/* Risk Amount Display */}
          {riskAmount !== null && (
            <Grid size={{ xs: 12 }}>
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
            </Grid>
          )}

          {/* Notes */}
          <Grid size={{ xs: 12 }}>
            <RHFTextField
              name="notes"
              label="Notes (Optional)"
              multiline
              rows={3}
              placeholder="Add any notes about this trade..."
            />
          </Grid>
        </Grid>

        <FormActions
          onCancel={onCancel}
          submitText={isEdit ? 'Update Trade' : 'Create Trade'}
          loading={loading}
        />
      </FormCard>
    </Form>
  );
}
