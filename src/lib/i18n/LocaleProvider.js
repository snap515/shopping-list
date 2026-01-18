import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { getDeviceLocale, getLocale, initI18n, setLocale as persistLocale } from './index';

const LocaleContext = createContext({
  locale: 'en',
  setLocale: () => {},
});

export function LocaleProvider({ children }) {
  const [locale, setLocaleState] = useState(getLocale() || getDeviceLocale());

  useEffect(() => {
    let mounted = true;
    initI18n().then(() => {
      if (mounted) {
        setLocaleState(getLocale());
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const setLocale = async (nextLocale) => {
    await persistLocale(nextLocale);
    setLocaleState(nextLocale);
  };

  const value = useMemo(() => ({ locale, setLocale }), [locale]);

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export const useLocale = () => useContext(LocaleContext);
