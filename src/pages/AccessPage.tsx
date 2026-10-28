import { useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FiArrowRight, FiLink, FiShield } from 'react-icons/fi';
import { VisitorShell } from '../components/features/flows/FlowShell';
import { OrbitIllustration } from '../components/features/flows/OrbitIllustration';
import { Dialog } from '../components/modals';
import { Alert, Button, Input, ProviderIcon } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { paths } from '../constants/paths';

/*
CONTRATO BACKEND PROPUESTO — ACCESO CON GOOGLE / GITHUB
Página pública. Navegar a uno de estos endpoints, no pedir contraseñas en Orbitia:
GET /api/v1/auth/google?intent=login&returnTo=%2Fpanel
GET /api/v1/auth/github?intent=login&returnTo=%2Fpanel
Body: ninguno. Respuesta 302: Location al proveedor; no hay JSON en esta redirección.
Callback GET /api/v1/auth/google/callback?code=CODIGO&state=ESTADO (igual para github):
servidor valida state/código, crea cookie de sesión HttpOnly y redirige al frontend.
No entregar access_token ni refresh_token al navegador ni en parámetros de la URL.

GET /api/v1/session — sin body; después del retorno para decidir el siguiente paso.
Respuesta JSON 200, ejemplo de primer acceso:
{ "data": { "authenticated": true, "profileCompleted": false, "provider": "google", "profile": { "name": "Mateo", "firstSurname": "Silva", "email": "mateo.silva@correo.com", "handle": "" } } }
profileCompleted false -> modal completar cuenta; true -> panel o retorno interno permitido.
email viene del proveedor verificado y solo se muestra, nunca se acepta desde este form.

PATCH /api/v1/profile — completar la cuenta tras la identidad externa verificada.
Request JSON:
{ "name": "Mateo", "firstSurname": "Silva", "handle": "mateo-silva" }
Respuesta JSON 200:
{ "data": { "profileCompleted": true, "profile": { "name": "Mateo", "firstSurname": "Silva", "email": "mateo.silva@correo.com", "handle": "mateo-silva" } } }
Nombre/apellido obligatorios; handle único de 3 a 50 caracteres a-z, 0-9 o guiones,
sin nombres de rutas reservadas. Solo permitir handle en este PATCH durante el alta;
para cambiarlo después usar el contrato de ProfileLinkPage.tsx.
401 sin identidad verificada; 409 usuario ocupado; 422 errores por campo. Mantener modal
y valores ante errores; éxito -> /bienvenida. Cancelación OAuth -> /acceso/no-completado.
*/
export default function AccessPage() {
  const { state, dispatch } = useMockFlow();
  const navigate = useNavigate();
  const [query, setQuery] = useSearchParams();
  const completing = query.has('completar');
  const [name, setName] = useState(state.profile.name);
  const [surname, setSurname] = useState(state.profile.firstSurname);
  const [handle, setHandle] = useState(state.profile.handle);
  const [error, setError] = useState('');

  function enter(provider: 'google' | 'github') {

    if (state.profileCompleted) {
      if (!state.account[provider].identityLinked) { navigate(paths.accessIssue); return; }
      navigate(paths.dashboard); return;
    }
    setQuery({ completar: provider });
  }
  function complete(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {

      dispatch({ type: 'complete-profile', profile: { ...state.profile, name, firstSurname: surname, handle }, provider: query.get('completar') === 'github' ? 'github' : 'google' });
      navigate(paths.welcome);
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa tus datos.'); }
  }
  return <VisitorShell access><div className="access-layout"><aside className="access-story"><p className="ui-eyebrow"><span className="flow-small-orbit" />PERSONAS · TIEMPO · PROYECTOS</p>
    <h1>Tu mundo,<br />en la misma <em>órbita.</em></h1><p>Tu perfil, tus reuniones y tus proyectos.<br />Un espacio para conectar lo que haces.</p>
    <OrbitIllustration panel /><div className="access-baseline"><span />Todo conectado. Todo a tu ritmo.<b>✦</b></div>
  </aside><section className="access-content"><div className="access-symbol"><FiLink /></div><p className="ui-eyebrow">BIENVENIDO A ORBITIA</p><h2>Entra a tu espacio.</h2>
    <p>Elige tu cuenta para continuar.<br />Si es tu primera vez, crearás tu perfil en el siguiente paso.</p>
    <div className="access-providers">{(['google', 'github'] as const).map(provider => <button type="button" key={provider} onClick={() => enter(provider)}>
      <ProviderIcon provider={provider} /><span><strong>Continuar con {provider === 'google' ? 'Google' : 'GitHub'}</strong><small>Usa tu cuenta de {provider === 'google' ? 'Google' : 'GitHub'}</small></span><FiArrowRight />
    </button>)}</div><div className="access-assurance"><FiShield /><div><strong>Tu cuenta, bajo tu control.</strong><p>El acceso se autoriza en Google o GitHub. Después tú eliges si conectas tu calendario, repositorios y actividad.</p></div></div>
    <p className="access-existing">• &nbsp; ¿Ya tienes perfil? Usa una de tus cuentas vinculadas.</p>
  </section></div>
    <Dialog open={completing} onOpenChange={open => { if (!open) setQuery({}); }} title="Dale un nombre a tu espacio." eyebrow="PRIMER ACCESO · GOOGLE O GITHUB" className="account-completion-dialog" size="medium"
      footer={<><Button variant="secondary" onClick={() => setQuery({})}>Volver</Button><Button type="submit" form="complete-account" trailingIcon={<FiArrowRight />}>Crear mi perfil</Button></>}>
      <div className="verified-identity"><FiShield /><div><strong>{state.profile.email}</strong><span>Identidad externa verificada</span></div><small>• &nbsp; Verificada</small></div>
      <p className="flow-copy">Confirma cómo aparecerás en Orbitia y elige tu nombre de usuario.</p>
      <form id="complete-account" className="flow-form" onSubmit={complete}>
        {error && <Alert tone="danger">{error}</Alert>}<div className="flow-fields"><Input label="Nombre" autoComplete="given-name" required maxLength={100} value={name} onChange={event => setName(event.target.value)} autoFocus /><Input label="Primer apellido" autoComplete="family-name" required maxLength={100} value={surname} onChange={event => setSurname(event.target.value)} /></div>
        <Input label="Nombre de usuario" required minLength={3} maxLength={50} pattern="[a-z0-9\-]{3,50}" value={handle} onChange={event => setHandle(event.target.value.toLowerCase())} hint={`orbitia.app/${handle} · 3 a 50 letras minúsculas, números o guiones`} />
      </form><p className="flow-note flow-top-rule"><FiLink />El correo está asociado a la cuenta verificada. Podrás completar el resto de tu perfil y autorizar tus integraciones después.</p>
    </Dialog>
  </VisitorShell>;
}
