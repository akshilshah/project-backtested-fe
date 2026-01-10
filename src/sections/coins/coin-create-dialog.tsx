import type { CreateCoinRequest } from 'src/types/coin';

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

// ----------------------------------------------------------------------

const CoinSchema = z.object({
  symbol: z
    .string()
    .min(1, 'Symbol is required')
    .max(10, 'Symbol must be at most 10 characters')
    .regex(/^[A-Z0-9]+$/, 'Symbol must be uppercase letters and numbers only')
    .transform((val) => val.toUpperCase()),
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name must be at most 100 characters'),
});

type CoinFormValues = z.infer<typeof CoinSchema>;

type CoinCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateCoinRequest) => Promise<void>;
  loading?: boolean;
};

export function CoinCreateDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: CoinCreateDialogProps) {
  const defaultValues: CoinFormValues = {
    symbol: '',
    name: '',
  };

  const methods = useForm<CoinFormValues>({
    resolver: zodResolver(CoinSchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      symbol: data.symbol.toUpperCase(),
      name: data.name,
    });
    reset(defaultValues);
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Coin</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
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
            Create Coin
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
