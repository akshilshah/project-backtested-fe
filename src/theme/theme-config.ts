import type { Theme, Direction, CommonColors, ThemeProviderProps } from '@mui/material/styles';
import type { ThemeCssVariables } from './types';
import type { PaletteColorKey, PaletteColorNoChannels } from './core/palette';

// ----------------------------------------------------------------------

export type ThemeConfig = {
  direction: Direction;
  classesPrefix: string;
  cssVariables: ThemeCssVariables;
  defaultMode: ThemeProviderProps<Theme>['defaultMode'];
  modeStorageKey: ThemeProviderProps<Theme>['modeStorageKey'];
  fontFamily: Record<'primary' | 'secondary', string>;
  palette: Record<PaletteColorKey, PaletteColorNoChannels> & {
    common: Pick<CommonColors, 'black' | 'white'>;
    grey: {
      [K in 50 | 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900 as `${K}`]: string;
    };
  };
};

export const themeConfig: ThemeConfig = {
  /** **************************************
   * Base
   *************************************** */
  defaultMode: 'light',
  modeStorageKey: 'theme-mode',
  direction: 'ltr',
  classesPrefix: 'minimal',
  /** **************************************
   * Css variables
   *************************************** */
  cssVariables: {
    cssVarPrefix: '',
    colorSchemeSelector: 'data-color-scheme',
  },
  /** **************************************
   * Typography
   *************************************** */
  fontFamily: {
    primary: 'Public Sans Variable',
    secondary: 'Barlow',
  },
  /** **************************************
   * Palette - Premium, muted fintech colors
   *************************************** */
  palette: {
    // PRIMARY - Sophisticated slate blue for modern fintech
    primary: {
      lighter: '#E0E7FF',
      light: '#A5B4FC',
      main: '#6366F1',
      dark: '#4F46E5',
      darker: '#3730A3',
      contrastText: '#FFFFFF',
    },
    secondary: {
      lighter: '#F1F5F9',
      light: '#CBD5E1',
      main: '#64748B',
      dark: '#475569',
      darker: '#334155',
      contrastText: '#FFFFFF',
    },
    info: {
      lighter: '#E0F2FE',
      light: '#7DD3FC',
      main: '#0EA5E9',
      dark: '#0284C7',
      darker: '#0369A1',
      contrastText: '#FFFFFF',
    },
    // SUCCESS - muted emerald for profits/wins
    success: {
      lighter: '#D1FAE5',
      light: '#6EE7B7',
      main: '#10B981',
      dark: '#059669',
      darker: '#047857',
      contrastText: '#FFFFFF',
    },
    // WARNING - warm amber
    warning: {
      lighter: '#FEF3C7',
      light: '#FCD34D',
      main: '#F59E0B',
      dark: '#D97706',
      darker: '#B45309',
      contrastText: '#18181B',
    },
    // ERROR - muted rose for losses
    error: {
      lighter: '#FFE4E6',
      light: '#FDA4AF',
      main: '#F43F5E',
      dark: '#E11D48',
      darker: '#BE123C',
      contrastText: '#FFFFFF',
    },
    // GREY - refined slate greys for premium feel
    grey: {
      50: '#F8FAFC',
      100: '#F1F5F9',
      200: '#E2E8F0',
      300: '#CBD5E1',
      400: '#94A3B8',
      500: '#64748B',
      600: '#475569',
      700: '#334155',
      800: '#1E293B',
      900: '#0F172A',
    },
    common: {
      black: '#000000',
      white: '#FFFFFF',
    },
  },
};
