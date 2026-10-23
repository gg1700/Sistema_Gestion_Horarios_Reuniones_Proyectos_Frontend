import { useEffect } from 'react';
import { Link } from 'react-router';
import PublicProfile from '../components/features/profile/PublicProfile';
import usePublicProfile from '../hooks/usePublicProfile';

function PublicProfilePage() {
  const { handleName, profile } = usePublicProfile();

  useEffect(() => {
    const previousTitle = document.title;
    const existingMeta = document.querySelector<HTMLMetaElement>(
      'meta[name="description"]',
    );
    const previousDescription = existingMeta?.getAttribute('content') ?? null;

    const meta = existingMeta ?? document.createElement('meta');

    if (!existingMeta) {
      meta.name = 'description';
      document.head.appendChild(meta);
    }

    if (profile) {
      document.title = `${profile.name} ${profile.firstLastName} | Orbitia`;
      meta.content = `Perfil público de ${profile.name} ${profile.firstLastName} en Orbitia.`;
    } else {
      document.title = 'Perfil no encontrado | Orbitia';
      meta.content = 'El perfil público solicitado no está disponible.';
    }

    return () => {
      document.title = previousTitle;

      if (!existingMeta) {
        meta.remove();
      } else if (previousDescription === null) {
        meta.removeAttribute('content');
      } else {
        meta.setAttribute('content', previousDescription);
      }
    };
  }, [profile]);

  return (
    <main className="min-h-screen bg-orbita-background px-5 py-10 font-body text-orbita-text md:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 flex flex-wrap items-center justify-between gap-4 border-b border-orbita-outline pb-6">
          <Link
            to="/"
            className="font-heading text-2xl font-semibold text-orbita-accent"
          >
            Orbitia
          </Link>

          <span className="rounded-full bg-orbita-surface px-4 py-2 text-xs text-orbita-accent">
            Vista pública · Datos simulados
          </span>
        </header>

        {profile ? (
          <>
            <div className="mb-8">
              <p className="text-sm font-medium text-orbita-accent">
                PERFIL PÚBLICO
              </p>

              <h1 className="mt-3 font-heading text-3xl font-semibold md:text-4xl">
                Perfil de @{handleName}
              </h1>

              <p className="mt-3 text-sm text-orbita-muted">
                Información pública compartida por el usuario.
              </p>
            </div>

            <PublicProfile profile={profile} />
          </>
        ) : (
          <section className="mx-auto max-w-xl rounded-2xl border border-orbita-outline bg-orbita-card p-8 text-center md:p-12">
            <p className="font-heading text-5xl font-semibold text-orbita-accent">
              404
            </p>

            <h1 className="mt-6 font-heading text-2xl font-semibold">
              Perfil no encontrado
            </h1>

            <p className="mt-4 text-sm leading-7 text-orbita-muted">
              El perfil solicitado no existe o su enlace público
              está desactivado.
            </p>

            <Link
              to="/"
              className="mt-8 inline-flex rounded-lg bg-orbita-primary px-6 py-3 text-sm font-semibold text-orbita-background transition-colors hover:bg-orbita-accent"
            >
              Volver al inicio
            </Link>
          </section>
        )}
      </div>
    </main>
  );
}

export default PublicProfilePage;
