import type { ReactNode } from 'react';
import BrandLogo from '../ui/BrandLogo';

interface AuthLayoutProps {
  children: ReactNode;
  headerContent?: ReactNode;
}

const containerClassName = 'mx-auto w-full max-w-[90rem] px-4 sm:px-10 lg:px-16';

function AuthLayout({ children, headerContent }: AuthLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-ui-background font-body text-ui-sage">
      <header className={containerClassName}>
        <div className="flex min-h-24 items-center justify-between gap-6 border-b border-[#1D2C30]">
          <BrandLogo />
          {headerContent}
        </div>
      </header>

      <main className={`${containerClassName} flex-1 py-8`}>{children}</main>

      <footer className={containerClassName}>
        <div className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-t border-[#1D2C30] py-4 text-[10px] text-ui-soft">
          <span>© 2026 Orbitia</span>
          <span className="flex items-center gap-2">
            <span className="text-[#77B69C]">•</span>
            Un espacio. Todas tus conexiones.
          </span>
          <span className="text-[8px] tracking-[0.2em] uppercase">Hecho para conectar</span>
        </div>
      </footer>
    </div>
  );
}

export default AuthLayout;
