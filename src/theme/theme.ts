import { createTheme, ThemeOptions } from '@mui/material/styles';

const baseTypography = {
  fontFamily: [
    '-apple-system',
    'BlinkMacSystemFont',
    '"Segoe UI"',
    'Roboto',
    '"Helvetica Neue"',
    'Arial',
    'sans-serif',
  ].join(','),
  h4: {
    fontWeight: 700,
    fontSize: '1.75rem',
    letterSpacing: '-0.02em',
  },
  h5: {
    fontWeight: 600,
    fontSize: '1.35rem',
    letterSpacing: '-0.01em',
  },
  h6: {
    fontWeight: 600,
    fontSize: '1.1rem',
    letterSpacing: '-0.01em',
  },
  subtitle1: {
    fontSize: '0.95rem',
    fontWeight: 500,
  },
  subtitle2: {
    fontSize: '0.85rem',
    fontWeight: 500,
  },
  body1: {
    fontSize: '0.925rem',
  },
  body2: {
    fontSize: '0.85rem',
  },
  button: {
    textTransform: 'none' as const,
    fontWeight: 600,
  },
};

const commonComponentOverrides: ThemeOptions['components'] = {
  MuiButton: {
    styleOverrides: {
      root: {
        borderRadius: 8,
        padding: '7px 16px',
        boxShadow: 'none',
        '&:hover': {
          boxShadow: 'none',
        },
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: 12,
        backgroundImage: 'none',
      },
    },
  },
  MuiPaper: {
    styleOverrides: {
      root: {
        backgroundImage: 'none',
      },
    },
  },
  MuiTableCell: {
    styleOverrides: {
      root: {
        padding: '12px 16px',
        fontSize: '0.875rem',
      },
      head: {
        fontWeight: 600,
        fontSize: '0.8rem',
        textTransform: 'uppercase',
        letterSpacing: '0.04em',
      },
    },
  },
  MuiChip: {
    styleOverrides: {
      root: {
        borderRadius: 6,
        fontWeight: 500,
        fontSize: '0.775rem',
        height: 24,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 12,
      },
    },
  },
  MuiTextField: {
    defaultProps: {
      size: 'small',
    },
  },
};

export const lightTheme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#2563eb',
      light: '#60a5fa',
      dark: '#1d4ed8',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#64748b',
      light: '#94a3b8',
      dark: '#475569',
    },
    background: {
      default: '#f8fafc',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',
      secondary: '#64748b',
    },
    divider: '#e2e8f0',
    info: {
      main: '#0284c7',
      light: '#e0f2fe',
    },
    warning: {
      main: '#d97706',
      light: '#fef3c7',
    },
    success: {
      main: '#16a34a',
      light: '#dcfce7',
    },
    error: {
      main: '#dc2626',
      light: '#fee2e2',
    },
  },
  typography: baseTypography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...commonComponentOverrides,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        ...commonComponentOverrides?.MuiTableCell?.styleOverrides,
        head: {
          backgroundColor: '#f8fafc',
          color: '#64748b',
          borderBottom: '1px solid #e2e8f0',
        },
      },
    },
  },
});

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
      contrastText: '#ffffff',
    },
    secondary: {
      main: '#94a3b8',
      light: '#cbd5e1',
      dark: '#64748b',
    },
    background: {
      default: '#0b0f17',
      paper: '#131a26',
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    },
    divider: '#1e293b',
    info: {
      main: '#38bdf8',
      light: '#082f49',
    },
    warning: {
      main: '#f59e0b',
      light: '#451a03',
    },
    success: {
      main: '#22c55e',
      light: '#052e16',
    },
    error: {
      main: '#ef4444',
      light: '#450a0a',
    },
  },
  typography: baseTypography,
  shape: {
    borderRadius: 8,
  },
  components: {
    ...commonComponentOverrides,
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          border: '1px solid #1e293b',
          backgroundColor: '#131a26',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.3)',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        ...commonComponentOverrides?.MuiTableCell?.styleOverrides,
        head: {
          backgroundColor: '#0f172a',
          color: '#94a3b8',
          borderBottom: '1px solid #1e293b',
        },
      },
    },
  },
});
