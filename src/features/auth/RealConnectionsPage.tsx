import { useEffect, useState } from 'react';
import { FiArrowRight, FiRefreshCw, FiShield } from 'react-icons/fi';
import { MemberShell } from '../../components/features/flows/FlowShell';
import { OrbitIllustration } from '../../components/features/flows/OrbitIllustration';
import { ProfileIdentity, ProfileTabs } from '../../components/features/profile/ProfileParts';
import { StatusDot } from '../../components/features/flows/FlowPrimitives';
import { Dialog } from '../../components/modals';
import { Alert, Button, ProviderIcon, SectionHeading } from '../../components/ui';
import { useAuth } from './AuthContext';
import { unlinkIdentity } from './api';
import { useGitHubConnection } from './useGitHubConnection';
import type { AuthProviderName } from './types';
import './auth.css';

export function RealConnectionsPage() {
  const auth = useAuth();
  const accounts = auth.session?.accounts ?? [];
  const github = accounts.find(account => account.provider === 'github');
  const check = useGitHubConnection(auth.session?.profile.id ?? '', Boolean(github), github?.state);
  useEffect(() => { if (check.sessionExpired) void auth.refresh(); }, [check.sessionExpired, auth.refresh]);
  const [removing, setRemoving] = useState<AuthProviderName | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const needsAuthorization = github && (github.state !== 'active' || check.code === 'GITHUB_REAUTH_REQUIRED');
  async function remove() {
    if (!removing) return;
    setSaving(true); setError('');
    try { await unlinkIdentity(removing); await auth.refresh(); setRemoving(null); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo quitar la cuenta.'); }
    finally { setSaving(false); }
  }
  return <MemberShell><SectionHeading title="Tus conexiones" eyebrow="MI CUENTA / PERFIL" accentPeriod actions={<span className="connections-heading-note">Google · GitHub</span>} />
    <ProfileIdentity /><ProfileTabs connections />
    <div className="connections-columns"><section className="connections-provider-list">
      {(['google', 'github'] as const).map(provider => {
        const account = accounts.find(item => item.provider === provider);
        const isGitHub = provider === 'github';
        const display = isGitHub ? check.data?.username ?? account?.username : account?.email;
        return <article key={provider} className="connection-provider"><ProviderIcon provider={provider} /><div>
          <header><h2>{isGitHub ? 'GitHub' : 'Google'}</h2><StatusDot tone={!account ? 'muted' : isGitHub && (needsAuthorization || check.error) ? 'warning' : 'success'}>
            {!account ? 'Sin vincular' : isGitHub && check.loading ? 'Comprobando' : isGitHub && check.data ? 'Conexión verificada' : isGitHub && needsAuthorization ? 'Requiere autorización' : 'Cuenta vinculada'}
          </StatusDot></header>
          {display && <p>{isGitHub ? '@' : ''}{display}</p>}
          <p className="connection-provider-note">{isGitHub ? 'Vincula tu cuenta de GitHub para consultar tus proyectos desde Orbitia.' : 'Puedes usar Google para entrar al mismo perfil de Orbitia.'}</p>
          {isGitHub && check.data && <p className="auth-connection-note">Acceso a repositorios públicos confirmado. Publicarás únicamente los proyectos públicos que elijas.</p>}
          {isGitHub && check.error && <div className="auth-connection-error"><Alert tone="warning">{check.error}</Alert></div>}
          <div className="connection-actions">
            {!account || (isGitHub && needsAuthorization) ? <Button variant="secondary" size="small" trailingIcon={<FiArrowRight />} onClick={() => auth.authorize(provider, 'link')}>
              {!account ? 'Vincular ' : 'Volver a autorizar '}{isGitHub ? 'GitHub' : 'Google'}
            </Button> : isGitHub && <Button variant="secondary" size="small" loading={check.loading} leadingIcon={<FiRefreshCw />} onClick={check.retry}>Verificar conexión</Button>}
            {account && <button type="button" className="flow-link connection-unlink" onClick={() => { setError(''); setRemoving(provider); }}>Quitar acceso con {isGitHub ? 'GitHub' : 'Google'}</button>}
          </div>
        </div></article>;
      })}
      <p className="flow-note"><FiShield />Vincular una segunda cuenta desde aquí mantiene un solo perfil. No se fusionan cuentas por correo electrónico.</p>
    </section><aside className="connections-aside"><OrbitIllustration services /><p className="ui-eyebrow">EN LA MISMA ÓRBITA</p><h2>Dos formas de entrar.<br />Un mismo espacio.</h2><p>Elige Google, GitHub o vincula ambos. Para trabajar con tus repositorios necesitas una cuenta GitHub vinculada y autorizada.</p></aside></div>
    <Dialog open={Boolean(removing)} onOpenChange={open => { if (!open && !saving) setRemoving(null); }} title={'¿Quitar acceso con ' + (removing === 'github' ? 'GitHub' : 'Google') + '?'} eyebrow="CUENTAS VINCULADAS"
      footer={<><Button variant="secondary" disabled={saving} onClick={() => setRemoving(null)}>Conservar conexión</Button><Button variant="danger" loading={saving} disabled={accounts.length <= 1} onClick={() => void remove()}>Desvincular</Button></>}>
      {error && <Alert tone="danger">{error}</Alert>}
      <p className="flow-copy">{accounts.length <= 1 ? 'Vincula otra cuenta antes de quitar esta: necesitas Google o GitHub para volver a entrar.' : 'Conservarás tu perfil de Orbitia y podrás entrar con la otra cuenta vinculada.'}</p>
    </Dialog>
  </MemberShell>;
}

