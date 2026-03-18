import { useState, useCallback } from 'react';
import toast, { Toast } from 'react-hot-toast';

interface NotificationOptions {
  duration?: number;
  position?: 'top-left' | 'top-center' | 'top-right' | 'bottom-left' | 'bottom-center' | 'bottom-right';
  icon?: string;
}

interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning' | 'loading';
  message: string;
  timestamp: Date;
}

export function useNotification() {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const notify = useCallback((
    message: string,
    type: 'success' | 'error' | 'info' | 'warning' = 'info',
    options?: NotificationOptions
  ) => {
    const id = Date.now().toString();
    const notification: Notification = {
      id,
      type,
      message,
      timestamp: new Date(),
    };

    setNotifications(prev => [...prev, notification]);

    switch (type) {
      case 'success':
        toast.success(message, {
          duration: options?.duration || 4000,
          position: options?.position || 'top-right',
          icon: options?.icon || '✅',
        });
        break;
      case 'error':
        toast.error(message, {
          duration: options?.duration || 5000,
          position: options?.position || 'top-right',
          icon: options?.icon || '❌',
        });
        break;
      case 'warning':
        toast(message, {
          duration: options?.duration || 4000,
          position: options?.position || 'top-right',
          icon: options?.icon || '⚠️',
        });
        break;
      default:
        toast(message, {
          duration: options?.duration || 3000,
          position: options?.position || 'top-right',
          icon: options?.icon || 'ℹ️',
        });
    }

    return id;
  }, []);

  const success = useCallback((message: string, options?: NotificationOptions) => {
    return notify(message, 'success', options);
  }, [notify]);

  const error = useCallback((message: string, options?: NotificationOptions) => {
    return notify(message, 'error', options);
  }, [notify]);

  const warning = useCallback((message: string, options?: NotificationOptions) => {
    return notify(message, 'warning', options);
  }, [notify]);

  const info = useCallback((message: string, options?: NotificationOptions) => {
    return notify(message, 'info', options);
  }, [notify]);

  const loading = useCallback((message: string = 'Loading...') => {
    return toast.loading(message);
  }, []);

  const dismiss = useCallback((toastId?: string) => {
    if (toastId) {
      toast.dismiss(toastId);
    } else {
      toast.dismiss();
    }
  }, []);

  const promise = useCallback(<T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    }
  ) => {
    return toast.promise(
      promise,
      {
        loading: messages.loading,
        success: messages.success,
        error: messages.error,
      }
    );
  }, []);

  const custom = useCallback((content: React.ReactNode, options?: NotificationOptions) => {
    return toast.custom(content, {
      duration: options?.duration || 4000,
      position: options?.position || 'top-right',
    });
  }, []);

  const clearAll = useCallback(() => {
    toast.dismiss();
    setNotifications([]);
  }, []);

  const clearNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  return {
    notify,
    success,
    error,
    warning,
    info,
    loading,
    dismiss,
    promise,
    custom,
    clearAll,
    clearNotification,
    notifications,
  };
}