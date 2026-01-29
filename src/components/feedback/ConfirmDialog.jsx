import { useState, createContext, useContext, useCallback } from 'react';
import { Button } from '../ui/Button';
import { cn } from '../../utils/cn';

const ConfirmContext = createContext();

function ConfirmDialogComponent({
  isOpen,
  title,
  message,
  confirmText,
  cancelText,
  variant,
  onConfirm,
  onCancel
}) {
  if (!isOpen) return null;

  const variantStyles = {
    danger: 'bg-red-600 hover:bg-red-700 focus:ring-red-500',
    warning: 'bg-amber-600 hover:bg-amber-700 focus:ring-amber-500',
    info: 'bg-accent-500 hover:bg-accent-600 focus:ring-accent-500',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-sm transition-opacity"
        onClick={onCancel}
      />
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-xl shadow-modal w-full max-w-md p-6 animate-slide-up">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {title}
          </h3>
          <p className="text-sm text-gray-600 mb-6">
            {message}
          </p>
          <div className="flex gap-3 justify-end">
            <Button variant="secondary" onClick={onCancel}>
              {cancelText}
            </Button>
            <button
              onClick={onConfirm}
              className={cn(
                'px-4 py-2 text-sm font-medium text-white rounded-lg',
                'transition-all duration-150',
                'focus:outline-none focus:ring-2 focus:ring-offset-2',
                variantStyles[variant]
              )}
            >
              {confirmText}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({
    isOpen: false,
    title: '',
    message: '',
    confirmText: 'Confirm',
    cancelText: 'Cancel',
    variant: 'danger',
    resolve: null,
  });

  const confirm = useCallback((config) => {
    return new Promise((resolve) => {
      setState({
        isOpen: true,
        title: config.title || 'Confirm Action',
        message: config.message || 'Are you sure you want to proceed?',
        confirmText: config.confirmText || 'Confirm',
        cancelText: config.cancelText || 'Cancel',
        variant: config.variant || 'danger',
        resolve,
      });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    state.resolve?.(true);
    setState((s) => ({ ...s, isOpen: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resolve]);

  const handleCancel = useCallback(() => {
    state.resolve?.(false);
    setState((s) => ({ ...s, isOpen: false }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.resolve]);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      <ConfirmDialogComponent
        isOpen={state.isOpen}
        title={state.title}
        message={state.message}
        confirmText={state.confirmText}
        cancelText={state.cancelText}
        variant={state.variant}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const context = useContext(ConfirmContext);
  if (!context) {
    throw new Error('useConfirm must be used within a ConfirmProvider');
  }
  return context;
}
