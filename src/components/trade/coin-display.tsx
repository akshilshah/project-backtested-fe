import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

import { S3_ASSETS_BASE_URL } from 'src/lib/api-endpoints';

// ----------------------------------------------------------------------

type CoinDisplayProps = {
  symbol?: string;
  name?: string;
  image?: string;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
};

export function CoinDisplay({
  symbol,
  name,
  image,
  showName = false,
  size = 'medium',
  sx,
}: CoinDisplayProps) {
  const getSizeStyles = () => {
    switch (size) {
      case 'small':
        return {
          avatarSize: 24,
          symbolVariant: 'body2' as const,
          nameVariant: 'caption' as const,
        };
      case 'large':
        return {
          avatarSize: 48,
          symbolVariant: 'h6' as const,
          nameVariant: 'body2' as const,
        };
      default:
        return {
          avatarSize: 32,
          symbolVariant: 'subtitle2' as const,
          nameVariant: 'caption' as const,
        };
    }
  };

  const { avatarSize, symbolVariant, nameVariant } = getSizeStyles();

  const getAvatarColor = (sym: string) => {
    // Premium, muted color palette
    const colors = [
      '#6366F1', // Indigo
      '#8B5CF6', // Violet
      '#EC4899', // Pink
      '#F43F5E', // Rose
      '#F59E0B', // Amber
      '#10B981', // Emerald
      '#14B8A6', // Teal
      '#0EA5E9', // Sky
      '#3B82F6', // Blue
      '#A855F7', // Purple
    ];
    if (!sym) return colors[0];
    const index = sym.charCodeAt(0) % colors.length;
    return colors[index];
  };

  const imageUrl = image ? `${S3_ASSETS_BASE_URL}/${image}` : undefined;

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={sx}>
      <Avatar
        src={imageUrl}
        alt={symbol}
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize: avatarSize * 0.4,
          bgcolor: imageUrl ? 'transparent' : getAvatarColor(symbol || ''),
          color: 'white',
          fontWeight: 700,
        }}
      >
        {!imageUrl && (symbol?.slice(0, 2).toUpperCase() || '--')}
      </Avatar>

      <Box>
        <Typography variant={symbolVariant} sx={{ fontWeight: 600 }}>
          {symbol?.toUpperCase() || 'N/A'}
        </Typography>

        {showName && name && (
          <Typography variant={nameVariant} sx={{ color: 'text.secondary' }}>
            {name}
          </Typography>
        )}
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

type CoinChipProps = {
  symbol?: string;
  sx?: SxProps<Theme>;
};

export function CoinChip({ symbol, sx }: CoinChipProps) {
  return (
    <Box
      sx={{
        px: 1,
        py: 0.25,
        borderRadius: 0.75,
        display: 'inline-flex',
        bgcolor: 'action.hover',
        ...sx,
      }}
    >
      <Typography variant="caption" sx={{ fontWeight: 600 }}>
        {symbol?.toUpperCase() || 'N/A'}
      </Typography>
    </Box>
  );
}
