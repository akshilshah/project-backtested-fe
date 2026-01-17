import { z } from 'zod';
import useSWR from 'swr';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { CoinsService } from 'src/services/coins.service';

import { Form, RHFTextField, RHFAutocomplete } from 'src/components/hook-form';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

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
  onConfirm: (data: any) => Promise<void>;
  strategyId: number;
  loading?: boolean;
};

export function BacktestAddTradeDialog({
  open,
  onClose,
  onConfirm,
  strategyId,
  loading = false,
}: BacktestAddTradeDialogProps) {
  // Fetch coins for dropdown
  const { data: coinsData } = useSWR('coins-all', () => CoinsService.getAll({ limit: 100 }));

  const coins = coinsData?.coins ?? [];

  const defaultValues: AddTradeFormValues = {
    coinId: 0,
    date: dayjs(),
    time: dayjs(),
    entry: '',
    sl: '',
    exit: '',
  };

  const methods = useForm<AddTradeFormValues>({
    resolver: zodResolver(AddTradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, reset } = methods;

  const entryValue = watch('entry');
  const slValue = watch('sl');
  const exitValue = watch('exit');

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
    const tradeDate = dayjs(data.date).format('YYYY-MM-DD');
    const tradeTime = dayjs(data.time).format('HH:mm:ss');

    await onConfirm({
      strategyId,
      coinId: data.coinId,
      date: tradeDate,
      time: tradeTime,
      entry: Number(data.entry),
      sl: Number(data.sl),
      exit: Number(data.exit),
      direction,
      r: rValue,
    });

    reset(defaultValues);
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Backtest Trade</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Coin Selection */}
            <RHFAutocomplete
              name="coinId"
              label="Coin"
              options={coins}
              getOptionLabel={(option: any) => {
                if (typeof option === 'number') {
                  const coin = coins.find((c) => c.id === option);
                  return coin ? `${coin.symbol} - ${coin.name}` : '';
                }
                return option.symbol ? `${option.symbol} - ${option.name}` : '';
              }}
              isOptionEqualToValue={(option: any, value: any) => {
                if (typeof value === 'number') {
                  return option.id === value;
                }
                return option.id === value?.id;
              }}
              onChange={(_, value: any) => value?.id || 0}
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
            Add Trade
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
