import type { Theme, SxProps } from '@mui/material/styles';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

type CoinDisplayProps = {
  symbol?: string;
  name?: string;
  showName?: boolean;
  size?: 'small' | 'medium' | 'large';
  sx?: SxProps<Theme>;
};

export function CoinDisplay({
  symbol,
  name,
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
    const colors = [
      '#FF6B6B',
      '#4ECDC4',
      '#45B7D1',
      '#96CEB4',
      '#FFEAA7',
      '#DDA0DD',
      '#98D8C8',
      '#F7DC6F',
      '#BB8FCE',
      '#85C1E9',
    ];
    if (!sym) return colors[0];
    const index = sym.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={sx}>
      <Avatar
        sx={{
          width: avatarSize,
          height: avatarSize,
          fontSize: avatarSize * 0.4,
          bgcolor: getAvatarColor(symbol),
          color: 'white',
          fontWeight: 700,
        }}
      >
        {symbol?.slice(0, 2).toUpperCase() || '--'}
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
