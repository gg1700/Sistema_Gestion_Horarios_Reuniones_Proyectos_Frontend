
import type { PublicProfile as PublicProfileData } from "../../../types/profilePreview";

type PublicProfileProps = {
  profile: PublicProfileData;
};

function PublicProfile({ profile }: PublicProfileProps) {
  const fullName = [
    profile.name,
    profile.firstLastName,
    profile.secondLastName,
  ]
    .filter(Boolean)
    .join(" ");

  const initials = `${profile.name.charAt(0)}${profile.firstLastName.charAt(0)}`;

  return (
    <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,360px)_minmax(0,1fr)]">
      <div className="space-y-6">
        <section className="rounded-xl border border-orbita-outline bg-orbita-card p-6">
          <div className="flex flex-col items-center text-center">
            {profile.profilePicture ? (
              <img
                src={profile.profilePicture}
                alt={`Fotografía de ${fullName}`}
                className="h-24 w-24 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-xl bg-orbita-surface font-heading text-3xl font-semibold text-orbita-accent">
                {initials.toUpperCase()}
              </div>
            )}

            <h2 className="mt-5 font-heading text-2xl font-semibold">
              {fullName}
            </h2>

            <p className="mt-2 font-code text-sm text-orbita-accent">
              @{profile.handleName}
            </p>

            <span className="mt-4 rounded-full border border-orbita-primary px-3 py-1 text-xs text-orbita-accent">
              Perfil público
            </span>
          </div>

          {(profile.email ||
            profile.phone ||
            profile.country ||
            profile.address) && (
            <div className="mt-7 space-y-4 border-t border-orbita-outline pt-6">
              {profile.email && (
                <div>
                  <p className="text-xs text-orbita-muted">
                    Correo electrónico
                  </p>
                  <p className="mt-1 break-all text-sm">
                    {profile.email}
                  </p>
                </div>
              )}

              {profile.phone && (
                <div>
                  <p className="text-xs text-orbita-muted">
                    Teléfono
                  </p>
                  <p className="mt-1 text-sm">{profile.phone}</p>
                </div>
              )}

              {profile.country && (
                <div>
                  <p className="text-xs text-orbita-muted">
                    País
                  </p>
                  <p className="mt-1 text-sm">{profile.country}</p>
                </div>
              )}

              {profile.address && (
                <div>
                  <p className="text-xs text-orbita-muted">
                    Dirección
                  </p>
                  <p className="mt-1 text-sm">{profile.address}</p>
                </div>
              )}
            </div>
          )}
        </section>

        {profile.professionalLinks &&
          profile.professionalLinks.length > 0 && (
            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-6">
              <h3 className="font-heading text-lg font-semibold">
                Enlaces profesionales
              </h3>

              <div className="mt-5 space-y-3">
                {profile.professionalLinks.map((link, index) => (
                  <a
                    key={`${link.url}-${index}`}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between rounded-lg border border-orbita-outline bg-orbita-surface px-4 py-3 text-sm text-orbita-accent hover:border-orbita-primary"
                  >
                    <span>{link.label}</span>
                    <span aria-hidden="true">↗</span>
                  </a>
                ))}
              </div>
            </section>
          )}
      </div>

      <div className="space-y-6">
        {profile.workExperience &&
          profile.workExperience.length > 0 && (
            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-6">
              <h3 className="font-heading text-xl font-semibold">
                Experiencia laboral
              </h3>

              <p className="mt-2 text-sm text-orbita-muted">
                Trayectoria y experiencia profesional.
              </p>

              <div className="mt-6 space-y-3">
                {profile.workExperience.map((experience, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-orbita-outline bg-orbita-surface p-4"
                  >
                    <p className="text-sm">{experience}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        {profile.repositories &&
          profile.repositories.length > 0 && (
            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-6">
              <h3 className="font-heading text-xl font-semibold">
                Repositorios públicos
              </h3>

              <p className="mt-2 text-sm text-orbita-muted">
                Proyectos compartidos en GitHub.
              </p>

              <div className="mt-6 space-y-4">
                {profile.repositories.map((repository, index) => (
                  <article
                    key={`${repository.name}-${index}`}
                    className="rounded-lg border border-orbita-outline bg-orbita-surface p-4"
                  >
                    <a
                      href={repository.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-heading font-semibold text-orbita-accent hover:underline"
                    >
                      {repository.name} ↗
                    </a>

                    <p className="mt-2 text-sm text-orbita-muted">
                      {repository.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>
          )}

        {profile.githubActivity &&
          profile.githubActivity.length > 0 && (
            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-6">
              <h3 className="font-heading text-xl font-semibold">
                Actividad de GitHub
              </h3>

              <div className="mt-5 space-y-3">
                {profile.githubActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="rounded-lg border border-orbita-outline bg-orbita-surface p-4 text-sm"
                  >
                    {activity}
                  </div>
                ))}
              </div>
            </section>
          )}

        {!profile.workExperience?.length &&
          !profile.repositories?.length &&
          !profile.githubActivity?.length && (
            <section className="rounded-xl border border-orbita-outline bg-orbita-card p-8 text-center">
              <h3 className="font-heading text-lg font-semibold">
                Información profesional
              </h3>

              <p className="mt-3 text-sm text-orbita-muted">
                No hay información profesional pública para mostrar.
              </p>
            </section>
          )}
      </div>
    </div>
  );
}

export default PublicProfile;
