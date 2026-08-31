import React, { useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, CssBaseline, useMediaQuery } from '@mui/material';
import { lightTheme, darkTheme } from './theme';
import { useUIStore } from '../store/uiStore';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const themeMode = useUIStore((state) => state.themeMode);
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

  const activeTheme = useMemo(() => {
    if (themeMode === 'system') {
      return prefersDarkMode ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, prefersDarkMode]);

  return (
    <MuiThemeProvider theme={activeTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
};
