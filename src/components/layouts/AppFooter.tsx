import type { ReactNode } from 'react';

export function AppFooter({ links }: { links?: ReactNode }) {
  return <footer className="ui-footer"><span>© {new Date().getFullYear()} Orbitia</span>
    <span className="ui-footer__tagline">Un espacio. Todas tus conexiones.</span>{links && <nav aria-label="Enlaces del pie">{links}</nav>}<span className="ui-footer__signature">HECHO PARA CONECTAR</span>
  </footer>;
}
