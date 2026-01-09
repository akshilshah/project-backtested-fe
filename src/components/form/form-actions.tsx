import type { Theme, SxProps } from '@mui/material/styles';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import LoadingButton from '@mui/lab/LoadingButton';

// ----------------------------------------------------------------------

type FormActionsProps = {
  onCancel?: () => void;
  cancelText?: string;
  submitText?: string;
  loading?: boolean;
  disabled?: boolean;
  secondaryAction?: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function FormActions({
  onCancel,
  cancelText = 'Cancel',
  submitText = 'Save',
  loading = false,
  disabled = false,
  secondaryAction,
  sx,
}: FormActionsProps) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      spacing={2}
      sx={{ mt: 3, ...sx }}
    >
      {secondaryAction}

      <Stack direction="row" spacing={1.5}>
        {onCancel && (
          <Button variant="outlined" color="inherit" onClick={onCancel} disabled={loading}>
            {cancelText}
          </Button>
        )}

        <LoadingButton
          type="submit"
          variant="contained"
          loading={loading}
          disabled={disabled}
        >
          {submitText}
        </LoadingButton>
      </Stack>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type FormFooterProps = {
  children: React.ReactNode;
  sx?: SxProps<Theme>;
};

export function FormFooter({ children, sx }: FormFooterProps) {
  return (
    <Stack
      direction="row"
      justifyContent="flex-end"
      alignItems="center"
      spacing={2}
      sx={{ mt: 3, pt: 3, borderTop: 1, borderColor: 'divider', ...sx }}
    >
      {children}
    </Stack>
  );
}
