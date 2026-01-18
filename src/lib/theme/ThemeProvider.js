import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { initTheme, persistTheme, themes } from './index';

const ThemeContext = createContext({
  theme: themes.light,
  setThemeId: () => {},
});

export function ThemeProvider({ children }) {
  const [themeId, setThemeIdState] = useState('light');

  useEffect(() => {
    let mounted = true;
    initTheme().then((id) => {
      if (mounted) {
        setThemeIdState(id);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setThemeId = async (id) => {
    await persistTheme(id);
    setThemeIdState(id);
  };

  const value = useMemo(
    () => ({
      theme: themes[themeId] || themes.light,
      themeId,
      setThemeId,
    }),
    [themeId]
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export const useTheme = () => useContext(ThemeContext);
