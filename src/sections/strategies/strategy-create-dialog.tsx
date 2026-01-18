import type { CreateStrategyRequest } from 'src/types/strategy';

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

const StrategySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  entryRule: z.string().max(2000, 'Entry rule must be at most 2000 characters').optional(),
  exitRule: z.string().max(2000, 'Exit rule must be at most 2000 characters').optional(),
  stopLossRule: z.string().max(2000, 'Stop loss rule must be at most 2000 characters').optional(),
});

type StrategyFormValues = z.infer<typeof StrategySchema>;

type StrategyCreateDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: CreateStrategyRequest) => Promise<void>;
  loading?: boolean;
};

export function StrategyCreateDialog({
  open,
  onClose,
  onSubmit,
  loading = false,
}: StrategyCreateDialogProps) {
  const defaultValues: StrategyFormValues = {
    name: '',
    description: '',
    entryRule: '',
    exitRule: '',
    stopLossRule: '',
  };

  const methods = useForm<StrategyFormValues>({
    resolver: zodResolver(StrategySchema),
    defaultValues,
  });

  const { handleSubmit, reset } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      name: data.name,
      description: data.description || undefined,
      entryRule: data.entryRule || undefined,
      exitRule: data.exitRule || undefined,
      stopLossRule: data.stopLossRule || undefined,
    });
    reset(defaultValues);
  });

  const handleClose = () => {
    reset(defaultValues);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="xs" fullWidth>
      <DialogTitle>New Strategy</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <Stack spacing={3}>
            <RHFTextField
              name="name"
              label="Strategy Name"
              placeholder="e.g., Breakout Strategy"
            />

            <RHFTextField
              name="entryRule"
              label="Entry Rule (Optional)"
              placeholder="Define when to enter a trade..."
              multiline
              rows={2}
            />

            <RHFTextField
              name="exitRule"
              label="Exit Rule (Optional)"
              placeholder="Define when to exit a trade..."
              multiline
              rows={2}
            />

            <RHFTextField
              name="stopLossRule"
              label="Stop Loss Rule (Optional)"
              placeholder="Define stop loss conditions..."
              multiline
              rows={2}
            />

            <RHFTextField
              name="description"
              label="Description (Optional)"
              placeholder="Describe your strategy..."
              multiline
              rows={3}
            />
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading}>
            Create Strategy
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
