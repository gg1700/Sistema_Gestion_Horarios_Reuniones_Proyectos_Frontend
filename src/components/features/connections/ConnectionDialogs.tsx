import { useEffect, useState } from 'react';
import { FiArrowRight, FiCalendar, FiCheck, FiExternalLink, FiRefreshCw, FiSearch, FiShield } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, ProviderIcon } from '../../ui';
import { useUI } from '../../../contexts/UIContext';
import { useGoogleCalendar } from '../../../hooks/useGoogleCalendar';
import { CalendarApiError } from '../../../api/googleCalendar';

type CalendarController = ReturnType<typeof useGoogleCalendar>;

function ProviderIdentity({ description }: { description: string }) {
  return (
    <div className="connection-dialog-identity">
      <ProviderIcon provider="google" />
      <div>
        <strong>Google Calendar</strong>
        <span>{description}</span>
      </div>
    </div>
  );
}

function AuthorizeProvider({
  reconnect,
  onClose,
  calendar }: {
    reconnect: boolean;
    onClose: () => void;
    calendar: CalendarController
  }) {
  const permissions = [
    [
      'Consultar calendarios y eventos',
      'Consultar tus compromisos y disponibilidad.'
    ],
    [
      'Crear y seleccionar calendarios',
      'Utilizar uno existente o crear un calendario nuevo para Orbitia.'
    ],
    [
      'Crear, modificar y eliminar eventos',
      'Gestionar eventos en el calendario seleccionado.'
    ],
    [
      'Generar enlaces de Google Meet',
      'Añadir videollamadas a las reuniones que programes.'
    ]
  ];

  return (
    <Dialog
      open
      onOpenChange={value => {
        if (!value) onClose();
      }}
      title="Conecta tu calendario."
      eyebrow="GOOGLE CALENDAR · PERMISOS"
      className="authorize-google-dialog"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Volver
          </Button>

          <Button
            onClick={calendar.connect}
            trailingIcon={<FiArrowRight />}
          >
            Autorizar en Google
          </Button>
        </>
      }
    >
      <ProviderIdentity description="Autorización de acceso a Google Calendar" />

      <p className="flow-copy">
        Autoriza Google Calendar para seleccionar o crear un calendario
        y gestionar tus eventos.
      </p>

      <ul className="connection-permissions">
        {permissions.map(([title, description]) => (
          <li key={title}>
            <FiCheck />
            <div>
              <strong>{title}</strong>
              <p>{description}</p>
            </div>
          </li>
        ))}
      </ul>

      <p className="flow-note">
        <FiExternalLink />
        {reconnect
          ? 'Volverás a autorizar Google Calendar. Si la selección anterior fue liberada al desvincular el servicio, podrás elegir o crear otro calendario.'
          : 'Continuarás en Google para elegir tu cuenta y autorizar.'}
      </p>
    </Dialog>
  );
}

function CalendarSelection({ onClose, onNext, calendar }: { onClose: () => void; onNext: (modal: string) => void; calendar: CalendarController }) {
  const [chosen, setChosen] = useState('');
  const [name, setName] = useState('');
  const [timeZone, setTimeZone] = useState('America/La_Paz');
  const [mode, setMode] = useState<'select' | 'create'>('select');
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(Boolean(calendar.status.calendarId));
  const [reconnectRequired, setReconnectRequired] = useState(false);

  const { loadCalendars } = calendar;

  const available = calendar.calendarList?.calendars ?? [];

  const needsReconnect = calendar.status.reconnectRequired || reconnectRequired;

  const filteredCalendars = available
    .filter(item => {
      const query = search.trim().toLowerCase();

      return (
        item.name.toLowerCase().includes(query) ||
        (item.description ?? '').toLowerCase().includes(query) ||
        item.id.toLowerCase().includes(query)
      );
    })
    .sort((a, b) => {
      if (a.id === chosen && b.id !== chosen) return -1;
      if (b.id === chosen && a.id !== chosen) return 1;
      if (a.canWrite !== b.canWrite) return a.canWrite ? -1 : 1;
      return a.name.localeCompare(b.name, 'es');
    });

  function updateSelection(result: Awaited<ReturnType<CalendarController['loadCalendars']>>) {
    setReconnectRequired(false);

    if (result.selectedCalendarId) {
      setLocked(true);
      setChosen(result.selectedCalendarId);
      return;
    }

    setLocked(false);

    const primary = result.calendars.find(item => item.primary && item.canWrite);
    const first = result.calendars.find(item => item.canWrite);

    setChosen(current =>
      result.calendars.some(item => item.id === current && item.canWrite)
        ? current
        : primary?.id ?? first?.id ?? ''
    );
  }

  function handleError(failure: unknown) {
    if (failure instanceof CalendarApiError) {
      if (failure.code === 'calendar_selection_locked') {
        setLocked(true);
        setError('Ya tienes un calendario seleccionado. Para iniciar una nueva selección, primero debes desvincular Google Calendar.');
        return;
      }

      if (failure.code === 'reconnection_required' || failure.code === 'google_not_connected') {
        setReconnectRequired(true);
        setError('Los permisos de Google Calendar no están disponibles. Vuelve a autorizar el servicio.');
        return;
      }
    }

    setError(failure instanceof Error ? failure.message : 'No se pudo completar la operación.');
  }

  async function refreshCalendars() {
    setError('');

    try {
      const result = await loadCalendars();
      updateSelection(result);
    } catch (failure) {
      handleError(failure);
    }
  }

  useEffect(() => {
    let active = true;

    void loadCalendars()
      .then(result => {
        if (!active) return;

        if (result.selectedCalendarId) {
          setLocked(true);
          setChosen(result.selectedCalendarId);
          return;
        }

        setLocked(false);

        const primary = result.calendars.find(item => item.primary && item.canWrite);
        const first = result.calendars.find(item => item.canWrite);

        setChosen(primary?.id ?? first?.id ?? '');
      })
      .catch(failure => {
        if (!active) return;

        if (failure instanceof CalendarApiError &&
          (failure.code === 'reconnection_required' || failure.code === 'google_not_connected')) {
          setReconnectRequired(true);
          setError('Los permisos de Google Calendar no están disponibles. Vuelve a autorizar el servicio.');
          return;
        }

        setError(failure instanceof Error ? failure.message : 'No se pudieron cargar los calendarios.');
      });

    return () => { active = false; };
  }, [loadCalendars]);

  async function save() {
    if (locked || needsReconnect || calendar.saving || calendar.loading) return;

    setError('');

    try {
      if (mode === 'create') {
        const calendarName = name.trim();

        if (!calendarName) {
          setError('Ingresa un nombre para el calendario.');
          return;
        }

        if (calendarName.length > 150) {
          setError('El nombre no puede superar los 150 caracteres.');
          return;
        }

        await calendar.createCalendar(calendarName, timeZone);
      } else {
        if (!chosen) {
          setError('Selecciona un calendario.');
          return;
        }

        const selected = available.find(item => item.id === chosen);

        if (!selected?.canWrite) {
          setError('Selecciona un calendario con permisos de escritura.');
          return;
        }

        await calendar.selectCalendar(chosen);
      }

      setLocked(true);
      onClose();
    } catch (failure) {
      handleError(failure);
    }
  }

  return (
    <Dialog
      open
      onOpenChange={value => { if (!value) onClose(); }}
      title={locked ? 'Tu calendario seleccionado.' : 'Configura tu calendario.'}
      eyebrow="GOOGLE CALENDAR"
      description={locked
        ? 'Ya tienes un calendario asociado a tu cuenta.'
        : 'Selecciona un calendario existente o crea uno nuevo para Orbitia.'}
      className="calendar-selection-dialog"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Volver
          </Button>

          {needsReconnect ? (
            <Button onClick={() => onNext('reconectar-google')}>
              Reconectar Google
            </Button>
          ) : !locked ? (
            <Button
              disabled={
                calendar.loading ||
                calendar.saving ||
                (mode === 'select' ? !chosen : !name.trim())
              }
              onClick={() => void save()}
              trailingIcon={<FiCheck />}
            >
              {calendar.saving
                ? 'Guardando...'
                : mode === 'create'
                  ? 'Crear y seleccionar'
                  : 'Guardar calendario'}
            </Button>
          ) : null}
        </>
      }
    >
      <ProviderIdentity
        description={locked
          ? 'Calendario asociado a Orbitia'
          : 'Configura tu calendario de Google'
        }
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {locked ? (
        <Alert tone="warning">
          Este calendario ya está seleccionado. Mientras la conexión esté activa, no puedes elegir ni crear otro. Si desvinculas el servicio y el backend libera la selección anterior, podrás elegir otro al reconectar.
        </Alert>
      ) : (
        <>
          <div className="flex flex-wrap gap-3">
            <Button
              variant={mode === 'select' ? 'primary' : 'secondary'}
              disabled={needsReconnect}
              onClick={() => {
                setMode('select');
                setError('');
              }}
            >
              Elegir existente
            </Button>

            <Button
              variant={mode === 'create' ? 'primary' : 'secondary'}
              disabled={needsReconnect}
              onClick={() => {
                setMode('create');
                setError('');
              }}
            >
              Crear nuevo
            </Button>
          </div>

          {mode === 'create' ? (
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label htmlFor="new-calendar-name" className="text-sm font-medium">
                  Nombre del calendario
                </label>

                <input
                  id="new-calendar-name"
                  type="text"
                  maxLength={150}
                  value={name}
                  disabled={needsReconnect || calendar.saving}
                  onChange={event => setName(event.target.value)}
                  placeholder="Ej. Calendario Orbitia"
                  className="w-full rounded-lg border border-orbita-outline bg-orbita-surface px-4 py-3 text-orbita-text"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="new-calendar-timezone" className="text-sm font-medium">
                  Zona horaria
                </label>

                <select
                  id="new-calendar-timezone"
                  value={timeZone}
                  disabled={needsReconnect || calendar.saving}
                  onChange={event => setTimeZone(event.target.value)}
                  className="w-full rounded-lg border border-orbita-outline bg-orbita-surface px-4 py-3 text-orbita-text"
                >
                  <option value="America/La_Paz">Bolivia (America/La_Paz)</option>
                  <option value="America/Lima">Perú (America/Lima)</option>
                  <option value="America/Santiago">Chile (America/Santiago)</option>
                  <option value="America/Argentina/Buenos_Aires">Argentina (Buenos Aires)</option>
                  <option value="UTC">UTC</option>
                </select>
              </div>

              <Alert tone="warning">
                Se creará un calendario nuevo en tu cuenta de Google y quedará seleccionado en Orbitia.
              </Alert>
            </div>
          ) : (
            <>
              <div className="mt-4 flex flex-col gap-3">
                <div className="relative">
                  <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-orbita-muted" />

                  <input
                    type="search"
                    value={search}
                    disabled={needsReconnect}
                    onChange={event => setSearch(event.target.value)}
                    placeholder="Buscar calendario por nombre..."
                    aria-label="Buscar calendario"
                    className="w-full rounded-lg border border-orbita-outline bg-orbita-surface py-3 pl-10 pr-4 text-orbita-text outline-none focus:border-orbita-primary"
                  />
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs text-orbita-muted">
                    {filteredCalendars.length} de {available.length} calendarios
                  </p>

                  <Button
                    variant="secondary"
                    size="small"
                    disabled={calendar.loading || needsReconnect}
                    onClick={() => void refreshCalendars()}
                  >
                    <FiRefreshCw />
                    Actualizar lista
                  </Button>
                </div>
              </div>

              {calendar.loading ? (
                <p className="flow-copy">Cargando calendarios...</p>
              ) : needsReconnect ? (
                <Alert tone="warning">
                  Debes volver a autorizar Google Calendar antes de seleccionar un calendario.
                </Alert>
              ) : available.length === 0 ? (
                <Alert tone="warning">
                  No hay calendarios disponibles. Puedes crear uno nuevo.
                </Alert>
              ) : filteredCalendars.length === 0 ? (
                <Alert tone="warning">
                  No se encontraron calendarios con ese nombre. Prueba otra búsqueda.
                </Alert>
              ) : (
                <fieldset className="calendar-options">
                  <legend className="ui-sr-only">
                    Calendario que utilizará Orbitia
                  </legend>

                  {filteredCalendars.map(item => (
                    <label key={item.id}>
                      <input
                        type="radio"
                        name="calendar"
                        value={item.id}
                        checked={chosen === item.id}
                        disabled={!item.canWrite || calendar.saving}
                        onChange={() => setChosen(item.id)}
                      />

                      <i style={{ background: item.color ?? '#8ab4e8' }} />

                      <span>
                        <strong>{item.name}</strong>
                        <small>{item.description || item.timezone}</small>
                      </span>

                      {item.primary && <small>Principal</small>}
                      {!item.canWrite && <small>Solo lectura</small>}
                      {chosen === item.id && <small>Seleccionado</small>}
                    </label>
                  ))}
                </fieldset>
              )}
            </>
          )}
        </>
      )}

      <p className="flow-note">
        <FiCalendar />
        {locked
          ? 'Solo puedes tener un calendario seleccionado mientras la conexión esté activa.'
          : 'Solo puedes seleccionar o crear un calendario a la vez.'}
      </p>
    </Dialog>
  );
}


function DisconnectCalendar({
  onClose,
  calendar
}: {
  onClose: () => void;
  calendar: CalendarController}) {
  const { notify } = useUI();
  const [error, setError] = useState('');

  async function disconnect() {
    setError('');

    try {
      await calendar.disconnect();

      notify(
        'Google Calendar desvinculado correctamente.',
        'success'
      );

      onClose();
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo desvincular Google Calendar.'
      );
    }
  }

  return (
    <Dialog
      open
      onOpenChange={value => {
        if (!value) onClose();
      }}
      title="¿Desconectar Google Calendar?"
      eyebrow="DESVINCULAR SERVICIO"
      className="disconnect-provider-dialog"
      footer={
        <>
          <Button
            variant="secondary"
            disabled={calendar.saving}
            onClick={onClose}
          >
            Conservar conexión
          </Button>

          <Button
            variant="danger"
            disabled={calendar.saving}
            loading={calendar.saving}
            onClick={() => void disconnect()}
            trailingIcon={<FiArrowRight />}
          >
            Desconectar Calendar
          </Button>
        </>
      }
    >
      <ProviderIdentity description="Integración de Google Calendar" />

      {error && <Alert tone="danger">{error}</Alert>}

      <p className="flow-copy">
        Se detendrá la sincronización con Orbitia. Tus calendarios
        y eventos permanecerán en tu cuenta de Google.
      </p>

      <div className="disconnect-provider-details">
        <div>
          <span>Tu cuenta de Orbitia</span>
          <strong>
            Tu sesión y métodos de acceso se conservan
          </strong>
        </div>

        <div>
          <span>Calendario en Orbitia</span>
          <strong>
            Sin sincronización hasta volver a conectar
          </strong>
        </div>
      </div>

      <p className="flow-note">
        <FiShield />
        Desconectar Calendar no elimina tu cuenta de acceso a Orbitia
        ni borra tus eventos de Google.
      </p>
    </Dialog>
  );
}

export function ConnectionDialogs({
  modal,
  onClose,
  onNext
}: {
  modal: string | null;
  onClose: () => void;
  onNext: (modal: string) => void}) {
  const calendar = useGoogleCalendar();

  if (modal === 'conectar-google' || modal === 'reconectar-google') {
    return (
      <AuthorizeProvider
        reconnect={modal === 'reconectar-google'}
        onClose={onClose}
        calendar={calendar}
      />
    );
  }

  if (modal === 'calendario') {
    return (
      <CalendarSelection
        onClose={onClose}
        onNext={onNext}
        calendar={calendar}
      />
    );
  }

  if (modal === 'desconectar-calendar') {
    return (
      <DisconnectCalendar
        onClose={onClose}
        calendar={calendar}
      />
    );
  }

  return null;
}