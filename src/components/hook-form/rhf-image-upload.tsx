import type { ChangeEvent } from 'react';

import { useState } from 'react';
import { Controller, useFormContext } from 'react-hook-form';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import FormHelperText from '@mui/material/FormHelperText';
import CircularProgress from '@mui/material/CircularProgress';

import axios from 'src/lib/axios';
import { S3_ASSETS_BASE_URL } from 'src/lib/api-endpoints';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type RHFImageUploadProps = {
  name: string;
  label?: string;
  helperText?: string;
};

export function RHFImageUpload({ name, label, helperText }: RHFImageUploadProps) {
  const { control } = useFormContext();
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [imageLoadError, setImageLoadError] = useState(false);

  const handleFileChange = async (
    e: ChangeEvent<HTMLInputElement>,
    onChange: (value: string) => void
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setUploadError('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setUploadError('File size must be less than 5MB');
      return;
    }

    setUploadError(null);
    setImageLoadError(false);
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await axios.post<{
        message: string;
        metadata: { name: string; type: string; size: number };
      }>('/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.data.metadata?.name) {
        const imageKey = response.data.metadata.name;
        const imageUrl = `${S3_ASSETS_BASE_URL}/${imageKey}`;
        console.log('Image uploaded successfully:', { imageKey, imageUrl });
        onChange(imageKey);
      }
    } catch (error) {
      console.error('Upload failed:', error);
      setUploadError('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <Controller
      name={name}
      control={control}
      render={({ field: { onChange, value }, fieldState: { error } }) => (
        <Box>
          {label && (
            <Box sx={{ mb: 1.5 }}>
              <Box component="span" sx={{ fontSize: '0.875rem', fontWeight: 500 }}>
                {label}
              </Box>
            </Box>
          )}

          <Stack direction="row" alignItems="center" spacing={2}>
            {/* Preview */}
            <Avatar
              src={value ? `${S3_ASSETS_BASE_URL}/${value}` : undefined}
              slotProps={{
                img: {
                  onError: () => {
                    console.error('Failed to load image:', `${S3_ASSETS_BASE_URL}/${value}`);
                    setImageLoadError(true);
                  },
                  onLoad: () => {
                    setImageLoadError(false);
                  },
                },
              }}
              sx={{
                width: 80,
                height: 80,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.08)'
                    : 'rgba(0, 0, 0, 0.04)',
                border: (theme) => `2px dashed ${theme.palette.divider}`,
              }}
            >
              {!value && <Iconify icon="solar:camera-add-bold" width={32} sx={{ opacity: 0.3 }} />}
            </Avatar>

            {/* Upload Button */}
            <Stack spacing={1} sx={{ flex: 1 }}>
              <Button
                variant="outlined"
                component="label"
                disabled={uploading}
                startIcon={
                  uploading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <Iconify icon={"solar:upload-bold" as any} />
                  )
                }
              >
                {uploading ? 'Uploading...' : value ? 'Change Image' : 'Upload Image'}
                <input
                  type="file"
                  hidden
                  accept="image/*"
                  onChange={(e) => handleFileChange(e, onChange)}
                />
              </Button>

              {value && (
                <Button
                  size="small"
                  color="error"
                  onClick={() => onChange('')}
                  startIcon={<Iconify icon="solar:trash-bin-trash-bold" />}
                  sx={{ alignSelf: 'flex-start' }}
                >
                  Remove
                </Button>
              )}
            </Stack>
          </Stack>

          {(helperText || uploadError || error?.message || imageLoadError) && (
            <FormHelperText error={!!(uploadError || error?.message || imageLoadError)} sx={{ mt: 1 }}>
              {uploadError ||
                error?.message ||
                (imageLoadError
                  ? 'Failed to load image. The S3 bucket may not be publicly accessible or CORS is not configured.'
                  : helperText)}
            </FormHelperText>
          )}
        </Box>
      )}
    />
  );
}
