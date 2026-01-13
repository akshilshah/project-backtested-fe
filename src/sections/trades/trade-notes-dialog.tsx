import type { Trade } from 'src/types/trade';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import LoadingButton from '@mui/lab/LoadingButton';

import { Form } from 'src/components/hook-form';
import { RHFTextField } from 'src/components/hook-form/rhf-text-field';

// ----------------------------------------------------------------------

const NotesSchema = z.object({
  notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof NotesSchema>;

type TradeNotesDialogProps = {
  open: boolean;
  trade: Trade | null;
  onClose: () => void;
  onConfirm: (notes?: string) => Promise<void>;
  loading?: boolean;
};

export function TradeNotesDialog({
  open,
  trade,
  onClose,
  onConfirm,
  loading = false,
}: TradeNotesDialogProps) {
  const defaultValues: NotesFormValues = {
    notes: trade?.notes || '',
  };

  const methods = useForm<NotesFormValues>({
    resolver: zodResolver(NotesSchema),
    defaultValues,
    values: {
      notes: trade?.notes || '',
    },
  });

  const { handleSubmit, reset } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onConfirm(data.notes);
    reset();
  });

  const handleClose = () => {
    reset();
    onClose();
  };

  if (!trade) {
    return null;
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Notes</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <RHFTextField
            name="notes"
            label="Notes"
            multiline
            rows={6}
            placeholder="Add notes about this trade..."
            autoFocus
          />
        </DialogContent>

        <DialogActions>
          <Button variant="outlined" color="inherit" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <LoadingButton type="submit" variant="contained" loading={loading}>
            Save Notes
          </LoadingButton>
        </DialogActions>
      </Form>
    </Dialog>
  );
}
