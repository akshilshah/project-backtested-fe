import type { Trade, PreviewExitResponse } from 'src/types/trade';

import { z } from 'zod';
import dayjs from 'dayjs';
import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import useMediaQuery from '@mui/material/useMediaQuery';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme, type Theme } from '@mui/material/styles';
import CircularProgress from '@mui/material/CircularProgress';

import { S3_ASSETS_BASE_URL } from 'src/lib/api-endpoints';
import { TradesService } from 'src/services/trades.service';

import { Form } from 'src/components/hook-form';
import { Iconify } from 'src/components/iconify';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { RHFDatePicker, RHFTimePicker } from 'src/components/hook-form/rhf-date-picker';

// ----------------------------------------------------------------------

// Info card component for displaying trade details
function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        borderRadius: 1.5,
        bgcolor: (theme: Theme) =>
          theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.02)',
        border: (theme: Theme) => `1px solid ${theme.palette.divider}`,
        flex: 1,
        minWidth: { xs: 'calc(50% - 6px)', sm: 0 },
        textAlign: 'center',
      }}
    >
      <Typography
        variant="caption"
        sx={{
          color: 'text.secondary',
          display: 'block',
          mb: 0.25,
          fontWeight: 500,
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
          fontSize: { xs: '0.6rem', sm: '0.65rem' },
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="subtitle2"
        sx={{
          fontWeight: 600,
          fontSize: { xs: '0.75rem', sm: '0.875rem' },
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// Premium styled input wrapper
function StyledInput({
  children,
  label,
  icon,
}: {
  children: React.ReactNode;
  label?: string;
  icon?: string;
}) {
  return (
    <Box>
      {label && (
        <Stack direction="row" spacing={0.75} alignItems="center" sx={{ mb: 1 }}>
          {icon && <Iconify icon={icon as any} width={14} sx={{ color: 'text.secondary' }} />}
          <Typography
            variant="caption"
            sx={{
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              fontSize: '0.65rem',
            }}
          >
            {label}
          </Typography>
        </Stack>
      )}
      <Box
        sx={{
          '& .MuiOutlinedInput-root': {
            bgcolor: (theme: Theme) =>
              theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.04)'
                : 'rgba(0, 0, 0, 0.02)',
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: (theme: Theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.06)'
                  : 'rgba(0, 0, 0, 0.03)',
            },
            '&.Mui-focused': {
              bgcolor: 'transparent',
            },
          },
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

// ----------------------------------------------------------------------

const EditExitTradeSchema = z.object({
  avgExit: z
    .union([z.string(), z.number()])
    .refine((val) => val !== '' && val !== null && val !== undefined, 'Exit price is required')
    .refine(
      (val) => !isNaN(Number(val)) && Number(val) > 0,
      'Exit price must be a positive number'
    ),
  exitDate: z.any().refine((val) => val !== null && val !== undefined, 'Exit date is required'),
  exitTime: z.any().refine((val) => val !== null && val !== undefined, 'Exit time is required'),
  exitFeePercentage: z
    .union([z.string(), z.number()])
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 0, 'Exit fee must be a positive number'),
  notes: z.string().optional(),
});

type EditExitTradeFormValues = z.infer<typeof EditExitTradeSchema>;

type TradeEditExitDialogProps = {
  open: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirm: (data: {
    avgExit: number;
    exitDate: string;
    exitTime: string;
    exitFeePercentage: number;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
};

export function TradeEditExitDialog({
  open,
  trade,
  onClose,
  onConfirm,
  loading = false,
}: TradeEditExitDialogProps) {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [plPreview, setPlPreview] = useState<PreviewExitResponse | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // Pre-fill with existing exit data
  const defaultValues: EditExitTradeFormValues = {
    avgExit: trade?.avgExit ?? '',
    exitDate: trade?.exitDate ? dayjs(trade.exitDate) : dayjs(),
    exitTime: trade?.exitTime ? dayjs(trade.exitTime) : dayjs(),
    exitFeePercentage: trade?.exitFeePercentage ?? 0.05,
    notes: trade?.notes ?? '',
  };

  const methods = useForm<EditExitTradeFormValues>({
    resolver: zodResolver(EditExitTradeSchema),
    defaultValues,
  });

  const { handleSubmit, watch, reset } = methods;

  const avgExitValue = watch('avgExit');
  const exitFeePercentageValue = watch('exitFeePercentage');

  // Reset form when dialog opens with new trade data
  useEffect(() => {
    if (open && trade) {
      reset({
        avgExit: trade.avgExit ?? '',
        exitDate: trade.exitDate ? dayjs(trade.exitDate) : dayjs(),
        exitTime: trade.exitTime ? dayjs(trade.exitTime) : dayjs(),
        exitFeePercentage: trade.exitFeePercentage ?? 0.05,
        notes: trade.notes ?? '',
      });
    }
  }, [open, trade, reset]);

  // Fetch P&L preview from API when avgExit or exitFeePercentage changes
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
          exitFeePercentage: Number(exitFeePercentageValue) || 0.05,
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
  }, [trade, avgExitValue, exitFeePercentageValue]);

  const handleFormSubmit = handleSubmit(async (data) => {
    const exitDate = dayjs(data.exitDate).format('YYYY-MM-DD');
    const exitTime = dayjs(data.exitTime).format('HH:mm:ss');

    await onConfirm({
      avgExit: Number(data.avgExit),
      exitDate,
      exitTime,
      exitFeePercentage: Number(data.exitFeePercentage),
      notes: data.notes || undefined,
    });
  });

  const handleClose = () => {
    onClose();
  };

  if (!trade) {
    return null;
  }

  const formatPrice = (value: number | null | undefined) => {
    if (value === null || value === undefined) return '-';
    return `$${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}`;
  };

  const isProfitable = plPreview ? plPreview.profitLoss >= 0 : null;

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          bgcolor: (t: Theme) => (t.palette.mode === 'dark' ? '#1a1a2e' : '#ffffff'),
        },
      }}
    >
      {/* Premium Header */}
      <DialogTitle
        sx={{
          p: { xs: 2, sm: 2.5 },
          borderBottom: (t: Theme) => `1px solid ${t.palette.divider}`,
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 1,
              borderRadius: 1.5,
              bgcolor: (t: Theme) =>
                t.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.16)' : 'rgba(99, 102, 241, 0.1)',
            }}
          >
            <Iconify icon={'solar:pen-bold' as any} width={22} sx={{ color: 'primary.main' }} />
          </Box>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              Edit Exit Details
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Modify your trade exit information
            </Typography>
          </Box>
        </Stack>
      </DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent sx={{ p: { xs: 2, sm: 2.5 } }}>
          <Stack spacing={2.5}>
            {/* Trade Info Card */}
            <Box
              sx={{
                p: 2,
                borderRadius: 2,
                bgcolor: (t: Theme) =>
                  t.palette.mode === 'dark'
                    ? 'rgba(99, 102, 241, 0.08)'
                    : 'rgba(99, 102, 241, 0.04)',
                border: (t: Theme) =>
                  `1px solid ${t.palette.mode === 'dark' ? 'rgba(99, 102, 241, 0.2)' : 'rgba(99, 102, 241, 0.15)'}`,
              }}
            >
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 2 }}
              >
                <Stack direction="row" alignItems="center" spacing={1.5}>
                  <Avatar
                    src={trade.coin?.image ? `${S3_ASSETS_BASE_URL}/${trade.coin.image}` : undefined}
                    alt={trade.coin?.symbol}
                    sx={{
                      width: 36,
                      height: 36,
                      borderRadius: 1.5,
                      bgcolor: trade.coin?.image ? 'transparent' : 'primary.main',
                      color: 'white',
                      fontWeight: 700,
                      fontSize: '0.7rem',
                    }}
                  >
                    {!trade.coin?.image && (trade.coin?.symbol?.slice(0, 3) ?? 'N/A')}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {trade.coin?.symbol ?? 'N/A'}
                    </Typography>
                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                      {trade.coin?.name}
                    </Typography>
                  </Box>
                </Stack>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1,
                    bgcolor: (t: Theme) =>
                      t.palette.mode === 'dark'
                        ? 'rgba(255, 255, 255, 0.08)'
                        : 'rgba(0, 0, 0, 0.04)',
                  }}
                >
                  <Typography variant="caption" fontWeight={500} sx={{ color: 'text.secondary' }}>
                    {trade.strategy?.name}
                  </Typography>
                </Box>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                sx={{ flexWrap: 'wrap', gap: 1, '& > *': { mb: { xs: 0, sm: 0 } } }}
              >
                <InfoCard label="Entry" value={formatPrice(trade.avgEntry)} />
                <InfoCard label="Qty" value={trade.quantity?.toFixed(4) ?? '-'} />
                <InfoCard label="Stop Loss" value={formatPrice(trade.stopLoss)} />
              </Stack>
            </Box>

            {/* Exit Price & Fee Row */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 8 }}>
                <StyledInput label="Exit Price" icon="solar:tag-price-bold">
                  <RHFTextField
                    name="avgExit"
                    placeholder="Enter exit price"
                    type="number"
                    size={isMobile ? 'small' : 'medium'}
                    slotProps={{
                      input: {
                        startAdornment: (
                          <InputAdornment position="start">
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                              $
                            </Typography>
                          </InputAdornment>
                        ),
                      },
                      htmlInput: {
                        step: '0.00000001',
                        min: '0',
                      },
                    }}
                  />
                </StyledInput>
              </Grid>
              <Grid size={{ xs: 12, sm: 4 }}>
                <StyledInput label="Exit Fee" icon="solar:hand-money-bold">
                  <RHFTextField
                    name="exitFeePercentage"
                    placeholder="0.05"
                    type="number"
                    size={isMobile ? 'small' : 'medium'}
                    slotProps={{
                      input: {
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                      },
                      htmlInput: {
                        step: '0.01',
                        min: '0',
                      },
                    }}
                  />
                </StyledInput>
              </Grid>
            </Grid>

            {/* Date & Time Row */}
            <Grid container spacing={2}>
              <Grid size={{ xs: 6 }}>
                <StyledInput label="Exit Date" icon="solar:calendar-bold">
                  <RHFDatePicker
                    name="exitDate"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: isMobile ? 'small' : 'medium',
                      },
                    }}
                  />
                </StyledInput>
              </Grid>
              <Grid size={{ xs: 6 }}>
                <StyledInput label="Exit Time" icon="solar:clock-circle-bold">
                  <RHFTimePicker
                    name="exitTime"
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        size: isMobile ? 'small' : 'medium',
                      },
                    }}
                  />
                </StyledInput>
              </Grid>
            </Grid>

            {/* Notes */}
            <StyledInput label="Notes" icon="solar:document-text-bold">
              <RHFTextField
                name="notes"
                placeholder="Add any notes about this exit..."
                multiline
                rows={2}
                size={isMobile ? 'small' : 'medium'}
              />
            </StyledInput>

            {/* P&L Preview */}
            {plPreview && (
              <Box
                sx={{
                  p: 2,
                  borderRadius: 2,
                  bgcolor: (t: Theme) =>
                    isProfitable
                      ? t.palette.mode === 'dark'
                        ? 'rgba(34, 197, 94, 0.12)'
                        : 'rgba(34, 197, 94, 0.08)'
                      : t.palette.mode === 'dark'
                        ? 'rgba(239, 68, 68, 0.12)'
                        : 'rgba(239, 68, 68, 0.08)',
                  border: (t: Theme) =>
                    `1px solid ${
                      isProfitable
                        ? t.palette.mode === 'dark'
                          ? 'rgba(34, 197, 94, 0.3)'
                          : 'rgba(34, 197, 94, 0.2)'
                        : t.palette.mode === 'dark'
                          ? 'rgba(239, 68, 68, 0.3)'
                          : 'rgba(239, 68, 68, 0.2)'
                    }`,
                  opacity: previewLoading ? 0.7 : 1,
                  transition: 'all 0.2s',
                }}
              >
                <Stack direction="row" alignItems="center" justifyContent="space-between">
                  <Stack direction="row" alignItems="center" spacing={1.5}>
                    <Box
                      sx={{
                        p: 0.75,
                        borderRadius: 1,
                        bgcolor: (t: Theme) =>
                          isProfitable
                            ? t.palette.mode === 'dark'
                              ? 'rgba(34, 197, 94, 0.2)'
                              : 'rgba(34, 197, 94, 0.15)'
                            : t.palette.mode === 'dark'
                              ? 'rgba(239, 68, 68, 0.2)'
                              : 'rgba(239, 68, 68, 0.15)',
                      }}
                    >
                      <Iconify
                        icon={
                          isProfitable
                            ? ('solar:arrow-up-bold' as any)
                            : ('solar:arrow-down-bold' as any)
                        }
                        width={18}
                        sx={{ color: isProfitable ? 'success.main' : 'error.main' }}
                      />
                    </Box>
                    <Box>
                      <Typography
                        variant="caption"
                        sx={{
                          color: 'text.secondary',
                          display: 'block',
                          fontWeight: 500,
                          textTransform: 'uppercase',
                          letterSpacing: '0.5px',
                          fontSize: '0.65rem',
                        }}
                      >
                        Estimated P&L
                      </Typography>
                      <Stack direction="row" alignItems="center" spacing={0.5}>
                        <Typography
                          variant="subtitle1"
                          fontWeight={700}
                          sx={{ color: isProfitable ? 'success.main' : 'error.main' }}
                        >
                          {isProfitable ? '+' : ''}${plPreview.profitLoss.toFixed(2)}
                        </Typography>
                        {previewLoading && <CircularProgress size={14} />}
                      </Stack>
                    </Box>
                  </Stack>
                  <Box
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: 1,
                      bgcolor: (t: Theme) =>
                        isProfitable
                          ? t.palette.mode === 'dark'
                            ? 'rgba(34, 197, 94, 0.2)'
                            : 'rgba(34, 197, 94, 0.15)'
                          : t.palette.mode === 'dark'
                            ? 'rgba(239, 68, 68, 0.2)'
                            : 'rgba(239, 68, 68, 0.15)',
                    }}
                  >
                    <Typography
                      variant="subtitle2"
                      fontWeight={600}
                      sx={{ color: isProfitable ? 'success.main' : 'error.main' }}
                    >
                      {isProfitable ? '+' : ''}
                      {plPreview.profitLossPercentage.toFixed(2)}%
                    </Typography>
                  </Box>
                </Stack>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            p: { xs: 2, sm: 2.5 },
            borderTop: (t: Theme) => `1px solid ${t.palette.divider}`,
            gap: 1,
          }}
        >
          <Button
            variant="outlined"
            color="inherit"
            onClick={handleClose}
            disabled={loading}
            size={isMobile ? 'medium' : 'large'}
          >
            Cancel
          </Button>
          <LoadingButton
            type="submit"
            variant="contained"
            loading={loading}
            size={isMobile ? 'medium' : 'large'}
            startIcon={<Iconify icon={'solar:check-circle-bold' as any} />}
          >
            Update Exit
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
