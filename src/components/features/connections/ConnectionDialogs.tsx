import { useEffect, useState } from 'react';
import { FiArrowRight, FiCalendar, FiCheck, FiExternalLink, FiRefreshCw, FiShield } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, ProviderIcon } from '../../ui';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { useUI } from '../../../contexts/UIContext';
import type { Provider } from '../../../mocks/account';
import { RepositorySelection } from './RepositorySelection';
import { useGoogleCalendar } from '../../../hooks/useGoogleCalendar';
import { CalendarApiError } from '../../../api/googleCalendar';
type CalendarController = ReturnType<typeof useGoogleCalendar>;
function ProviderIdentity({ provider, description }: { provider: Provider; description: string }) {
  const { state } = useMockFlow();
  return <div className="connection-dialog-identity"><ProviderIcon provider={provider} /><div><strong>{provider === 'google' ? state.profile.email : '@mateosilva'}</strong><span>{description}</span></div></div>;
}

function AuthorizeProvider({ provider, reconnect, onClose, onNext, calendar }: { provider: Provider; reconnect: boolean; onClose: () => void; onNext: (modal: string) => void; calendar: CalendarController }) {
  const { dispatch } = useMockFlow();
  const google = provider === 'google';
  const chosen = calendar.status.calendarName ?? 'tu calendario';
  const permissions = google ? [
    ['Consultar calendarios y eventos', 'Elegir el calendario y consultar tus compromisos y disponibilidad.'],
    ['Crear, modificar y eliminar eventos', 'Gestionar eventos y reuniones desde Orbitia en el calendario seleccionado.'],
    ['Generar enlaces de Google Meet', 'Añadir una videollamada a las reuniones que programes.'],
  ] : [
    ['Consultar tu perfil de GitHub', 'Para identificar la cuenta que estás vinculando.'],
    ['Consultar tus repositorios', 'Para elegir cuáles se mostrarán en tu perfil.'],
    ['Leer tu actividad reciente', 'Para integrar tus contribuciones y eventos en Orbitia.'],
  ];
  function authorize() {
    if (google) {
      calendar.connect();
      return;
    }
    dispatch({ type: 'account', action: { type: 'authorize-provider', provider } });
    onNext('repositorios');
  }
  return <Dialog open onOpenChange={value => { if (!value) onClose(); }} title={google ? 'Conecta tu calendario.' : 'Trae tus proyectos a tu órbita.'} eyebrow={google ? 'GOOGLE CALENDAR · PERMISOS' : 'CONECTAR GITHUB'} className={google ? 'authorize-google-dialog' : 'authorize-github-dialog'}
    footer={<><Button variant="secondary" onClick={onClose}>{google ? 'Volver' : 'Cancelar'}</Button><Button onClick={authorize} trailingIcon={<FiArrowRight />}>{google ? 'Autorizar en Google' : 'Continuar con GitHub'}</Button></>}>
    <ProviderIdentity provider={provider} description={google ? `Google Calendar · ${chosen}` : 'Datos básicos de tu cuenta de GitHub'} />
    <p className="flow-copy">{google ? 'Autoriza las funciones que usarás en el calendario elegido.' : 'Autoriza a Orbitia desde tu cuenta de GitHub. Este acceso permite:'}</p>
    <ul className="connection-permissions">{permissions.map(([title, text]) => <li key={title}><FiCheck /><div><strong>{title}</strong><p>{text}</p></div></li>)}</ul>
    <p className="flow-note"><FiExternalLink />{google && reconnect ? `Continuarás en Google. Al regresar, ${chosen} seguirá siendo tu calendario seleccionado y no podrás cambiarlo.`: `Continuarás en ${google ? 'Google' : 'GitHub'} para elegir tu cuenta y autorizar.`}</p>
  </Dialog>;
}


function CalendarSelection({ onClose, onNext, calendar }: { onClose: () => void; onNext: (modal: string) => void; calendar: CalendarController }) {
  const [chosen, setChosen] = useState('');
  const [error, setError] = useState('');
  const [locked, setLocked] = useState(false);
  const { loadCalendars } = calendar;

  async function refreshCalendars() {
    setError('');
    try {
      const result = await loadCalendars();
      const selectedId = result.selectedCalendarId;

      if (selectedId) {
        setLocked(true);
        setChosen(selectedId);
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
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudieron cargar los calendarios.');
    }
  }

  useEffect(() => {
    let active = true;

    void loadCalendars().then(result => {
      if (!active) return;

      const selectedId = result.selectedCalendarId;
      setLocked(Boolean(selectedId));

      if (selectedId) {
        setChosen(selectedId);
        return;
      }

      const primary = result.calendars.find(item => item.primary && item.canWrite);
      const first = result.calendars.find(item => item.canWrite);
      setChosen(primary?.id ?? first?.id ?? '');
    }).catch(failure => {
      if (active) setError(failure instanceof Error ? failure.message : 'No se pudieron cargar los calendarios.');
    });

    return () => { active = false; };
  }, [loadCalendars]);

  async function save() {
    if (!chosen || locked || calendar.saving) return;

    setError('');

    try {
      await calendar.selectCalendar(chosen);
      setLocked(true);
      onClose();
    } catch (failure) {
      if (failure instanceof CalendarApiError && failure.code === 'calendar_selection_locked') {
        setLocked(true);
        setError('Ya tienes un calendario seleccionado. No puedes cambiarlo después de guardarlo.');
        void refreshCalendars();
        return;
      }

      setError(failure instanceof Error ? failure.message : 'No se pudo guardar el calendario.');
    }
  }

  const available = calendar.calendarList?.calendars ?? [];
  const needsReconnect = calendar.status.reconnectRequired ||
    (error === 'reconnection_required');

  return (
    <Dialog
      open
      onOpenChange={value => { if (!value) onClose(); }}
      title={locked ? 'Tu calendario seleccionado.' : 'Elige tu calendario.'}
      eyebrow="GOOGLE CALENDAR"
      description={
        locked
          ? 'Esta elección es permanente y no puede modificarse.'
          : 'Puedes utilizar un calendario existente o crear uno nuevo antes de seleccionar.'
      }
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
              disabled={!chosen || calendar.loading || calendar.saving}
              onClick={() => void save()}
              trailingIcon={<FiCheck />}
            >
              {calendar.saving ? 'Guardando...' : 'Guardar calendario'}
            </Button>
          ) : null}
        </>
      }
    >
      <ProviderIdentity
        provider="google"
        description={locked ? 'Calendario permanente de Orbitia' : 'Selecciona un calendario de tu cuenta'}
      />

      {error && <Alert tone="danger">{error}</Alert>}

      {locked && (
        <Alert tone="warning">
          Ya tienes un calendario seleccionado. No es posible cambiarlo por otro, incluso si vuelves a conectar Google.
        </Alert>
      )}

      {!locked && (
        <div className="flex flex-wrap items-center gap-3">
          <a
            href="https://calendar.google.com/calendar/u/0/r/settings/createcalendar"
            target="_blank"
            rel="noopener noreferrer"
            className="flow-link"
          >
            <FiExternalLink />
            Crear nuevo calendario en Google
          </a>

          <Button
            variant="secondary"
            size="small"
            disabled={calendar.loading}
            onClick={() => void refreshCalendars()}
          >
            <FiRefreshCw />
            Actualizar lista
          </Button>
        </div>
      )}

      {calendar.loading ? (
        <p className="flow-copy">Cargando calendarios...</p>
      ) : available.length === 0 ? (
        <Alert tone="warning">
          No hay calendarios disponibles. Comprueba los permisos de Google o crea uno nuevo.
        </Alert>
      ) : (
        <fieldset className="calendar-options" disabled={locked}>
          <legend className="ui-sr-only">
            Calendario que utilizará Orbitia
          </legend>

          {available.map(item => (
            <label key={item.id}>
              <input
                type="radio"
                name="calendar"
                value={item.id}
                checked={chosen === item.id}
                disabled={locked || !item.canWrite}
                onChange={() => setChosen(item.id)}
              />

              <i style={{ background: item.color ?? '#8ab4e8' }} />

              <span>
                <strong>{item.name}</strong>
                <small>{item.description || item.timezone}</small>
              </span>

              {item.primary && <small>Principal</small>}
              {!item.canWrite && <small>Solo lectura</small>}
              {locked && chosen === item.id && <small>Seleccionado</small>}
            </label>
          ))}
        </fieldset>
      )}

      <p className="flow-note">
        <FiCalendar />
        {locked
          ? 'Este calendario permanecerá asociado a tu cuenta.'
          : 'Después de guardar un calendario, no podrás seleccionar otro.'}
      </p>
    </Dialog>
  );
}

function DisconnectProvider({ provider, integrationOnly, onClose, onNext, calendar }: { provider: Provider; integrationOnly: boolean; onClose: () => void; onNext: (modal: string) => void; calendar: CalendarController }) {
  const { state, dispatch } = useMockFlow();
  const { notify } = useUI();
  const [error, setError] = useState('');
  const google = provider === 'google';
  const otherLinked = google ? state.account.github.identityLinked : state.account.google.identityLinked;
  const blocked = !integrationOnly && !otherLinked;
  async function disconnect() {
    setError('');
    try {
      if (google && integrationOnly) {
        await calendar.disconnect();
        notify('Google Calendar desvinculado correctamente.', 'success');
        onClose();
        return;
      }
      dispatch({ type: 'account', action: integrationOnly ? { type: 'stop-github-data' } : { type: 'unlink-provider', provider } });
      notify(integrationOnly ? 'Sincronización detenida. Tu acceso se conserva.' : 'Cuenta desvinculada.', 'success');
      onClose();
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo desvincular.');
    }
  }
  return <Dialog open onOpenChange={value => { if (!value) onClose(); }} title={integrationOnly ? `¿Desconectar ${google ? 'Google Calendar' : 'los datos de GitHub'}?` : `¿Desvincular ${google ? 'Google' : 'GitHub'}?`} eyebrow={integrationOnly ? 'DESVINCULAR SERVICIO' : 'CUENTAS VINCULADAS'} className="disconnect-provider-dialog"
    footer={<><Button variant="secondary" onClick={onClose}>Conservar conexión</Button><Button variant="danger" disabled={blocked || (google && integrationOnly && calendar.saving)} onClick={() => void disconnect()} trailingIcon={<FiArrowRight />}>Desvincular</Button></>}>
    <ProviderIdentity provider={provider} description={google ? integrationOnly ? 'Google Calendar' : 'Google · identidad y Calendar' : 'GitHub'} />
    {error && <Alert tone="danger">{error}</Alert>}
    <p className="flow-copy">{google ? integrationOnly ? 'Se detendrá la sincronización de tu calendario y sus eventos con Orbitia. Tus eventos se conservan en Google.' : 'Se quitará Google como cuenta de acceso y se detendrá la sincronización de tu calendario. Tus eventos se conservan en Google.' : integrationOnly ? 'Se dejarán de consultar y mostrar tus repositorios y actividad. GitHub continuará disponible como cuenta de acceso.' : 'Orbitia dejará de consultar esta cuenta y de mostrar sus repositorios y actividad en tu perfil público.'}</p>
    <div className="disconnect-provider-details">
      <div>
        <span>{google && integrationOnly ? 'Tu cuenta de Orbitia' : 'Para seguir entrando'}</span>
        <strong>{google && integrationOnly ? 'Tu sesión y métodos de acceso se conservan' : integrationOnly ? 'GitHub · cuenta vinculada' : google ? 'GitHub · @mateosilva' : `Google · ${state.profile.email}`}</strong>
      </div>
      <div>
        <span>{google ? 'Calendario en Orbitia' : 'Información personalizada'}</span>
        <strong>{google ? 'Sin sincronización hasta volver a conectar' : 'Se conserva en tu perfil'}</strong>
      </div>
    </div>
    {blocked && <Alert tone="warning">Es tu única cuenta de acceso. Vincula {google ? 'GitHub' : 'Google'} antes de desvincularla.<Button variant="ghost" size="small" onClick={() => onNext(google ? 'conectar-github' : 'conectar-google')}>Vincular otra cuenta</Button></Alert>}
    <p className="flow-note"><FiShield />{integrationOnly ? 'Tu cuenta de Orbitia seguirá disponible. Puedes conectar este servicio de nuevo cuando lo necesites.' : 'Desvincular la cuenta es distinto de detener solo la sincronización.'}</p>
    {!integrationOnly && <button type="button" className="flow-link disconnect-provider-alternative" onClick={() => onNext(google ? 'desconectar-calendar' : 'desconectar-datos-github')}>{google ? 'Solo detener Calendar' : 'Solo detener los datos de GitHub'}<FiArrowRight /></button>}
    {integrationOnly && !google && <button type="button" className="flow-link disconnect-provider-alternative" onClick={() => onNext('desvincular-github')}>Quitar también la cuenta de acceso <FiArrowRight /></button>}
  </Dialog>;
}

export function ConnectionDialogs({ modal, onClose, onNext }: { modal: string | null; onClose: () => void; onNext: (modal: string) => void }) {
  const { state } = useMockFlow();
  const calendar = useGoogleCalendar();
  if (modal === 'conectar-google' || modal === 'reconectar-google') return <AuthorizeProvider provider="google" reconnect={modal === 'reconectar-google'} onClose={onClose} onNext={onNext} calendar={calendar} />;
  if (modal === 'conectar-github') return <AuthorizeProvider provider="github" reconnect={false} onClose={onClose} onNext={onNext} calendar={calendar} />;
  if (modal === 'calendario') return <CalendarSelection onClose={onClose} onNext={onNext} calendar={calendar} />;
  if (modal === 'repositorios' && state.account.github.dataConnected) return <RepositorySelection onClose={onClose} />;
  if (modal === 'repositorios') return <AuthorizeProvider provider="github" reconnect={false} onClose={onClose} onNext={onNext} calendar={calendar} />;
  if (modal === 'desvincular-google' || modal === 'desvincular-github') return <DisconnectProvider key={modal} provider={modal === 'desvincular-google' ? 'google' : 'github'} integrationOnly={false} onClose={onClose} onNext={onNext} calendar={calendar} />;
  if (modal === 'desconectar-calendar' || modal === 'desconectar-datos-github') return <DisconnectProvider key={modal} provider={modal === 'desconectar-calendar' ? 'google' : 'github'} integrationOnly onClose={onClose} onNext={onNext} calendar={calendar} />;
  return null;
}