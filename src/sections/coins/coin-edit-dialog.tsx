import type { Coin, UpdateCoinRequest } from 'src/types/coin';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Form } from 'src/components/hook-form';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';
import { RHFImageUpload } from 'src/components/hook-form/rhf-image-upload';

// ----------------------------------------------------------------------

const CoinSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be at most 10 characters')
    .transform((val) => val.toUpperCase())
    .pipe(z.string().regex(/^[A-Z0-9]+$/, 'Symbol must be uppercase letters and numbers only')),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
  image: z.string().optional(),
});

type CoinFormValues = z.infer<typeof CoinSchema>;

type CoinEditDialogProps = {
  open: boolean;
  coin: Coin | null;
  onClose: () => void;
  onSubmit: (id: number, data: UpdateCoinRequest) => Promise<void>;
  loading?: boolean;
};

export function CoinEditDialog({
  open,
  coin,
  onClose,
  onSubmit,
  loading = false,
}: CoinEditDialogProps) {
  const defaultValues: CoinFormValues = {
    symbol: '',
    name: '',
    image: '',
  };

  const currentValues: CoinFormValues = {
    symbol: coin?.symbol || '',
    name: coin?.name || '',
    image: coin?.image || '',
  };

  const methods = useForm<CoinFormValues>({
    resolver: zodResolver(CoinSchema),
    defaultValues,
    values: currentValues,
  });

  const { handleSubmit, reset } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    if (!coin) return;
    await onSubmit(coin.id, {
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image === '' ? null : data.image,
    });
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>Edit Coin</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <RHFImageUpload
              name="image"
              label="Coin Logo"
              helperText="Upload an image (JPG, PNG, max 5MB)"
            />

            <RHFTextField
              name="symbol"
              label="Symbol"
              placeholder="e.g., BTC"
              helperText="Uppercase letters and numbers only"
              slotProps={{
                htmlInput: {
                  style: { textTransform: 'uppercase' },
                },
              }}
            />

            <RHFTextField
              name="name"
              label="Name"
              placeholder="e.g., Bitcoin"
              helperText="Full name of the cryptocurrency"
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading}>
            Update Coin
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
