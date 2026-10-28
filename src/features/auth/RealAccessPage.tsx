import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { FiArrowRight, FiLink, FiShield } from 'react-icons/fi';
import { VisitorShell } from '../../components/features/flows/FlowShell';
import { OrbitIllustration } from '../../components/features/flows/OrbitIllustration';
import { Dialog } from '../../components/modals';
import { Alert, Button, Input, ProviderIcon, Spinner } from '../../components/ui';
import { useAuth } from './AuthContext';
import { safeReturnTo } from './api';
import './auth.css';

export function RealAccessPage() {
  const auth = useAuth();
  const [query] = useSearchParams();
  const navigate = useNavigate();
  const profile = auth.session?.profile;
  const [name, setName] = useState('');
  const [surname, setSurname] = useState('');
  const [handle, setHandle] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const result = query.get('oauth');
  const returnTo = safeReturnTo(query.get('returnTo') ?? '/perfil/conexiones');
  useEffect(() => {
    if (result && result !== 'success') {
      const back = query.get('intent') === 'link' ? '&volver=conexiones' : '';
      const reason = ['email_conflict', 'account_conflict', 'additional_info_required'].includes(result) ? '&reason=' + result : '';
      navigate('/acceso/no-completado?provider=' + (query.get('provider') === 'github' ? 'github' : 'google') + back + reason, { replace: true });
    } else if (auth.status === 'authenticated' && profile && !profile.requiresProfileCompletion) {
      navigate(returnTo, { replace: true });
    }
  }, [auth.status, profile, result, returnTo, query, navigate]);
  useEffect(() => {
    if (!profile) return;
    setName(profile.name === 'Usuario' ? '' : profile.name);
    setSurname(profile.firstSurname === 'Pendiente' ? '' : profile.firstSurname);
    setHandle(profile.handleName);
  }, [profile?.id]);
  async function save(event: FormEvent) {
    event.preventDefault(); setSaving(true); setError('');
    try { await auth.complete({ name, firstSurname: surname, handleName: handle }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa tus datos.'); }
    finally { setSaving(false); }
  }
  return <VisitorShell access><div className="access-layout"><aside className="access-story">
    <p className="ui-eyebrow"><span className="flow-small-orbit" />PERSONAS · TIEMPO · PROYECTOS</p>
    <h1>Tu mundo,<br />en la misma <em>órbita.</em></h1>
    <p>Tu perfil, tus reuniones y tus proyectos.<br />Un espacio para conectar lo que haces.</p>
    <OrbitIllustration panel /><div className="access-baseline"><span />Todo conectado. Todo a tu ritmo.<b>✦</b></div>
  </aside><section className="access-content"><div className="access-symbol"><FiLink /></div>
    <p className="ui-eyebrow">BIENVENIDO A ORBITIA</p><h2>Entra a tu espacio.</h2>
    <p>Continúa con Google o GitHub.<br />Puedes vincular ambas cuentas desde tus conexiones.</p>
    {auth.status === 'loading' ? <p className="auth-inline-status"><Spinner />Comprobando tu sesión…</p> : <div className="access-providers">
      {(['google', 'github'] as const).map(provider => <button type="button" key={provider} onClick={() => auth.authorize(provider, 'login', returnTo)}>
        <ProviderIcon provider={provider} /><span><strong>Continuar con {provider === 'google' ? 'Google' : 'GitHub'}</strong><small>Usa tu cuenta de {provider === 'google' ? 'Google' : 'GitHub'}</small></span><FiArrowRight />
      </button>)}
    </div>}
    {auth.error && <Alert tone="danger">{auth.error}</Alert>}
    <div className="access-assurance"><FiShield /><div><strong>Tu cuenta, bajo tu control.</strong>
      <p>Autoriza el acceso directamente en Google o GitHub. Tus cuentas se vinculan a un mismo perfil cuando tú lo eliges desde Orbitia.</p>
    </div></div><p className="access-existing">¿Ya tienes perfil? Usa una de tus cuentas vinculadas.</p>
  </section></div>
  <Dialog open={Boolean(profile?.requiresProfileCompletion)} onOpenChange={() => {}} dismissible={false} title="Dale un nombre a tu espacio." eyebrow="PRIMER ACCESO · GOOGLE O GITHUB" size="medium"
    footer={<><Button variant="secondary" disabled={saving} onClick={() => { void auth.logout().catch(failure => setError(failure.message)); }}>Salir</Button><Button type="submit" form="real-complete-profile" loading={saving} trailingIcon={<FiArrowRight />}>Guardar mi perfil</Button></>}>
    <div className="verified-identity"><FiShield /><div><strong>{profile?.email}</strong><span>Identidad externa verificada</span></div></div>
    <form id="real-complete-profile" className="flow-form" onSubmit={save}>
      {error && <Alert tone="danger">{error}</Alert>}<div className="flow-fields">
        <Input label="Nombre" required maxLength={100} value={name} onChange={event => setName(event.target.value)} />
        <Input label="Primer apellido" required maxLength={100} value={surname} onChange={event => setSurname(event.target.value)} />
      </div><Input label="Nombre de usuario" required minLength={3} maxLength={50} pattern="[a-z0-9\-]{3,50}" value={handle} onChange={event => setHandle(event.target.value.toLowerCase())} />
    </form>
  </Dialog></VisitorShell>;
}

