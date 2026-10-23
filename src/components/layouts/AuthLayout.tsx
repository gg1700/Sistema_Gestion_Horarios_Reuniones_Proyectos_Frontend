import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { routePaths } from '../../constants/routes';

interface AuthLayoutProps {
  children: ReactNode;
}

function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-orbita-background font-body text-orbita-text">
      <header className="border-b border-orbita-outline px-6 py-4">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <Link to={routePaths.home} className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full border-2 border-orbita-primary" />
            <span className="font-heading text-lg font-semibold">Orbitia</span>
          </Link>
          <nav className="flex items-center gap-6 text-sm text-orbita-muted">
            <a href="#ayuda" className="hover:text-orbita-text">Ayuda</a>
            <Link to={routePaths.login} className="hover:text-orbita-text">Acceder</Link>
          </nav>
        </div>
      </header>

      <main className="relative flex flex-1 justify-center overflow-hidden px-4 py-12">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute top-10 left-1/2 h-[480px] w-[640px] -translate-x-1/2 rounded-full bg-orbita-primary/10 blur-3xl"
        />
        <div className="relative w-full max-w-xl">{children}</div>
      </main>

      <footer className="border-t border-orbita-outline px-6 py-4 text-xs text-orbita-muted">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <span>© 2026 Orbitia.</span>
          <div className="flex gap-6">
            <a href="#privacidad" className="hover:text-orbita-text">Privacidad</a>
            <a href="#terminos" className="hover:text-orbita-text">Términos</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
