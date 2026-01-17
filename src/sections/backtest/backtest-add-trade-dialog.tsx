import { z } from 'zod';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { toast } from 'sonner';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import type { Coin } from 'src/types/coin';
import type { BacktestTrade, CreateBacktestTradeRequest } from 'src/types/backtest';

import LoadingButton from '@mui/lab/LoadingButton';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { CoinsService } from 'src/services/coins.service';

import { Form, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const FORM_STORAGE_KEY = 'backtest-add-trade-form';

const AddTradeSchema = z.object({
  coinId: z.number().min(1, 'Coin is required'),
  date: z.any().refine((val) => val !== null && val !== undefined, 'Date is required'),
  time: z.any().refine((val) => val !== null && val !== undefined, 'Time is required'),
  entry: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Entry price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Entry price must be positive'),
  sl: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Stop loss is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Stop loss must be positive'),
  exit: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Exit price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Exit price must be positive'),
});

type AddTradeFormValues = z.infer<typeof AddTradeSchema>;

type BacktestAddTradeDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (data: CreateBacktestTradeRequest) => Promise<void>;
  strategyId: number;
  editingTrade?: BacktestTrade | null;
  loading?: boolean;
};

export function BacktestAddTradeDialog({
  open,
  onClose,
  onConfirm,
  strategyId,
  editingTrade,
  loading = false,
}: BacktestAddTradeDialogProps) {
  // Fetch coins for dropdown
  const { data: coinsData } = useSWR('coins-all', () => CoinsService.getAll({ limit: 100 }));

  const coins = coinsData?.coins ?? [];

  // Try to load saved form data from localStorage
  const getSavedFormData = (): AddTradeFormValues | null => {
    try {
      const saved = localStorage.getItem(FORM_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Convert date/time strings back to dayjs objects
        return {
          ...parsed,
          date: parsed.date ? dayjs(parsed.date) : dayjs(),
          time: parsed.time ? dayjs(parsed.time) : dayjs(),
        };
      }
    } catch (error) {
      console.error('Failed to load saved form data:', error);
    }
    return null;
  };

  const defaultValues: AddTradeFormValues = {
    coinId: 0,
    date: dayjs(),
    time: dayjs(),
    entry: '',
    sl: '',
    exit: '',
  };

  // If editing, use editingTrade data, otherwise use saved data or defaults
  const getInitialValues = (): AddTradeFormValues => {
    if (editingTrade) {
      // Parse the time properly - tradeTime is in "HH:mm:ss" format
      const timeStr = editingTrade.tradeTime;
      // Create a dayjs object with today's date and the trade time
      const timeParts = timeStr.split(':');
      const timeObj = dayjs()
        .hour(parseInt(timeParts[0], 10))
        .minute(parseInt(timeParts[1], 10))
        .second(parseInt(timeParts[2] || '0', 10));

      return {
        coinId: editingTrade.coinId,
        date: dayjs(editingTrade.tradeDate),
        time: timeObj,
        entry: editingTrade.entry,
        sl: editingTrade.stopLoss,
        exit: editingTrade.exit,
      };
    }
    const savedData = getSavedFormData();
    return savedData || defaultValues;
  };

  const initialValues = getInitialValues();

  const methods = useForm<AddTradeFormValues>({
    resolver: zodResolver(AddTradeSchema),
    defaultValues: initialValues,
  });

  const { handleSubmit, watch, reset, setValue } = methods;

  const entryValue = watch('entry');
  const slValue = watch('sl');
  const exitValue = watch('exit');
  const coinIdValue = watch('coinId');

  // Watch all form values
  const allValues = watch();

  // Find selected coin object from coins array
  const selectedCoin = coins.find((c) => c.id === Number(coinIdValue)) ?? null;

  // Reset form when editingTrade changes or dialog opens
  useEffect(() => {
    if (open) {
      const newValues = getInitialValues();
      reset(newValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, editingTrade]);

  // Save form data to localStorage whenever it changes (only for new trades, not editing)
  useEffect(() => {
    if (open && !editingTrade) {
      // Only save if dialog is open and we have some data
      const hasData =
        allValues.coinId ||
        allValues.entry ||
        allValues.sl ||
        allValues.exit;

      if (hasData) {
        try {
          // Convert dayjs objects to ISO strings for storage
          const dataToSave = {
            ...allValues,
            date: allValues.date ? dayjs(allValues.date).toISOString() : null,
            time: allValues.time ? dayjs(allValues.time).toISOString() : null,
          };
          localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(dataToSave));
        } catch (error) {
          console.error('Failed to save form data:', error);
        }
      }
    }
  }, [allValues, open, editingTrade]);

  // Clear saved form data from localStorage
  const clearSavedData = () => {
    try {
      localStorage.removeItem(FORM_STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear saved form data:', error);
    }
  };

  // Calculate direction (auto)
  const direction =
    entryValue && slValue && Number(entryValue) < Number(slValue) ? 'Short' : 'Long';

  // Calculate R+/- (auto)
  let rValue: number | null = null;
  if (entryValue && slValue && exitValue) {
    const entry = Number(entryValue);
    const sl = Number(slValue);
    const exit = Number(exitValue);

    if (direction === 'Long') {
      const riskPerUnit = entry - sl;
      const rewardPerUnit = exit - entry;
      rValue = riskPerUnit !== 0 ? rewardPerUnit / riskPerUnit : 0;
    } else {
      // Short
      const riskPerUnit = sl - entry;
      const rewardPerUnit = entry - exit;
      rValue = riskPerUnit !== 0 ? rewardPerUnit / riskPerUnit : 0;
    }
  }

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!strategyId) {
      toast.error('Strategy ID is missing. Please try again.');
      console.error('Strategy ID is missing:', { strategyId, data });
      return;
    }

    const tradeDate = dayjs(data.date).format('YYYY-MM-DD');
    const tradeTime = dayjs(data.time).format('HH:mm:ss');

    await onConfirm({
      strategyId,
      coinId: data.coinId,
      tradeDate,
      tradeTime,
      entry: Number(data.entry),
      stopLoss: Number(data.sl),
      exit: Number(data.exit),
    });

    // Clear saved form data after successful submission (only for new trades)
    if (!editingTrade) {
      clearSavedData();
    }
    reset(defaultValues);
  });

  const handleClose = () => {
    // Clear saved form data when user explicitly closes the dialog (only for new trades)
    if (!editingTrade) {
      clearSavedData();
    }
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>{editingTrade ? 'Edit Backtest Trade' : 'Add Backtest Trade'}</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Coin Selection */}
            <RHFAutocomplete
              name="coinId"
              label="Coin"
              placeholder="Select a coin"
              options={coins}
              value={selectedCoin}
              onChange={(_: any, newValue: Coin | null) => {
                setValue('coinId', newValue?.id ?? 0, { shouldValidate: true });
              }}
              getOptionLabel={(option: Coin) => `${option.symbol} - ${option.name}`}
              isOptionEqualToValue={(option: Coin, value: Coin) => option.id === value.id}
            />

            {/* Date and Time */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFDatePicker
                name="date"
                label="Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              <RHFTimePicker
                name="time"
                label="Time"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Stack>

            {/* Entry and Stop Loss */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFTextField
                name="entry"
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
              <RHFTextField
                name="sl"
                label="Stop Loss (SL 70)"
                type="number"
                placeholder="0.00"
                slotProps={{
                  htmlInput: {
                    step: '0.00000001',
                    min: '0',
                  },
                }}
              />
            </Stack>

            {/* Exit Price */}
            <RHFTextField
              name="exit"
              label="Exit Price"
              type="number"
              placeholder="0.00"
              slotProps={{
                htmlInput: {
                  step: '0.00000001',
                  min: '0',
                },
              }}
            />

            {/* Auto-calculated values preview */}
            {direction && rValue !== null && (
              <Alert
                severity={rValue >= 0 ? 'success' : 'error'}
                icon={false}
                sx={{ '& .MuiAlert-message': { width: '100%' } }}
              >
                <Stack direction="row" justifyContent="space-between" alignItems="center">
                  <Box>
                    <Typography variant="subtitle2" sx={{ mb: 0.5 }}>
                      Direction: <strong>{direction}</strong>
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Auto-calculated based on Entry vs Stop Loss
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      variant="h6"
                      sx={{
                        fontWeight: 700,
                        color: rValue >= 0 ? 'success.dark' : 'error.dark',
                      }}
                    >
                      {rValue >= 0 ? '+' : ''}{rValue.toFixed(2)}R
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      Expected R
                    </Typography>
                  </Box>
                </Stack>
              </Alert>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading}>
            {editingTrade ? 'Update Trade' : 'Add Trade'}
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
