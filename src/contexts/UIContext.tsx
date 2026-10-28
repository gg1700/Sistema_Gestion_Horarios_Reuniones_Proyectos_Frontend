import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type PropsWithChildren } from 'react';
import type { FeedbackTone, ToastMessage } from '../types/ui';

interface UIContextValue {
  mobileNavigationOpen: boolean;
  openNavigation: () => void;
  closeNavigation: () => void;
  toggleNavigation: () => void;
  toasts: ToastMessage[];
  notify: (message: string, tone?: FeedbackTone, duration?: number) => number;
  dismissToast: (id: number) => void;
}

const UIContext = createContext<UIContextValue | null>(null);

export function UIProvider({ children }: PropsWithChildren) {
  const [mobileNavigationOpen, setMobileNavigationOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const nextId = useRef(0);
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>());
  const openNavigation = useCallback(() => setMobileNavigationOpen(true), []);
  const closeNavigation = useCallback(() => setMobileNavigationOpen(false), []);
  const toggleNavigation = useCallback(() => setMobileNavigationOpen(value => !value), []);
  const dismissToast = useCallback((id: number) => {
    clearTimeout(timers.current.get(id));
    timers.current.delete(id);
    setToasts(current => current.filter(toast => toast.id !== id));
  }, []);
  const notify = useCallback((message: string, tone: FeedbackTone = 'info', duration = 5000) => {
    const id = ++nextId.current;
    setToasts(current => [...current, { id, message, tone }]);
    if (duration > 0) timers.current.set(id, setTimeout(() => dismissToast(id), duration));
    return id;
  }, [dismissToast]);

  useEffect(() => {
    const pendingTimers = timers.current;
    return () => { pendingTimers.forEach(clearTimeout); pendingTimers.clear(); };
  }, []);

  const value = useMemo(() => ({
    mobileNavigationOpen, openNavigation, closeNavigation, toggleNavigation, toasts, notify, dismissToast,
  }), [mobileNavigationOpen, openNavigation, closeNavigation, toggleNavigation, toasts, notify, dismissToast]);
  return <UIContext.Provider value={value}>{children}</UIContext.Provider>;
}

export function useUI(): UIContextValue {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI debe utilizarse dentro de UIProvider.');
  return context;
}
