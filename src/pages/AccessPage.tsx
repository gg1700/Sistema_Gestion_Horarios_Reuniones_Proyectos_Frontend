import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FiArrowRight, FiLink, FiShield } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { ProviderIcon } from '../components/ui';
import { paths } from '../constants/paths';
import { apiBase } from '../features/github/api';
import { routePaths } from '../constants/routes';

export default function AccessPage() {
  const navigate = useNavigate();
  const [query] = useSearchParams();

  useEffect(() => {
    const calendarOAuth = query.get('calendar_oauth');

    if (calendarOAuth) {
      navigate(
        `${paths.connections}?calendar_oauth=${encodeURIComponent(calendarOAuth)}`,
        { replace: true }
      );
      return;
    }

    const oauthResult = query.get('oauth');

    if (oauthResult) {
      navigate(
        `${routePaths.register}?oauth=${encodeURIComponent(oauthResult)}`,
        { replace: true }
      );
    }
  }, [query, navigate]);

  function enter(provider: 'google' | 'github') {
    window.location.assign(`${apiBase}/api/v1/auth/${provider}?intent=login`);
  }

  return (
    <VisitorShell access>
      <div className="access-layout">
        <aside className="access-story">
          <p className="ui-eyebrow">
            <span className="flow-small-orbit" />
            PERSONAS · TIEMPO · PROYECTOS
          </p>

          <h1>
            Tu mundo,<br />
            en la misma <em>órbita.</em>
          </h1>

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
          <div className="access-symbol">
            <FiLink />
          </div>

          <p className="ui-eyebrow">BIENVENIDO A ORBITIA</p>
          <h2>Entra a tu espacio.</h2>

          <p>
            Elige tu cuenta para continuar.<br />
            Si es tu primera vez, crearás tu perfil en el siguiente paso.
          </p>

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
    </VisitorShell>
  );
}