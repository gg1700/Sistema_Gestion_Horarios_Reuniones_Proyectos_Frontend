import type { PropsWithChildren } from 'react';
import { ToastViewport } from '../components/layouts/ToastViewport';
import { UIProvider } from './UIContext';

export function AppProviders({ children }: PropsWithChildren) {
  return <UIProvider>{children}<ToastViewport /></UIProvider>;
}
