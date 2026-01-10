import 'src/global.css';

import { useEffect } from 'react';

import { SWRConfig } from 'swr';
import { Toaster } from 'sonner';

import { usePathname } from 'src/routes/hooks';

import { themeConfig, ThemeProvider } from 'src/theme';

import { swrConfig } from 'src/lib/swr-config';

import { ProgressBar } from 'src/components/progress-bar';
import { MotionLazy } from 'src/components/animate/motion-lazy';
import { LocalizationProvider } from 'src/components/localization-provider';
import { SettingsDrawer, defaultSettings, SettingsProvider } from 'src/components/settings';

import { AuthProvider } from 'src/auth/context/jwt';

// ----------------------------------------------------------------------

type AppProps = {
  children: React.ReactNode;
};

export default function App({ children }: AppProps) {
  useScrollToTop();

  return (
    <SWRConfig value={swrConfig}>
      <AuthProvider>
        <SettingsProvider defaultSettings={defaultSettings}>
          <LocalizationProvider>
            <ThemeProvider
              modeStorageKey={themeConfig.modeStorageKey}
              defaultMode={themeConfig.defaultMode}
            >
              <MotionLazy>
                <ProgressBar />
                <SettingsDrawer defaultSettings={defaultSettings} />
                <Toaster position="top-right" richColors closeButton />
                {children}
              </MotionLazy>
            </ThemeProvider>
          </LocalizationProvider>
        </SettingsProvider>
      </AuthProvider>
    </SWRConfig>
  );
}

// ----------------------------------------------------------------------

function useScrollToTop() {
  const pathname = usePathname();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
