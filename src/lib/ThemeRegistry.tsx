'use client';

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore } from 'react';
import { ThemeProvider, type PaletteMode } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v16-appRouter';
import { getTheme } from '@/theme/theme';

// ────────────────────────────────────────────
// Theme Mode Context
// ────────────────────────────────────────────

const STORAGE_KEY = 'fixio-theme-mode';

interface ThemeModeContextValue {
  mode: PaletteMode;
  toggleTheme: () => void;
  isDark: boolean;
}

const ThemeModeContext = createContext<ThemeModeContextValue>({
  mode: 'light',
  toggleTheme: () => {},
  isDark: false,
});

export function useThemeMode(): ThemeModeContextValue {
  return useContext(ThemeModeContext);
}

// ────────────────────────────────────────────
// External store for theme mode (avoids setState in useEffect)
// ────────────────────────────────────────────

type Listener = () => void;
const listeners = new Set<Listener>();

function getStoredMode(): PaletteMode {
  if (globalThis.window === undefined) return 'light';
  const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
  if (stored === 'dark' || stored === 'light') return stored;
  if (globalThis.matchMedia?.('(prefers-color-scheme: dark)').matches) return 'dark';
  return 'light';
}

let currentMode: PaletteMode = 'light';

function subscribe(listener: Listener): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): PaletteMode {
  return currentMode;
}

function getServerSnapshot(): PaletteMode {
  return 'light';
}

function setModeExternal(next: PaletteMode): void {
  if (next === currentMode) return;
  currentMode = next;
  globalThis.localStorage?.setItem(STORAGE_KEY, next);
  listeners.forEach((l) => l());
}

// Initialize on client
if (globalThis.window !== undefined) {
  currentMode = getStoredMode();
}

// ────────────────────────────────────────────
// ThemeRegistry — provider with dark mode support
// ────────────────────────────────────────────

export default function ThemeRegistry({ children }: Readonly<{ children: React.ReactNode }>) {
  const mode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const toggleTheme = useCallback(() => {
    setModeExternal(mode === 'light' ? 'dark' : 'light');
  }, [mode]);

  const theme = useMemo(() => getTheme(mode), [mode]);

  const contextValue = useMemo<ThemeModeContextValue>(
    () => ({ mode, toggleTheme, isDark: mode === 'dark' }),
    [mode, toggleTheme],
  );

  return (
    <AppRouterCacheProvider options={{ enableCssLayer: true }}>
      <ThemeModeContext.Provider value={contextValue}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          {children}
        </ThemeProvider>
      </ThemeModeContext.Provider>
    </AppRouterCacheProvider>
  );
}
