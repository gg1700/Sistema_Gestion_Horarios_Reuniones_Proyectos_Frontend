import { useId, type PropsWithChildren, type ReactNode } from 'react';
import { Outlet } from 'react-router';
import type { NavigationItem } from '../../types/ui';
import { AppHeader, type AppHeaderProps } from './AppHeader';
import { Navigation } from './Navigation';
import { AppFooter } from './AppFooter';

// Contenedor visual: no simula roles ni concede permisos.
export function AdminLayout({ children, navigation, sidebarFooter, ...header }: PropsWithChildren<
  Omit<AppHeaderProps, 'navigation'> & { navigation: NavigationItem[]; sidebarFooter?: ReactNode }
>) {
  const mainId = useId();
  return <div className="ui-app-layout ui-app-layout--admin"><a className="ui-skip-link" href={`#${mainId}`}>Saltar al contenido</a>
    <AppHeader {...header} navigation={navigation} /><div className="ui-admin-layout">
      <aside className="ui-sidebar"><p className="ui-eyebrow">Administración</p><Navigation items={navigation} vertical label="Navegación administrativa" />
        {sidebarFooter && <div className="ui-sidebar__footer">{sidebarFooter}</div>}</aside>
      <main id={mainId} className="ui-content" tabIndex={-1}>{children ?? <Outlet />}</main>
    </div><AppFooter />
  </div>;
}
