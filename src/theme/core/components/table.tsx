import type { Theme, Components } from '@mui/material/styles';

import { varAlpha } from 'minimal-shared/utils';

import { tableRowClasses } from '@mui/material/TableRow';
import { tableCellClasses } from '@mui/material/TableCell';

// ----------------------------------------------------------------------

const MuiTableContainer: Components<Theme>['MuiTableContainer'] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      ...theme.mixins.scrollbarStyles(theme),
      position: 'relative',
    }),
  },
};

const MuiTableRow: Components<Theme>['MuiTableRow'] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      transition: 'background-color 0.15s ease-in-out',
      [`&.${tableRowClasses.selected}`]: {
        backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.08),
        '&:hover': {
          backgroundColor: varAlpha(theme.vars.palette.primary.mainChannel, 0.12),
        },
      },
      '&:last-of-type': {
        [`& .${tableCellClasses.root}`]: {
          border: 0,
        },
      },
    }),
  },
};

const MuiTableCell: Components<Theme>['MuiTableCell'] = {
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      borderBottomStyle: 'solid',
      borderBottomColor:
        theme.palette.mode === 'dark'
          ? 'rgba(255, 255, 255, 0.06)'
          : 'rgba(0, 0, 0, 0.06)',
      padding: theme.spacing(1.5, 2),
    }),
    head: ({ theme }) => ({
      fontSize: theme.typography.pxToRem(11),
      color: theme.vars.palette.text.secondary,
      fontWeight: 600,
      textTransform: 'uppercase',
      letterSpacing: '0.75px',
      backgroundColor:
        theme.palette.mode === 'dark'
          ? theme.vars.palette.grey[900]
          : theme.vars.palette.grey[50],
      padding: theme.spacing(1.75, 2),
      borderBottomColor: theme.vars.palette.divider,
    }),
    stickyHeader: ({ theme }) => ({
      backgroundColor:
        theme.palette.mode === 'dark'
          ? theme.vars.palette.grey[900]
          : theme.vars.palette.grey[50],
    }),
    paddingCheckbox: ({ theme }) => ({
      paddingLeft: theme.spacing(1),
    }),
  },
};

const MuiTablePagination: Components<Theme>['MuiTablePagination'] = {
  // ▼▼▼▼▼▼▼▼ ⚙️ PROPS ▼▼▼▼▼▼▼▼
  defaultProps: {
    backIconButtonProps: { size: 'small' },
    nextIconButtonProps: { size: 'small' },
    slotProps: { select: { name: 'table-pagination-select' } },
  },
  // ▼▼▼▼▼▼▼▼ 🎨 STYLE ▼▼▼▼▼▼▼▼
  styleOverrides: {
    root: ({ theme }) => ({
      width: '100%',
      borderTop: `1px solid ${theme.palette.divider}`,
    }),
    toolbar: { height: 56 },
    actions: { marginRight: 8 },
    select: {
      display: 'flex',
      alignItems: 'center',
    },
    selectIcon: {
      right: 4,
      width: 16,
      height: 16,
      top: 'calc(50% - 8px)',
    },
  },
};

/* **********************************************************************
 * 🚀 Export
 * **********************************************************************/
export const table: Components<Theme> = {
  MuiTableRow,
  MuiTableCell,
  MuiTableContainer,
  MuiTablePagination,
};
