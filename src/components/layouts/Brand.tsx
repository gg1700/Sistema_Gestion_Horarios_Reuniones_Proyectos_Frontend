import { Link } from 'react-router';
import { paths } from '../../constants/paths';

export function Brand({ to = paths.home, compact = false }: { to?: string; compact?: boolean }) {
  return <Link className="ui-brand" to={to} aria-label="Orbitia · inicio">
    <svg viewBox="0 0 38 38" width="38" height="38" fill="none" aria-hidden="true">
      <circle cx="19" cy="19" r="14.5" stroke="currentColor" opacity=".36" />
      <ellipse cx="19" cy="19" rx="17" ry="7.3" transform="rotate(-42 19 19)" stroke="currentColor" strokeWidth="1.3" />
      <circle cx="19" cy="19" r="4" fill="currentColor" /><circle cx="29.5" cy="8.5" r="2.6" fill="currentColor" />
    </svg>{!compact && <span>orbitia<span className="ui-brand__dot">.</span></span>}
  </Link>;
}
