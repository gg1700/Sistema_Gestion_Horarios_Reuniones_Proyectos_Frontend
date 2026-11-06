import { useSearchParams } from 'react-router';
import { FiActivity, FiArrowLeft, FiExternalLink, FiGitBranch, FiRefreshCw, FiServer, FiStar, FiEye } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink, StatusDot } from '../components/features/flows/FlowPrimitives';
import { ProfileIdentity, ProfileTabs } from '../components/features/profile/ProfileParts';
import { ConnectionDialogs } from '../components/features/connections/ConnectionDialogs';
import { Button, ButtonLink, EmptyState, ProviderIcon, SectionHeading } from '../components/ui';
import { useMockFlow } from '../contexts/MockFlowContext';
import { useUI } from '../contexts/UIContext';
import { githubActivity, repositories } from '../mocks/account';
import { paths } from '../constants/paths';

export { default } from '../features/github/GithubRepositoriesPage';

export function DemoGitHubInfoPage() {
  const { state, dispatch } = useMockFlow();
  const { notify } = useUI();
  const [query, setQuery] = useSearchParams();
  const selected = state.account.github.selectedRepositories.flatMap(id => repositories.find(repo => repo.id === id) ?? []);
  return <MemberShell><SectionHeading title="Tu trabajo, en tu perfil" eyebrow="MI CUENTA / PERFIL / CONEXIONES" accentPeriod actions={<TextLink to={paths.connections} icon={<FiArrowLeft />}>Volver a conexiones</TextLink>} />
    <ProfileIdentity /><ProfileTabs connections />
    {state.account.github.dataConnected ? <><header className="github-account-heading"><ProviderIcon provider="github" /><div><h2>GitHub <span>@mateosilva</span></h2><p>Información obtenida de tu cuenta vinculada.</p></div><StatusDot>Conectado</StatusDot><Button variant="ghost" size="small" leadingIcon={<FiRefreshCw />} onClick={() => { dispatch({ type: 'account', action: { type: 'refresh-github', at: new Date().toISOString() } }); notify('Información actualizada.', 'success'); }}>{state.account.github.refreshedAt ? 'Actualizado ahora' : 'Actualizar'}</Button></header>
      <div className="github-info-columns"><section><div className="profile-section-head"><h3>Repositorios seleccionados</h3><button type="button" className="flow-link" onClick={() => setQuery({ modal: 'repositorios' })}>Gestionar <FiArrowLeft className="rotate-arrow" /></button></div>
        {selected.map(repo => <article className="github-repository" key={repo.id}><header><FiServer /><h4>{repo.name}</h4><span>Público</span><a href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${repo.name} en GitHub`}><FiExternalLink /></a></header><p>{repo.description}</p><footer><span className={`repository-language repository-language--${repo.language.toLowerCase()}`}>{repo.language}</span><span><FiStar />{repo.stars}</span><span><FiGitBranch />{repo.forks}</span><small>Desde GitHub</small></footer></article>)}
        {!selected.length && <EmptyState title="Elige tus repositorios" description="Selecciona hasta cinco proyectos para integrarlos a tu perfil." actions={<Button variant="secondary" onClick={() => setQuery({ modal: 'repositorios' })}>Seleccionar repositorios</Button>} />}
      </section><aside><div className="profile-section-head"><h3>Actividad reciente</h3><small>GitHub</small></div><ol className="github-activity">{githubActivity.map(event => <li key={event.id}><time dateTime={event.date}>{event.when}</time><h4>{event.title}</h4><p>{event.detail}</p></li>)}</ol><p className="flow-note flow-top-rule"><FiActivity />La actividad conserva las fechas de los eventos de GitHub.</p></aside></div>
      <footer className="github-privacy-footer"><p className="flow-note"><FiEye />Estás viendo tu información privada. Tú decides qué se muestra en tu perfil público.</p><TextLink to={paths.visibility}>Configurar visibilidad</TextLink></footer>
    </> : <EmptyState title="GitHub está desconectado" description="Vincula tu cuenta para consultar repositorios y actividad." actions={<ButtonLink to={`${paths.connections}?modal=conectar-github`}>Conectar GitHub</ButtonLink>} />}
    <ConnectionDialogs modal={query.get('modal')} onClose={() => setQuery({})} onNext={modal => setQuery({ modal })} />
  </MemberShell>;
}
