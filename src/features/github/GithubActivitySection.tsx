
import { useEffect, useState } from 'react';
import { FiActivity, FiRefreshCw } from 'react-icons/fi';
import { Alert, Button } from '../../components/ui';
import {
  apiBase,
  RepositoryApiError,
  getGithubActivity,
  type GithubActivityType,
  type GithubActivityEvent,
  type GithubContributionGrid,
} from './api';

type ActivityData = GithubActivityEvent[] | GithubContributionGrid;

function eventTitle(event: GithubActivityEvent): string {
  switch (event.type) {
    case 'PushEvent':
      return 'Realizó cambios en';

    case 'PullRequestEvent':
      return 'Interactuó con un pull request en';

    case 'IssuesEvent':
      return 'Interactuó con una incidencia en';

    case 'ReleaseEvent':
      return 'Publicó una versión en';

    default:
      return 'Actividad en';
  }
}

function eventDetail(event: GithubActivityEvent): string {
  const payload = event.payload;

  switch (event.type) {
    case 'PushEvent': {
      const count = payload.size ?? payload.commits?.length ?? 0;
      return count > 0
        ? `${count} commit(s)`
        : 'Nuevos cambios en el repositorio';
    }

    case 'PullRequestEvent':
      return [
        payload.action ?? 'Actualización',
        payload.pull_request?.title,
      ].filter(Boolean).join(' · ');

    case 'IssuesEvent':
      return [
        payload.action ?? 'Actualización',
        payload.issue?.title,
      ].filter(Boolean).join(' · ');

    case 'ReleaseEvent':
      return [
        payload.action ?? 'Publicación',
        payload.release?.name ?? payload.release?.tag_name,
      ].filter(Boolean).join(' · ');

    default:
      return 'Evento de GitHub';
  }
}

function formatDate(value: string | null): string {
  if (!value) return 'Fecha no disponible';

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return 'Fecha no disponible';
  }

  return new Intl.DateTimeFormat('es-BO', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
}

function ContributionCalendar({
  data,
}: {
  data: GithubContributionGrid;
}) {
  return (
    <div className="github-contribution-calendar">
      <p className="github-contribution-total">
        <strong>{data.totalContributions}</strong>
        {' '}contribuciones en el período mostrado
      </p>

      <div
        className="github-contribution-grid"
        role="img"
        aria-label={`Calendario de ${data.totalContributions} contribuciones`}
      >
        {data.weeks.map((week, weekIndex) => (
          <div className="github-contribution-week" key={weekIndex}>
            {week.contributionDays.map(day => (
              <span
                key={day.date}
                className="github-contribution-day"
                style={{
                  backgroundColor: day.color,
                }}
                title={`${day.date}: ${day.contributionCount} contribuciones`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="github-contribution-legend">
        <span>Menos</span>
        <i style={{ backgroundColor: '#161b22' }} />
        <i style={{ backgroundColor: '#0e4429' }} />
        <i style={{ backgroundColor: '#006d32' }} />
        <i style={{ backgroundColor: '#26a641' }} />
        <i style={{ backgroundColor: '#39d353' }} />
        <span>Más</span>
      </div>
    </div>
  );
}

export function GithubActivitySection() {
  const [type, setType] = useState<GithubActivityType>('list');
  const [activity, setActivity] = useState<ActivityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const controller = new AbortController();

    setLoading(true);
    setError(null);
    setActivity(null);

    getGithubActivity(type, controller.signal)
      .then(result => {
        if (!controller.signal.aborted) {
          setActivity(result);
        }
      })
      .catch(failure => {
        if (!controller.signal.aborted) {
          setError(
            failure instanceof Error
              ? failure
              : new Error('No se pudo consultar la actividad de GitHub.')
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  }, [type, revision]);

  const authorizationRequired =
    error instanceof RepositoryApiError &&
    [401, 409].includes(error.status);


  const sessionExpired =
    error instanceof RepositoryApiError &&
    error.status === 401 &&
    /sesion|autorizacion/i.test(error.message);

  const authorizationUrl = `${apiBase}/api/v1/auth/github?intent=${
    sessionExpired ? 'login' : 'link'
  }`;

  const events = type === 'list' && Array.isArray(activity)
    ? activity
    : [];

  const grid = type === 'grid' &&
    activity !== null &&
    !Array.isArray(activity)
    ? activity as GithubContributionGrid
    : null;

  return (
    <section className="github-activity-section">
      <div className="profile-section-head">
        <div>
          <h3>Actividad reciente</h3>
          <p className="github-activity-description">
            Tu actividad obtenida directamente de GitHub.
          </p>
        </div>

        <Button
          variant="ghost"
          size="small"
          leadingIcon={<FiRefreshCw />}
          loading={loading}
          disabled={loading}
          onClick={() => setRevision(value => value + 1)}
        >
          Actualizar
        </Button>
      </div>

      <div
        className="github-activity-controls"
        aria-label="Formato de actividad"
      >
        <Button
          size="small"
          variant={type === 'list' ? 'secondary' : 'ghost'}
          disabled={loading}
          onClick={() => setType('list')}
        >
          Lista
        </Button>

        <Button
          size="small"
          variant={type === 'grid' ? 'secondary' : 'ghost'}
          disabled={loading}
          onClick={() => setType('grid')}
        >
          Calendario
        </Button>
      </div>

      {loading && (
        <p role="status" className="flow-copy">
          Consultando actividad de GitHub...
        </p>
      )}

      {error && (
        <div className="github-activity-error">
          <Alert tone="danger">{error.message}</Alert>

          {authorizationRequired ? (
            <a href={authorizationUrl}>
                {sessionExpired
                ? 'Iniciar sesión nuevamente'
                : 'Conectar o volver a autorizar GitHub'}
            </a>
          ) : (
            <Button
              size="small"
              variant="secondary"
              onClick={() => setRevision(value => value + 1)}
            >
              Reintentar
            </Button>
          )}
        </div>
      )}

      {!loading && !error && type === 'list' && (
        events.length > 0 ? (
          <ol className="github-activity">
            {events.map((event, index) => (
              <li key={`${event.repo.id}-${event.date}-${index}`}>
                <time dateTime={event.date ?? undefined}>
                  {formatDate(event.date)}
                </time>

                <h4>
                  {eventTitle(event)} {event.repo.name}
                </h4>

                <p>{eventDetail(event)}</p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="github-activity-empty">
            No hay actividad reciente para mostrar.
          </p>
        )
      )}

      {!loading && !error && type === 'grid' && grid && (
        <ContributionCalendar data={grid} />
      )}

      <p className="flow-note flow-top-rule">
        <FiActivity />
        La actividad y las contribuciones se consultan desde tu cuenta de GitHub.
      </p>
    </section>
  );
}
