import { NavLink } from 'react-router';
import type { NavigationItem } from '../../types/ui';
import { classNames } from '../../utils/classNames';

export function Navigation({ items, label = 'Navegación principal', vertical = false, onNavigate }: {
  items: NavigationItem[]; label?: string; vertical?: boolean; onNavigate?: () => void;
}) {
  return <nav aria-label={label} className={classNames('ui-navigation', vertical && 'ui-navigation--vertical')}>
    {items.map(item => item.disabled ? <span key={item.to} className="ui-navigation__link ui-navigation__link--disabled" aria-disabled="true">{item.icon}{item.label}</span> : <NavLink key={item.to} to={item.to} end={item.end}
      className={({ isActive }) => classNames('ui-navigation__link', (item.active ?? isActive) && 'ui-navigation__link--active')}
      onClick={onNavigate}>
      {item.icon && <span aria-hidden="true">{item.icon}</span>}{item.label}
    </NavLink>)}
  </nav>;
}
