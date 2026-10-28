import { useId, type PropsWithChildren, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import { currentNavigation } from '../../constants/navigation';
import { AppHeader, type AppHeaderProps } from './AppHeader';
import { AppFooter } from './AppFooter';

export function AppLayout({ children, navigation = currentNavigation, footerLinks, ...header }: PropsWithChildren<
  Omit<AppHeaderProps, 'navigation'> & { navigation?: AppHeaderProps['navigation']; footerLinks?: ReactNode }
>) {
  const mainId = useId();
  return <div className="ui-app-layout"><a className="ui-skip-link" href={`#${mainId}`}>Saltar al contenido</a>
    <AppHeader {...header} navigation={navigation} /><main id={mainId} className="ui-content" tabIndex={-1}>{children ?? <Outlet />}</main>
    <AppFooter links={footerLinks} />
  </div>;
}
