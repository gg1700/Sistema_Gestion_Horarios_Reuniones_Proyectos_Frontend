
import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FiArrowRight, FiLink, FiShield } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { Dialog } from '../components/modals';
import { Alert, Button, Input, ProviderIcon } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths } from '../constants/paths';
import { apiBase } from '../features/github/api';

export default function AccessPage() {
  const { state, dispatch } = useMockFlow();
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();

  const completing = query.has('completar');
  const [name, setName] = useState(state.profile.name);
  const [surname, setSurname] = useState(state.profile.firstSurname);
  const [handle, setHandle] = useState(state.profile.handle);
  const [error, setError] = useState('');

  useEffect(() => {
    const calendarOAuth = query.get('calendar_oauth');
    if (calendarOAuth) {
      navigate(
        `${paths.connections}?calendar_oauth=${encodeURIComponent(calendarOAuth)}`,
        { replace: true }
      );
      return;
    }

    if (query.get('oauth') === 'success') {
      navigate(paths.githubInfo, { replace: true });
    } else if (query.has('oauth')) {
      setError('No se completó el acceso. Vuelve a autorizar tu cuenta.');
    }
  }, [query, navigate]);

  function enter(provider: 'google' | 'github') {
    window.location.assign(`${apiBase}/api/v1/auth/${provider}?intent=login`);
  }

  function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      dispatch({
        type: 'complete-profile',
        profile: {
          ...state.profile,
          name,
          firstSurname: surname,
          handle
        },
        provider: query.get('completar') === 'github' ? 'github' : 'google'
      });

      navigate(paths.welcome);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'Revisa tus datos.');
    }
  }

  return (
    <VisitorShell access>
      <div className="access-layout">
        <aside className="access-story">
          <p className="ui-eyebrow">
            <span className="flow-small-orbit" />
            PERSONAS · TIEMPO · PROYECTOS
          </p>

          <h1>Tu mundo,<br />en la misma <em>órbita.</em></h1>

          <p>
            Tu perfil, tus reuniones y tus proyectos.<br />
            Un espacio para conectar lo que haces.
          </p>

          <OrbitIllustration panel />

          <div className="access-baseline">
            <span />
            Todo conectado. Todo a tu ritmo.
            <b>✦</b>
          </div>
        </aside>

        <section className="access-content">
          <div className="access-symbol"><FiLink /></div>

          <p className="ui-eyebrow">BIENVENIDO A ORBITIA</p>
          <h2>Entra a tu espacio.</h2>

          <p>
            Elige tu cuenta para continuar.<br />
            Si es tu primera vez, crearás tu perfil en el siguiente paso.
          </p>

          {error && !completing && <Alert tone="danger">{error}</Alert>}
          <div className="access-providers">
            {(['google', 'github'] as const).map(provider => (
              <button
                type="button"
                key={provider}
                onClick={() => enter(provider)}
              >
                <ProviderIcon provider={provider} />
                <span>
                  <strong>
                    Continuar con {provider === 'google' ? 'Google' : 'GitHub'}
                  </strong>
                  <small>
                    Usa tu cuenta de {provider === 'google' ? 'Google' : 'GitHub'}
                  </small>
                </span>
                <FiArrowRight />
              </button>
            ))}
          </div>

          <div className="access-assurance">
            <FiShield />
            <div>
              <strong>Tu cuenta, bajo tu control.</strong>
              <p>
                El acceso se autoriza en Google o GitHub.
                Después tú eliges si conectas tu calendario,
                repositorios y actividad.
              </p>
            </div>
          </div>

          <p className="access-existing">
            • &nbsp; ¿Ya tienes perfil? Usa una de tus cuentas vinculadas.
          </p>
        </section>
      </div>

      <Dialog
        open={completing}
        onOpenChange={open => {
          if (!open) setQuery({});
        }}
        title="Dale un nombre a tu espacio."
        eyebrow="PRIMER ACCESO · GOOGLE O GITHUB"
        className="account-completion-dialog"
        size="medium"
        footer={
          <>
            <Button variant="secondary" onClick={() => setQuery({})}>
              Volver
            </Button>
            <Button
              type="submit"
              form="complete-account"
              trailingIcon={<FiArrowRight />}
            >
              Crear mi perfil
            </Button>
          </>
        }
      >
        <div className="verified-identity">
          <FiShield />
          <div>
            <strong>{state.profile.email}</strong>
            <span>Identidad externa verificada</span>
          </div>
          <small>• &nbsp; Verificada</small>
        </div>

        <p className="flow-copy">
          Confirma cómo aparecerás en Orbitia y elige tu nombre de usuario.
        </p>

        <form
          id="complete-account"
          className="flow-form"
          onSubmit={complete}
        >
          {error && <Alert tone="danger">{error}</Alert>}

          <div className="flow-fields">
            <Input
              label="Nombre"
              autoComplete="given-name"
              required
              maxLength={100}
              value={name}
              onChange={event => setName(event.target.value)}
              autoFocus
            />
            <Input
              label="Primer apellido"
              autoComplete="family-name"
              required
              maxLength={100}
              value={surname}
              onChange={event => setSurname(event.target.value)}
            />
          </div>

          <Input
            label="Nombre de usuario"
            required
            minLength={3}
            maxLength={50}
            pattern="[a-z0-9\-]{3,50}"
            value={handle}
            onChange={event => setHandle(event.target.value.toLowerCase())}
            hint={`orbitia.app/${handle} · 3 a 50 letras minúsculas, números o guiones`}
          />
        </form>

        <p className="flow-note flow-top-rule">
          <FiLink />
          El correo está asociado a la cuenta verificada.
          Podrás completar el resto de tu perfil y autorizar tus integraciones después.
        </p>
      </Dialog>
    </VisitorShell>
  );
}
