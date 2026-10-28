import type { PropsWithChildren } from 'react';
import type { AppHeaderProps } from './AppHeader';
import { AppLayout } from './AppLayout';

export function PublicLayout({ children, navigation = [], ...props }: PropsWithChildren<Partial<AppHeaderProps>>) {
  return <AppLayout {...props} navigation={navigation}>{children}</AppLayout>;
}
