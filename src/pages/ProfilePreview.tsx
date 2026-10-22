
import { useNavigate } from "react-router";
import Navbar from "../components/layouts/Navbar";
import PublicProfile from "../components/features/profile/PublicProfile";
import useProfilePreview from "../hooks/useProfilePreview";

function ProfilePreview() {
  const navigate = useNavigate();

  const {
    profile,
    isLoading,
    error,
    loadProfile,
  } = useProfilePreview();

  return (
    <main className="min-h-screen bg-orbita-background font-body text-orbita-text">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-12">
        <p className="mb-5 hidden font-code text-xs font-semibold tracking-widest text-orbita-accent md:block">
          GESTIÓN DE CUENTA / PERFIL PÚBLICO
        </p>

        <div className="mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold sm:text-3xl lg:text-4xl">
              Vista previa del perfil público
            </h1>

            <p className="mt-3 max-w-2xl text-sm text-orbita-muted">
              Así es como otras personas verán tu perfil según la
              configuración de visibilidad que guardaste.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("/profile-visibility")}
            className="rounded-lg border border-orbita-outline bg-orbita-surface px-5 py-3 text-sm font-semibold text-orbita-text hover:border-orbita-primary"
          >
            Configurar visibilidad
          </button>
        </div>

        <div className="mb-7 rounded-xl border border-orbita-outline bg-orbita-card px-5 py-4">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 text-orbita-accent">●</span>

            <div>
              <p className="text-sm font-semibold">
                Modo vista previa
              </p>

              <p className="mt-1 text-sm text-orbita-muted">
                Estás viendo únicamente la información que configuraste
                como pública. Los datos ocultos no se muestran aquí.
              </p>
            </div>
          </div>
        </div>

        {isLoading && (
          <section className="rounded-xl border border-orbita-outline bg-orbita-card p-10 text-center">
            <p className="text-sm text-orbita-muted">
              Cargando vista previa del perfil...
            </p>
          </section>
        )}

        {!isLoading && error && (
          <section className="rounded-xl border border-orbita-outline bg-orbita-card p-8 text-center">
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>

            <button
              type="button"
              onClick={loadProfile}
              className="mt-5 rounded-lg bg-orbita-primary px-5 py-3 text-sm font-semibold text-[#00291A]"
            >
              Reintentar
            </button>
          </section>
        )}

        {!isLoading && !error && profile && (
          <PublicProfile profile={profile} />
        )}

        <div className="mt-8 flex justify-start">
          <button
            type="button"
            onClick={() => navigate("/profile-visibility")}
            className="rounded-lg border border-orbita-outline px-5 py-3 text-sm font-semibold text-orbita-text hover:border-orbita-primary"
          >
            ← Volver a configuración
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProfilePreview;
