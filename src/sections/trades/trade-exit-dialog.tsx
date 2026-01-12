import type { Trade } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Divider from '@mui/material/Divider';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Form } from 'src/components/hook-form';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { PriceDisplay } from 'src/components/trade/price-display';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { ProfitLossDisplay } from 'src/components/stats/profit-loss-display';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const ExitTradeSchema = z.object({
  avgExit: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Exit price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Exit price must be a positive number'),
  exitDate: z.any().refine((val) => val !== null && val !== undefined, 'Exit date is required'),
  exitTime: z.any().refine((val) => val !== null && val !== undefined, 'Exit time is required'),
  notes: z.string().optional(),
});

type ExitTradeFormValues = z.infer<typeof ExitTradeSchema>;

type TradeExitDialogProps = {
  open: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirm: (data: { avgExit: number; exitDate: string; exitTime: string; notes?: string }) => Promise<void>;
  loading?: boolean;
};

export function TradeExitDialog({
  open,
  trade,
  onClose,
  onConfirm,
  loading = false,
}: TradeExitDialogProps) {
  const defaultValues: ExitTradeFormValues = {
    avgExit: '',
    exitDate: dayjs(),
    exitTime: dayjs(),
    notes: '',
  };

  const methods = useForm<ExitTradeFormValues>({
    resolver: zodResolver(ExitTradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, reset } = methods;

  const avgExitValue = watch('avgExit');

  // Calculate P&L preview
  const calculatePL = () => {
    if (!trade || !avgExitValue || isNaN(Number(avgExitValue))) {
      return null;
    }

    const avgExit = Number(avgExitValue);
    const profitLoss = (avgExit - trade.avgEntry) * trade.quantity;
    const profitLossPercentage = ((avgExit - trade.avgEntry) / trade.avgEntry) * 100;

    return { profitLoss, profitLossPercentage };
  };

  const plPreview = calculatePL();

  const handleFormSubmit = handleSubmit(async (data) => {
    const exitDate = dayjs(data.exitDate).format('YYYY-MM-DD');
    const exitTime = dayjs(data.exitTime).format('HH:mm:ss');

    await onConfirm({
      avgExit: Number(data.avgExit),
      exitDate,
      exitTime,
      notes: data.notes || undefined,
    });

    reset(defaultValues);
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  if (!trade) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Exit Trade</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Trade Info */}
            <Box
              sx={{
                p: 2,
                borderRadius: 1,
                bgcolor: 'background.neutral',
              }}
            >
              <Stack spacing={2}>
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <CoinDisplay
                    symbol={trade.coin?.symbol ?? 'N/A'}
                    name={trade.coin?.name}
                    showName
                  />
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {trade.strategy?.name}
                  </Typography>
                </Stack>

                <Divider />

                <Stack direction="row" spacing={4}>
                  <PriceDisplay value={trade.avgEntry} label="Avg Entry" size="small" />
                  <Box>
                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.25 }}>
                      Quantity
                    </Typography>
                    <Typography variant="subtitle2">{trade.quantity}</Typography>
                  </Box>
                  <PriceDisplay value={trade.stopLoss} label="Stop Loss" size="small" />
                </Stack>
              </Stack>
            </Box>

            {/* Exit Form */}
            <RHFTextField
              name="avgExit"
              label="Avg Exit"
              type="number"
              placeholder="Enter exit price"
              slotProps={{
                htmlInput: {
                  step: '0.00000001',
                  min: '0',
                },
              }}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <RHFDatePicker
                name="exitDate"
                label="Exit Date"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
              <RHFTimePicker
                name="exitTime"
                label="Exit Time"
                slotProps={{
                  textField: {
                    fullWidth: true,
                  },
                }}
              />
            </Stack>

            <RHFTextField
              name="notes"
              label="Notes (Optional)"
              multiline
              rows={3}
              placeholder="Add any notes about this trade exit..."
            />

            {/* P&L Preview */}
            {plPreview && (
              <Alert
                severity={plPreview.profitLoss >= 0 ? 'success' : 'error'}
                icon={false}
                sx={{ '& .MuiAlert-message': { width: '100%' } }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Typography variant="subtitle2">Estimated P&L</Typography>
                  <ProfitLossDisplay
                    value={plPreview.profitLoss}
                    percentage={plPreview.profitLossPercentage}
                    showIcon
                    size="medium"
                  />
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
            Exit Trade
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
