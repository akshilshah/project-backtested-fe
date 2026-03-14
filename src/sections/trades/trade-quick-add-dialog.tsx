import type { Coin } from 'src/types/coin';
import type { Strategy } from 'src/types/strategy';

import { z } from 'zod';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import InputAdornment from '@mui/material/InputAdornment';

import { S3_ASSETS_BASE_URL } from 'src/lib/api-endpoints';
import { TradesService } from 'src/services/trades.service';

import { Iconify } from 'src/components/iconify';
import { Form, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const QuickAddTradeSchema = z.object({
  coinId: z.number().min(1, 'Coin is required'),
  strategyId: z.number().min(1, 'Strategy is required'),
  entryDate: z.any().refine((val) => val !== null && val !== undefined, 'Entry date is required'),
  entryTime: z.any().refine((val) => val !== null && val !== undefined, 'Entry time is required'),
  entryPrice: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Entry price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Entry price must be positive'),
  stopLoss: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Stop loss is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Stop loss must be positive'),
  quantity: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Quantity is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Quantity must be positive'),
  entryFeePercentage: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Entry fee must be 0 or more'),
  exitDate: z.any().refine((val) => val !== null && val !== undefined, 'Exit date is required'),
  exitTime: z.any().refine((val) => val !== null && val !== undefined, 'Exit time is required'),
  exitPrice: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Exit price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Exit price must be positive'),
  exitFeePercentage: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Exit fee must be 0 or more'),
  realisedPnl: z
    .union([z.string(), z.number()])
    .optional()
    .refine(
      (val) => val === undefined || val === '' || !isNaN(Number(val)),
      'Realised P&L must be a valid number'
    ),
  notes: z.string().optional(),
});

type QuickAddTradeFormValues = z.infer<typeof QuickAddTradeSchema>;

type TradeQuickAddDialogProps = {
  open: boolean;
  onClose: () => void;
  onAdded: () => void;
  coins: Coin[];
  strategies: Strategy[];
};

const defaultValues: QuickAddTradeFormValues = {
  coinId: 0,
  strategyId: 0,
  entryDate: dayjs(),
  entryTime: dayjs(),
  entryPrice: '',
  stopLoss: '',
  quantity: '',
  entryFeePercentage: 0.02,
  exitDate: dayjs(),
  exitTime: dayjs(),
  exitPrice: '',
  exitFeePercentage: 0.05,
  realisedPnl: '',
  notes: '',
};

export function TradeQuickAddDialog({
  open,
  onClose,
  onAdded,
  coins,
  strategies,
}: TradeQuickAddDialogProps) {
  const [loading, setLoading] = useState(false);

  const methods = useForm<QuickAddTradeFormValues>({
    resolver: zodResolver(QuickAddTradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, reset, setValue } = methods;

  const entryPriceValue = watch('entryPrice');
  const stopLossValue = watch('stopLoss');
  const exitPriceValue = watch('exitPrice');
  const quantityValue = watch('quantity');
  const coinIdValue = watch('coinId');
  const strategyIdValue = watch('strategyId');

  const selectedCoin = coins.find((c) => c.id === Number(coinIdValue)) ?? null;
  const selectedStrategy = strategies.find((s) => s.id === Number(strategyIdValue)) ?? null;

  // Reset form when dialog opens
  useEffect(() => {
    if (open) {
      reset({ ...defaultValues, entryDate: dayjs(), entryTime: dayjs(), exitDate: dayjs(), exitTime: dayjs() });
    }
  }, [open, reset]);

  // Auto-calculate direction
  const direction =
    entryPriceValue && stopLossValue && Number(entryPriceValue) < Number(stopLossValue)
      ? 'Short'
      : 'Long';

  // Auto-calculate R value
  let rValue: number | null = null;
  if (entryPriceValue && stopLossValue && exitPriceValue) {
    const entry = Number(entryPriceValue);
    const sl = Number(stopLossValue);
    const exit = Number(exitPriceValue);
    if (direction === 'Long') {
      const risk = entry - sl;
      rValue = risk !== 0 ? (exit - entry) / risk : 0;
    } else {
      const risk = sl - entry;
      rValue = risk !== 0 ? (entry - exit) / risk : 0;
    }
  }

  // Auto-calculate position size
  const positionSize =
    entryPriceValue && quantityValue
      ? Number(entryPriceValue) * Number(quantityValue)
      : null;

  const handleFormSubmit = handleSubmit(async (data) => {
    try {
      setLoading(true);

      const entry = Number(data.entryPrice);
      const sl = Number(data.stopLoss);
      const qty = Number(data.quantity);
      const stopLossPercentage = Math.abs((entry - sl) / entry) * 100;
      const amount = entry * qty;

      const tradeDate = dayjs(data.entryDate).format('YYYY-MM-DD');
      const parsedEntryTime = dayjs(data.entryTime);
      const tradeTime = parsedEntryTime.isValid()
        ? parsedEntryTime.format('HH:mm:ss')
        : dayjs().format('HH:mm:ss');

      // Step 1: Create trade
      const created = await TradesService.create({
        coinId: data.coinId,
        strategyId: data.strategyId,
        tradeDate,
        tradeTime,
        avgEntry: entry,
        stopLoss: sl,
        stopLossPercentage,
        quantity: qty,
        amount,
        entryOrderType: 'LIMIT',
        entryFeePercentage: Number(data.entryFeePercentage),
        notes: data.notes || undefined,
      });

      const exitDate = dayjs(data.exitDate).format('YYYY-MM-DD');
      const parsedExitTime = dayjs(data.exitTime);
      const exitTime = parsedExitTime.isValid()
        ? parsedExitTime.format('HH:mm:ss')
        : dayjs().format('HH:mm:ss');

      // Step 2: Exit trade
      await TradesService.exit(created.id, {
        avgExit: Number(data.exitPrice),
        exitDate,
        exitTime,
        exitFeePercentage: Number(data.exitFeePercentage),
      });

      // Step 3: Save realised P&L if provided
      if (data.realisedPnl !== undefined && data.realisedPnl !== '') {
        await TradesService.update(created.id, { realisedPnl: Number(data.realisedPnl) });
      }

      toast.success('Trade added successfully');
      onAdded();

      // Reset form but keep coin/strategy selection and dates
      reset({
        ...defaultValues,
        coinId: data.coinId,
        strategyId: data.strategyId,
        entryDate: dayjs(),
        entryTime: dayjs(),
        exitDate: dayjs(),
        exitTime: dayjs(),
      });
    } catch (err: any) {
      const message = err?.response?.data?.message || 'Failed to add trade';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: 'primary.lighter',
            }}
          >
            <Iconify icon="mingcute:add-line" width={20} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Quick Add Trade
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Entry and exit in one step — form clears after adding
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={2.5}>
            {/* Coin & Strategy */}
            <Stack direction="row" spacing={2}>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <RHFAutocomplete
                  name="coinId"
                  label="Coin"
                  placeholder="Select coin"
                  options={coins}
                  value={selectedCoin}
                  onChange={(_: any, newValue: Coin | null) => {
                    setValue('coinId', newValue?.id ?? 0, { shouldValidate: true });
                  }}
                  getOptionLabel={(option: Coin) => `${option.symbol} - ${option.name}`}
                  isOptionEqualToValue={(option: Coin, value: Coin) => option.id === value.id}
                  renderOption={(props: any, option: Coin) => (
                    <Box component="li" {...props} key={option.id}>
                      <Stack direction="row" alignItems="center" spacing={1.5}>
                        <Avatar
                          src={option.image ? `${S3_ASSETS_BASE_URL}/${option.image}` : undefined}
                          alt={option.symbol}
                          sx={{ width: 24, height: 24, borderRadius: 0.5, fontSize: '0.6rem', fontWeight: 700 }}
                        >
                          {!option.image && option.symbol.slice(0, 2)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>{option.symbol}</Typography>
                          <Typography variant="caption" color="text.secondary">{option.name}</Typography>
                        </Box>
                      </Stack>
                    </Box>
                  )}
                />
              </Box>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <RHFAutocomplete
                  name="strategyId"
                  label="Strategy"
                  placeholder="Select strategy"
                  options={strategies}
                  value={selectedStrategy}
                  onChange={(_: any, newValue: Strategy | null) => {
                    setValue('strategyId', newValue?.id ?? 0, { shouldValidate: true });
                  }}
                  getOptionLabel={(option: Strategy) => option.name}
                  isOptionEqualToValue={(option: Strategy, value: Strategy) => option.id === value.id}
                />
              </Box>
            </Stack>

            {/* Entry Section */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Entry
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={2}>
                  <RHFDatePicker
                    name="entryDate"
                    label="Entry Date"
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                  <RHFTimePicker
                    name="entryTime"
                    label="Entry Time"
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <RHFTextField
                    name="entryPrice"
                    label="Entry Price"
                    type="number"
                    size="small"
                    slotProps={{
                      input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                      htmlInput: { step: '0.00000001', min: '0' },
                    }}
                  />
                  <RHFTextField
                    name="stopLoss"
                    label="Stop Loss"
                    type="number"
                    size="small"
                    slotProps={{
                      input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                      htmlInput: { step: '0.00000001', min: '0' },
                    }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <RHFTextField
                    name="quantity"
                    label="Quantity"
                    type="number"
                    size="small"
                    slotProps={{ htmlInput: { step: '0.00000001', min: '0' } }}
                  />
                  <RHFTextField
                    name="entryFeePercentage"
                    label="Entry Fee"
                    type="number"
                    size="small"
                    slotProps={{
                      input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                      htmlInput: { step: '0.01', min: '0' },
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            <Divider />

            {/* Exit Section */}
            <Box>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Exit
              </Typography>
              <Stack spacing={1.5} sx={{ mt: 1 }}>
                <Stack direction="row" spacing={2}>
                  <RHFDatePicker
                    name="exitDate"
                    label="Exit Date"
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                  <RHFTimePicker
                    name="exitTime"
                    label="Exit Time"
                    slotProps={{ textField: { fullWidth: true, size: 'small' } }}
                  />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <RHFTextField
                    name="exitPrice"
                    label="Exit Price"
                    type="number"
                    size="small"
                    slotProps={{
                      input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                      htmlInput: { step: '0.00000001', min: '0' },
                    }}
                  />
                  <RHFTextField
                    name="exitFeePercentage"
                    label="Exit Fee"
                    type="number"
                    size="small"
                    slotProps={{
                      input: { endAdornment: <InputAdornment position="end">%</InputAdornment> },
                      htmlInput: { step: '0.01', min: '0' },
                    }}
                  />
                </Stack>
              </Stack>
            </Box>

            {/* Direction / R preview */}
            {rValue !== null && (
              <Alert
                severity={rValue >= 0 ? 'success' : 'error'}
                icon={false}
                sx={{ '& .MuiAlert-message': { width: '100%' } }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Stack spacing={0.25}>
                    <Typography variant="body2" fontWeight={600}>
                      {direction} &nbsp;·&nbsp;{' '}
                      {positionSize
                        ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(positionSize)
                        : null}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Direction &nbsp;·&nbsp; Position Size
                    </Typography>
                  </Stack>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      fontWeight={700}
                      sx={{ color: rValue >= 0 ? 'success.dark' : 'error.dark' }}
                    >
                      {rValue >= 0 ? '+' : ''}{rValue.toFixed(2)}R
                    </Typography>
                    <Typography variant="caption" color="text.secondary">R value</Typography>
                  </Box>
                </Stack>
              </Alert>
            )}

            <Divider />

            {/* Optional fields */}
            <Stack spacing={1.5}>
              <RHFTextField
                name="realisedPnl"
                label="Realised P&L (from exchange)"
                type="number"
                size="small"
                slotProps={{
                  input: { startAdornment: <InputAdornment position="start">$</InputAdornment> },
                  htmlInput: { step: '0.01' },
                }}
              />
              <RHFTextField
                name="notes"
                label="Notes"
                multiline
                rows={2}
                size="small"
                placeholder="Add any trade notes..."
              />
            </Stack>
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
            Close
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add Trade
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
