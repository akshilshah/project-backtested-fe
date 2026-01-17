import type { Trade } from 'src/types/trade';
import type { PreviewExitResponse } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
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
import CircularProgress from '@mui/material/CircularProgress';

import { TradesService } from 'src/services/trades.service';

import { Form } from 'src/components/hook-form';
import { CoinDisplay } from 'src/components/trade/coin-display';
import { PriceDisplay } from 'src/components/trade/price-display';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { ProfitLossDisplay } from 'src/components/stats/profit-loss-display';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

const EditExitTradeSchema = z.object({
  avgExit: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Exit price is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) > 0, 'Exit price must be a positive number'),
  exitDate: z.any().refine((val) => val !== null && val !== undefined, 'Exit date is required'),
  exitTime: z.any().refine((val) => val !== null && val !== undefined, 'Exit time is required'),
  notes: z.string().optional(),
});

type EditExitTradeFormValues = z.infer<typeof EditExitTradeSchema>;

type TradeEditExitDialogProps = {
  open: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirm: (data: { avgExit: number; exitDate: string; exitTime: string; notes?: string }) => Promise<void>;
  loading?: boolean;
};

export function TradeEditExitDialog({
  open,
  trade,
  onClose,
  onConfirm,
  loading = false,
}: TradeEditExitDialogProps) {
  const [plPreview, setPlPreview] = useState<PreviewExitResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Pre-fill with existing exit data
  const defaultValues: EditExitTradeFormValues = {
    avgExit: trade?.avgExit ?? '',
    exitDate: trade?.exitDate ? dayjs(trade.exitDate) : dayjs(),
    exitTime: trade?.exitTime ? dayjs(trade.exitTime, 'HH:mm:ss') : dayjs(),
    notes: trade?.notes ?? '',
  };

  const methods = useForm<EditExitTradeFormValues>({
    resolver: zodResolver(EditExitTradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, reset } = methods;

  const avgExitValue = watch('avgExit');

  // Reset form when dialog opens with new trade data
  useEffect(() => {
    if (open && trade) {
      reset({
        avgExit: trade.avgExit ?? '',
        exitDate: trade.exitDate ? dayjs(trade.exitDate) : dayjs(),
        exitTime: trade.exitTime ? dayjs(trade.exitTime, 'HH:mm:ss') : dayjs(),
        notes: trade.notes ?? '',
      });
    }
  }, [open, trade, reset]);

  // Fetch P&L preview from API when avgExit changes
  useEffect(() => {
    const fetchPreview = async () => {
      if (!trade || !avgExitValue || isNaN(Number(avgExitValue)) || Number(avgExitValue) <= 0) {
        setPlPreview(null);
        return;
      }

      try {
        setPreviewLoading(true);
        const preview = await TradesService.previewExit(trade.id, {
          avgExit: Number(avgExitValue),
        });
        setPlPreview(preview);
      } catch (error) {
        console.error('Failed to fetch P&L preview:', error);
        setPlPreview(null);
      } finally {
        setPreviewLoading(false);
      }
    };

    // Debounce API call
    const timeoutId = setTimeout(fetchPreview, 500);
    return () => clearTimeout(timeoutId);
  }, [trade, avgExitValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const exitDate = dayjs(data.exitDate).format('YYYY-MM-DD');
    const exitTime = dayjs(data.exitTime).format('HH:mm:ss');

    await onConfirm({
      avgExit: Number(data.avgExit),
      exitDate,
      exitTime,
      notes: data.notes || undefined,
    });
  });

  const handleClose = () => {
    onClose();
  };

  if (!trade) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Exit Details</DialogTitle>

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
                    <Typography variant="subtitle2">{trade.quantity?.toFixed(4)}</Typography>
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
                sx={{
                  '& .MuiAlert-message': { width: '100%' },
                  opacity: previewLoading ? 0.6 : 1,
                  transition: 'opacity 0.2s',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="subtitle2">Estimated P&L</Typography>
                    {previewLoading && <CircularProgress size={16} />}
                  </Stack>
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
            Update Exit
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
