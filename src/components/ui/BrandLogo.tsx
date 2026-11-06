import { Link } from 'react-router';
import { routePaths } from '../../constants/routes';

function BrandLogo() {
  return (
    <Link to={routePaths.home} aria-label="Orbitia, ir al inicio" className="flex shrink-0 items-center gap-2.5 text-ui-mint">
      <svg viewBox="0 0 38 38" className="h-9 w-9" fill="none" aria-hidden="true">
        <circle cx="19" cy="19" r="14.5" stroke="currentColor" strokeOpacity="0.36" />
        <ellipse cx="19" cy="19" rx="17" ry="7.3" transform="rotate(-42 19 19)" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="19" cy="19" r="4" fill="currentColor" />
        <circle cx="29.5" cy="8.5" r="2.6" fill="currentColor" />
      </svg>
      <span className="font-heading text-[1.9rem] leading-none font-semibold tracking-tight text-ui-text">
        orbitia<span className="text-ui-mint">.</span>
      </span>
    </Link>
  );
}

export default BrandLogo;
