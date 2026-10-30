
import { useState } from "react";
import { NavLink, useLocation } from "react-router";

const navigationItems = [
  { label: "Panel Principal", path: "/" },
  { label: "Servicios Conectados", path: "/services" },
  { label: "Agenda", path: "/agenda" },
  { label: "Disponibilidad", path: "/availability" },
  { label: "Proyectos", path: "/projects" },
  { label: "Perfil", path: "/profile-visibility" },
];

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  function isCurrentPage(path: string) {
    if (path === "/") {
      return location.pathname === "/";
    }

    if (path === "/profile-visibility") {
      return (
        location.pathname === "/profile-visibility" ||
        location.pathname === "/profile-preview"
      );
    }

    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  }

  return (
    <header className="border-b border-orbita-outline bg-orbita-background">
      <div className="mx-auto flex min-h-[72px] max-w-7xl items-center justify-between gap-5 px-5 lg:px-8">
        <NavLink
          to="/"
          className="flex shrink-0 items-center gap-3"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full border border-orbita-primary/40 text-orbita-accent">
            <span className="relative flex h-4 w-4 items-center justify-center rounded-full border border-orbita-primary/60">
              <span className="h-1.5 w-1.5 rounded-full bg-orbita-primary" />
            </span>
          </span>

          <span className="font-heading text-lg font-bold text-orbita-text">
            Orbitia
          </span>
        </NavLink>

        <nav
          aria-label="Navegación principal"
          className="hidden items-center gap-1 xl:flex"
        >
          {navigationItems.map((item) => {
            const active = isCurrentPage(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/"}
                className={`rounded-md px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-orbita-primary font-medium text-[#00291A]"
                    : "text-orbita-muted hover:bg-orbita-surface hover:text-orbita-text"
                }`}
              >
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            aria-label="Notificaciones"
            className="relative rounded-lg p-2 text-orbita-text transition-colors hover:bg-orbita-surface"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="19"
              height="19"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
              <path d="M10 21h4" />
            </svg>

            <span className="absolute right-2 top-1.5 h-2 w-2 rounded-full bg-orbita-primary" />
          </button>

          <div className="hidden items-center gap-3 sm:flex">
            <div className="flex h-9 w-9 items-center justify-center rounded-full border border-orbita-outline bg-orbita-surface">
              <span className="font-heading text-xs font-semibold text-orbita-accent">
                MS
              </span>
            </div>

            <span className="font-body text-sm font-medium text-orbita-text">
              Mateo Silva
            </span>
          </div>

          <button
            type="button"
            aria-label={isMenuOpen ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={isMenuOpen}
            aria-controls="mobile-navigation"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="rounded-lg border border-orbita-outline p-2 text-orbita-text xl:hidden"
          >
            {isMenuOpen ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              >
                <path d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <nav
          id="mobile-navigation"
          aria-label="Navegación móvil"
          className="border-t border-orbita-outline px-5 py-4 xl:hidden"
        >
          <div className="mx-auto flex max-w-7xl flex-col gap-2">
            {navigationItems.map((item) => {
              const active = isCurrentPage(item.path);

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  end={item.path === "/"}
                  onClick={() => setIsMenuOpen(false)}
                  className={`rounded-lg px-4 py-3 text-sm transition-colors ${
                    active
                      ? "bg-orbita-primary font-semibold text-[#00291A]"
                      : "text-orbita-muted hover:bg-orbita-surface hover:text-orbita-text"
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

export default Navbar;
