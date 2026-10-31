import { useSearchParams } from 'react-router';
import { FiArrowLeft, FiExternalLink, FiRefreshCw, FiServer, FiStar } from 'react-icons/fi';
import { MemberShell } from '../../components/features/flows/FlowShell';
import { ProfileTabs } from '../../components/features/profile/ProfileParts';
import { TextLink } from '../../components/features/flows/FlowPrimitives';
import { Alert, Button, ButtonLink, EmptyState, ProviderIcon, SectionHeading } from '../../components/ui';
import { paths } from '../../constants/paths';
import { apiBase, RepositoryApiError } from './api';
import { useRepositories } from './useRepositories';
import { RepositoryPicker } from './RepositoryPicker';
import { GithubActivitySection } from './GithubActivitySection';

export default function GithubRepositoriesPage() {
  const { data, error, loading, reload } = useRepositories();
  const [query, setQuery] = useSearchParams();
  const selected = data?.selectedIds.flatMap(id => data.repositories.find(repo => repo.id === id) ?? []) ?? [];
  const authError = error instanceof RepositoryApiError && [401, 409].includes(error.status);
  return <MemberShell><SectionHeading title="Tu trabajo, en tu perfil" eyebrow="MI CUENTA / PERFIL / CONEXIONES" accentPeriod actions={<TextLink to={paths.connections} icon={<FiArrowLeft />}>Volver a conexiones</TextLink>} /><ProfileTabs connections />
    {loading && <p role="status">Consultando tus repositorios en GitHub…</p>}
    {error && <Alert tone="danger">{error.message} {authError ? <a href={`${apiBase}/api/v1/auth/github?intent=${error instanceof RepositoryApiError && error.status === 401 ? 'login' : 'link'}`}>Autorizar GitHub</a> : <Button variant="ghost" onClick={() => void reload()}>Reintentar</Button>}</Alert>}
    {data && <><header className="github-account-heading"><ProviderIcon provider="github" /><div><h2>GitHub <span>@{data.username}</span></h2><p>Repositorios de tu cuenta vinculada. La publicación se configura por separado.</p></div><Button loading={loading} variant="ghost" leadingIcon={<FiRefreshCw />} onClick={() => void reload()}>Actualizar</Button></header>
      {data.warnings.map(warning => <Alert key={warning} tone="warning">{warning}</Alert>)}
      <div className="profile-section-head"><h3>Repositorios seleccionados</h3><Button variant="secondary" disabled={loading || Boolean(error)} onClick={() => setQuery({ modal: 'repositorios' })}>Gestionar</Button></div>
      {selected.map(repo => <article key={repo.id} className="github-repository"><header><FiServer /><h4>{repo.name}</h4><span>{repo.visible ? 'Visible en tu perfil' : 'Solo tú'}</span><a href={repo.url} target="_blank" rel="noopener noreferrer" aria-label={`Abrir ${repo.name} en GitHub`}><FiExternalLink /></a></header><p>{repo.description ?? 'Sin descripción.'}</p><footer><span>{repo.language ?? 'Lenguaje no especificado'}</span><span><FiStar />{repo.stars}</span><small>Desde GitHub</small></footer></article>)}
      {!selected.length && <EmptyState title="Elige tus repositorios" description={`Selecciona hasta ${data.maxSelected} proyectos públicos para tu perfil.`} actions={<Button disabled={loading || Boolean(error)} onClick={() => setQuery({ modal: 'repositorios' })}>Seleccionar repositorios</Button>} />}
      <GithubActivitySection />
      <footer className="github-privacy-footer"><p>Los proyectos nuevos se guardan como privados en Orbitia hasta que decidas publicarlos.</p><ButtonLink to={paths.visibility} variant="secondary">Configurar visibilidad</ButtonLink></footer>
      {query.get('modal') === 'repositorios' && !loading && !error && <RepositoryPicker data={data} onClose={() => setQuery({})} onSaved={() => { setQuery({}); void reload(); }} />}
    </>}
  </MemberShell>;
}
