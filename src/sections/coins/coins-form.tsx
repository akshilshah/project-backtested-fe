import type { Coin, CreateCoinRequest } from 'src/types/coin';

import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Grid from '@mui/material/Grid';

import { Form } from 'src/components/hook-form';
import { FormCard } from 'src/components/form/form-card';
import { FormActions } from 'src/components/form/form-actions';
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

type CoinsFormProps = {
  currentCoin?: Coin;
  onSubmit: (data: CreateCoinRequest) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function CoinsForm({
  currentCoin,
  onSubmit,
  onCancel,
  loading = false,
}: CoinsFormProps) {
  const isEdit = !!currentCoin;

  const defaultValues: CoinFormValues = {
    symbol: currentCoin?.symbol ?? '',
    name: currentCoin?.name ?? '',
    image: currentCoin?.image ?? '',
  };

  const methods = useForm<CoinFormValues>({
    resolver: zodResolver(CoinSchema),
    defaultValues,
  });

  const { handleSubmit } = methods;

  const handleFormSubmit = handleSubmit(async (data) => {
    await onSubmit({
      symbol: data.symbol.toUpperCase(),
      name: data.name,
      image: data.image || undefined,
    });
  });

  return (
    <Form methods={methods} onSubmit={handleFormSubmit}>
      <FormCard
        title={isEdit ? 'Edit Coin' : 'New Coin'}
        subheader={
          isEdit
            ? 'Update the coin information below'
            : 'Fill in the details to create a new coin'
        }
      >
        <Grid container spacing={3}>
          <Grid size={{ xs: 12 }}>
            <RHFImageUpload
              name="image"
              label="Coin Logo"
              helperText="Upload an image (JPG, PNG, max 5MB)"
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RHFTextField
              name="symbol"
              label="Symbol"
              placeholder="e.g., BTC"
              helperText="Uppercase letters and numbers only (e.g., BTC, ETH, USDT)"
              slotProps={{
                htmlInput: {
                  style: { textTransform: 'uppercase' },
                },
              }}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RHFTextField
              name="name"
              label="Name"
              placeholder="e.g., Bitcoin"
              helperText="Full name of the cryptocurrency"
            />
          </Grid>
        </Grid>

        <FormActions
          onCancel={onCancel}
          submitText={isEdit ? 'Update Coin' : 'Create Coin'}
          loading={loading}
        />
      </FormCard>
    </Form>
  );
}
