import { z } from 'zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import LoadingButton from '@mui/lab/LoadingButton';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { Form, RHFTextField } from 'src/components/hook-form';

// ----------------------------------------------------------------------

const NotesSchema = z.object({
  notes: z.string().optional(),
});

type NotesFormValues = z.infer<typeof NotesSchema>;

type BacktestNotesDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (notes: string) => Promise<void>;
  currentNotes?: string;
  loading?: boolean;
};

export function BacktestNotesDialog({
  open,
  onClose,
  onConfirm,
  currentNotes = '',
  loading = false,
}: BacktestNotesDialogProps) {
  const methods = useForm<NotesFormValues>({
    resolver: zodResolver(NotesSchema),
    defaultValues: {
      notes: currentNotes,
    },
  });

  const { handleSubmit, reset } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onConfirm(data.notes || '');
    reset();
  });

  const handleClose = () => {
    reset({ notes: currentNotes });
    onClose();
  };

  // Reset form when dialog opens or currentNotes changes
  useEffect(() => {
    if (open) {
      reset({ notes: currentNotes });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, currentNotes]);

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Notes</DialogTitle>

      <Form methods={methods} onSubmit={handleFormSubmit}>
        <DialogContent dividers>
          <RHFTextField
            name="notes"
            label="Notes"
            placeholder="Add notes for this backtest strategy..."
            multiline
            rows={6}
            fullWidth
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
