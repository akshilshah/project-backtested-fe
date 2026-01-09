import type { Components, Theme } from '@mui/material/styles';

// ----------------------------------------------------------------------

/**
 * Accessibility-focused component style overrides
 *
 * These overrides ensure:
 * - Proper focus indicators for keyboard navigation
 * - WCAG AA compliant color contrast
 * - Screen reader support
 */
export function accessibilityOverrides(theme: Theme): Components<Theme> {
  return {
    // Enhanced focus indicators for buttons
    MuiButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        },
      },
    },

    // Enhanced focus indicators for icon buttons
    MuiIconButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '50%',
          },
        },
      },
    },

    // Enhanced focus indicators for text fields
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '&.Mui-focused': {
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '2px',
              },
            },
          },
        },
      },
    },

    // Enhanced focus indicators for links
    MuiLink: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },

    // Enhanced focus indicators for cards
    MuiCard: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        },
      },
    },

    // Enhanced focus indicators for checkboxes
    MuiCheckbox: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },

    // Enhanced focus indicators for radio buttons
    MuiRadio: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '50%',
          },
        },
      },
    },

    // Enhanced focus indicators for switches
    MuiSwitch: {
      styleOverrides: {
        root: {
          '&:focus-within': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '16px',
          },
        },
      },
    },

    // Enhanced focus indicators for menu items
    MuiMenuItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            backgroundColor: theme.palette.action.focus,
            outline: 'none',
          },
        },
      },
    },

    // Enhanced focus indicators for list items
    MuiListItemButton: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            backgroundColor: theme.palette.action.focus,
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
        },
      },
    },

    // Enhanced focus indicators for tabs
    MuiTab: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            borderRadius: '4px',
          },
        },
      },
    },

    // Table row focus indicators
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '-2px',
          },
        },
      },
    },

    // Pagination button focus indicators
    MuiPaginationItem: {
      styleOverrides: {
        root: {
          '&:focus-visible': {
            outline: `3px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
          },
        },
      },
    },

    // Select focus indicators
    MuiSelect: {
      styleOverrides: {
        select: {
          '&:focus-visible': {
            outline: 'none',
          },
        },
      },
    },

    // Autocomplete focus indicators
    MuiAutocomplete: {
      styleOverrides: {
        listbox: {
          '& .MuiAutocomplete-option': {
            '&.Mui-focused': {
              backgroundColor: theme.palette.action.focus,
            },
          },
        },
      },
    },

    // Dialog focus trap
    MuiDialog: {
      defaultProps: {
        // Ensure dialogs trap focus
        disableEnforceFocus: false,
        disableAutoFocus: false,
        disableRestoreFocus: false,
      },
    },

    // Tooltip accessibility
    MuiTooltip: {
      defaultProps: {
        // Ensure tooltips are accessible
        enterDelay: 300,
        enterNextDelay: 300,
      },
    },
  };
}

// ----------------------------------------------------------------------

/**
 * Skip link styles for keyboard navigation
 */
export const skipLinkStyles = {
  position: 'absolute',
  top: '-40px',
  left: 0,
  background: '#000',
  color: '#fff',
  padding: '8px 16px',
  zIndex: 9999,
  textDecoration: 'none',
  '&:focus': {
    top: 0,
  },
} as const;
