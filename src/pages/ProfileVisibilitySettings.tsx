
import { useNavigate } from "react-router";
import Navbar from "../components/layouts/Navbar";
import VisibilityField from "../components/features/profile/VisibilityField";
import {
  permanentPublicFields,
  visibilityFields,
} from "../constants/profileVisibility";
import useProfileVisibility from "../hooks/useProfileVisibility";

function ProfileVisibilitySettings() {
  const navigate = useNavigate();

  const {
    visibility,
    isLoading,
    isSaving,
    error,
    message,
    hasPendingChanges,
    visibleCount,
    hiddenCount,
    toggleVisibility,
    saveChanges,
  } = useProfileVisibility();

  return (
    <main className="min-h-screen bg-orbita-background font-body text-orbita-text">
      <Navbar />

      <div className="mx-auto max-w-7xl px-5 py-9 lg:px-8 lg:py-12">
        <p className="mb-5 hidden font-code text-xs font-semibold tracking-widest text-orbita-accent md:block">
          GESTIÓN DE CUENTA / PERFIL
        </p>

        <div className="mb-8">
          <h1 className="font-heading text-2xl font-semibold sm:text-3xl lg:text-4xl">
            Configuración de visibilidad
          </h1>

          <p className="mt-3 text-sm text-orbita-muted">
            Controla qué información se muestra en tu perfil público.
          </p>
        </div>

        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_330px]">
          <section className="rounded-xl border border-orbita-outline bg-orbita-card p-4 sm:p-6 lg:p-7">
            <h2 className="font-heading text-xl font-semibold">
              Información visible
            </h2>

            <p className="mt-2 text-sm text-orbita-muted">
              Activa los datos que deseas compartir con otras personas.
            </p>

            {isLoading ? (
              <p className="py-12 text-center text-sm text-orbita-muted">
                Cargando configuración...
              </p>
            ) : (
              <div className="mt-6">
                {visibilityFields.map((field) => (
                  <VisibilityField
                    key={field.key}
                    field={field}
                    checked={visibility[field.key]}
                    disabled={isSaving}
                    onChange={() => toggleVisibility(field.key)}
                  />
                ))}
              </div>
            )}
          </section>

          <aside className="space-y-5">
            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold">
                Información permanente
              </h2>

              <p className="mt-3 text-sm text-orbita-muted">
                Estos campos siempre serán públicos:
              </p>

              <div className="mt-5 space-y-4">
                {permanentPublicFields.map((field) => (
                  <div
                    key={field}
                    className="flex items-center gap-3"
                  >
                    <span className="text-orbita-accent">✓</span>
                    <span className="text-sm">{field}</span>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-5 sm:p-6">
              <h2 className="font-heading text-lg font-semibold">
                Estado de los cambios
              </h2>

              <p className="mt-3 text-sm text-orbita-muted">
                {visibleCount} campos visibles · {hiddenCount} campos ocultos
              </p>

              <p
                role="status"
                className={`mt-3 text-xs ${
                  hasPendingChanges
                    ? "text-orbita-accent"
                    : "text-orbita-muted"
                }`}
              >
                {hasPendingChanges
                  ? "Tienes cambios pendientes de guardar."
                  : "No hay cambios pendientes."}
              </p>

              <button
                type="button"
                onClick={() => navigate("/profile-preview")}
                className="mt-5 w-full rounded-lg border border-orbita-outline bg-orbita-surface px-4 py-3 text-sm font-semibold text-orbita-text hover:border-orbita-primary"
              >
                Vista previa
              </button>
            </section>
          </aside>
        </div>

        {(error || message) && (
          <p
            role={error ? "alert" : "status"}
            className={`mt-5 rounded-lg border p-4 text-sm ${
              error
                ? "border-[#75423D] bg-[#3B2422] text-[#FFB4AB]"
                : "border-orbita-primary bg-orbita-card text-orbita-accent"
            }`}
          >
            {error || message}
          </p>
        )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={saveChanges}
            disabled={isLoading || isSaving || !hasPendingChanges}
            className="w-full rounded-lg bg-orbita-primary px-7 py-3 text-sm font-semibold text-[#00291A] hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
          >
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>
    </main>
  );
}

export default ProfileVisibilitySettings;
