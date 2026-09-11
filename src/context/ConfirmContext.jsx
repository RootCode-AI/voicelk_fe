import { createContext, useContext, useState, useCallback, useRef } from 'react';
import ConfirmDialog from '../components/common/ConfirmDialog/ConfirmDialog';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children, isDark = false }) {
  const [request, setRequest] = useState(null);
  const resolver = useRef(null);

  const confirm = useCallback((message, options = {}) => {
    return new Promise((resolve) => {
      resolver.current = resolve;
      setRequest({
        message,
        title: options.title ?? 'Please confirm',
        confirmLabel: options.confirmLabel ?? 'Yes',
        cancelLabel: options.cancelLabel ?? 'No',
        danger: options.danger ?? false,
      });
    });
  }, []);

  const close = useCallback((result) => {
    setRequest(null);
    resolver.current?.(result);
    resolver.current = null;
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialog
        open={!!request}
        isDark={isDark}
        title={request?.title}
        message={request?.message}
        confirmLabel={request?.confirmLabel}
        cancelLabel={request?.cancelLabel}
        danger={request?.danger}
        onConfirm={() => close(true)}
        onCancel={() => close(false)}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) throw new Error('useConfirm must be used inside <ConfirmProvider>');
  return ctx.confirm;
}
