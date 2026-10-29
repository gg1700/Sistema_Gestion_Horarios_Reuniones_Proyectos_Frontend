import { useEffect, type ReactNode } from 'react';
import { useLocation } from 'react-router';
import { FiChevronDown, FiMenu } from 'react-icons/fi';
import { useUI } from '../../contexts/UIContext';
import type { DisplayIdentity, NavigationItem } from '../../types/ui';
import { Avatar } from '../ui/Avatar';
import { Dialog } from '../modals/Dialog';
import { Brand } from './Brand';
import { Navigation } from './Navigation';

export interface AppHeaderProps {
  navigation: NavigationItem[];
  identity?: DisplayIdentity;
  onAccountClick?: () => void;
  actions?: ReactNode;
  brandTo?: string;
}

export function AppHeader({ navigation, identity, onAccountClick, actions, brandTo }: AppHeaderProps) {
  const { mobileNavigationOpen, openNavigation, closeNavigation } = useUI();
  const { pathname } = useLocation();
  useEffect(() => { closeNavigation(); }, [pathname, closeNavigation]);

  const identityContent = identity && <><Avatar name={identity.name} src={identity.imageUrl} size="small" />
    <span className="ui-header__identity-text"><strong>{identity.name}</strong>{identity.subtitle && <small>{identity.subtitle}</small>}</span>{onAccountClick && <FiChevronDown aria-hidden="true" />}</>;

  return <header className="ui-header"><div className="ui-header__inner">
    <Brand to={brandTo} />
    <div className="ui-header__desktop-navigation"><Navigation items={navigation} /></div>
    <div className="ui-header__actions">{actions}
      {identity && (onAccountClick ? <button type="button" className="ui-header__identity" onClick={onAccountClick} aria-label={`Abrir cuenta de ${identity.name}`}>{identityContent}</button> : <div className="ui-header__identity">{identityContent}</div>)}
      {navigation.length > 0 && <button type="button" className="ui-icon-button ui-header__menu" aria-label="Abrir navegación" aria-haspopup="dialog" aria-expanded={mobileNavigationOpen} onClick={openNavigation}><FiMenu aria-hidden="true" /></button>}
    </div>
    <Dialog open={mobileNavigationOpen} onOpenChange={value => { if (!value) closeNavigation(); }} title="Navegación" className="ui-navigation-drawer" size="small">
      <Navigation items={navigation} vertical onNavigate={closeNavigation} />
    </Dialog>
  </div></header>;
}
