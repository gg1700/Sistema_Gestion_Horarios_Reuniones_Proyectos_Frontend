import type { ReactNode } from 'react';

export type FeedbackTone = 'success' | 'info' | 'warning' | 'danger';

export interface NavigationItem {
  to: string;
  label: string;
  icon?: ReactNode;
  end?: boolean;
  disabled?: boolean;
  active?: boolean;
}

export interface DisplayIdentity {
  name: string;
  subtitle?: string;
  imageUrl?: string | null;
}

export interface ToastMessage {
  id: number;
  message: string;
  tone: FeedbackTone;
}
