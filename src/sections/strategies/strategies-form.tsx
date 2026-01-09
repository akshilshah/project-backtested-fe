import type { Strategy, CreateStrategyRequest, UpdateStrategyRequest } from 'src/types/strategy';

import { z } from 'zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';

import { Form, Field } from 'src/components/hook-form';
import { FormCard } from 'src/components/form/form-card';
import { FormActions } from 'src/components/form/form-actions';

// ----------------------------------------------------------------------

export const StrategySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be at most 100 characters'),
  description: z.string().max(500, 'Description must be at most 500 characters').optional(),
  rules: z.string().optional(),
});

export type StrategyFormValues = z.infer<typeof StrategySchema>;

// ----------------------------------------------------------------------

type StrategyFormData = {
  name: string;
  description?: string;
  rules?: Record<string, unknown>;
};

type StrategyFormProps = {
  currentStrategy?: Strategy;
  onSubmit: (data: StrategyFormData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
};

export function StrategyForm({
  currentStrategy,
  onSubmit,
  onCancel,
  loading = false,
}: StrategyFormProps) {
  const isEdit = !!currentStrategy;

  const defaultValues = useMemo(
    () => ({
      name: currentStrategy?.name || '',
      description: currentStrategy?.description || '',
      rules: currentStrategy?.rules ? JSON.stringify(currentStrategy.rules, null, 2) : '',
    }),
    [currentStrategy]
  );

  const methods = useForm<StrategyFormValues>({
    resolver: zodResolver(StrategySchema),
    defaultValues,
    mode: 'onChange',
  });

  const { handleSubmit } = methods;

  const onSubmitForm = handleSubmit(async (data) => {
    try {
      let rules: Record<string, unknown> | undefined;

      if (data.rules && data.rules.trim()) {
        try {
          rules = JSON.parse(data.rules);
        } catch {
          methods.setError('rules', { message: 'Invalid JSON format' });
          return;
        }
      }

      await onSubmit({
        name: data.name,
        description: data.description || undefined,
        rules,
      });
    } catch (error) {
      console.error('Form submission error:', error);
    }
  });

  return (
    <Form methods={methods} onSubmit={onSubmitForm}>
      <Stack spacing={3}>
        <FormCard title="Strategy Details" subheader="Enter the strategy information">
          <Field.Text
            name="name"
            label="Strategy Name"
            placeholder="e.g., Breakout Strategy"
            helperText="Give your strategy a descriptive name"
          />

          <Field.Text
            name="description"
            label="Description"
            placeholder="Describe your strategy..."
            multiline
            rows={3}
            helperText="Optional: Describe what this strategy does"
          />
        </FormCard>

        <FormCard
          title="Rules Configuration"
          subheader="Define your strategy rules in JSON format (optional)"
        >
          <Field.Text
            name="rules"
            label="Rules (JSON)"
            placeholder='{"entry": "condition", "exit": "condition"}'
            multiline
            rows={6}
            helperText="Enter rules as a valid JSON object. Leave empty if not needed."
            sx={{
              '& .MuiInputBase-input': {
                fontFamily: 'monospace',
                fontSize: '0.875rem',
              },
            }}
          />

          <Box sx={{ typography: 'caption', color: 'text.secondary' }}>
            Example:
            <Box
              component="pre"
              sx={{
                mt: 1,
                p: 1.5,
                borderRadius: 1,
                bgcolor: 'background.neutral',
                fontSize: '0.75rem',
                overflow: 'auto',
              }}
            >
              {`{
  "entry": {
    "condition": "price_above_sma",
    "sma_period": 20
  },
  "exit": {
    "condition": "price_below_sma",
    "sma_period": 10
  },
  "risk": {
    "max_position_size": 0.1
  }
}`}
            </Box>
          </Box>
        </FormCard>

        <FormActions
          onCancel={onCancel}
          submitText={isEdit ? 'Update Strategy' : 'Create Strategy'}
          loading={loading}
        />
      </Stack>
    </Form>
  );
}
