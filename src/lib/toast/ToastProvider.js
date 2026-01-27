import React, { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useTheme } from '../theme/ThemeProvider';

const ToastContext = createContext({ showToast: () => {} });

export function ToastProvider({ children }) {
  const [toastMessage, setToastMessage] = useState('');
  const timeoutRef = useRef(null);
  const { theme } = useTheme();

  const showToast = useCallback((message, duration = 2000) => {
    if (!message) {
      return;
    }

    setToastMessage(message);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => {
      setToastMessage('');
      timeoutRef.current = null;
    }, duration);
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toastMessage ? (
        <View style={styles.overlay} pointerEvents="none">
          <View
            style={[
              styles.toast,
              { backgroundColor: theme.colors.surface, borderColor: theme.colors.border },
            ]}
          >
            <Text style={[styles.toastText, { color: theme.colors.text }]}>
              {toastMessage}
            </Text>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const useToast = () => useContext(ToastContext);

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 32,
    alignItems: 'center',
  },
  toast: {
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 10,
    maxWidth: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 4,
  },
  toastText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
});
