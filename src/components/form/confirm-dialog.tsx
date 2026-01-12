import type { Theme, SxProps } from '@mui/material/styles';

import Zoom from '@mui/material/Zoom';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import LoadingButton from '@mui/lab/LoadingButton';
import DialogTitle from '@mui/material/DialogTitle';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';

// ----------------------------------------------------------------------

type ConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  content?: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  confirmColor?: 'inherit' | 'primary' | 'secondary' | 'success' | 'error' | 'info' | 'warning';
  loading?: boolean;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  sx?: SxProps<Theme>;
};

export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title = 'Confirm',
  content,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  confirmColor = 'error',
  loading = false,
  maxWidth = 'xs',
  sx,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth={maxWidth}
      fullWidth
      TransitionComponent={Zoom}
      sx={{
        '& .MuiDialog-paper': {
          borderRadius: 2,
        },
        ...sx,
      }}
    >
      <DialogTitle>{title}</DialogTitle>

      {content && (
        <DialogContent>
          {typeof content === 'string' ? (
            <DialogContentText>{content}</DialogContentText>
          ) : (
            content
          )}
        </DialogContent>
      )}

      <DialogActions>
        <Button variant="outlined" color="inherit" onClick={onClose} disabled={loading}>
          {cancelText}
        </Button>

        <LoadingButton
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          loading={loading}
        >
          {confirmText}
        </LoadingButton>
      </DialogActions>
    </Dialog>
  );
}

// ----------------------------------------------------------------------

type DeleteDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  itemName?: string;
  loading?: boolean;
};

export function DeleteDialog({
  open,
  onClose,
  onConfirm,
  title = 'Delete',
  itemName,
  loading = false,
}: DeleteDialogProps) {
  return (
    <ConfirmDialog
      open={open}
      onClose={onClose}
      onConfirm={onConfirm}
      title={title}
      content={
        itemName
          ? `Are you sure you want to delete "${itemName}"? This action cannot be undone.`
          : 'Are you sure you want to delete this item? This action cannot be undone.'
      }
      confirmText="Delete"
      confirmColor="error"
      loading={loading}
    />
  );
}
