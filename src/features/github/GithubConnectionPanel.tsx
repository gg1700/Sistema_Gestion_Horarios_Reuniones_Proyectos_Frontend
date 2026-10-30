import { Link } from 'react-router';
import { ProviderIcon } from '../../components/ui';
import { paths } from '../../constants/paths';
import { apiBase, RepositoryApiError } from './api';
import { useRepositories } from './useRepositories';

export function GithubConnectionPanel() {
  const { data, loading, error, reload } = useRepositories();
  return <article className="connection-provider"><ProviderIcon provider="github" /><div><header><h2>GitHub</h2><span>{loading ? 'Consultando…' : error ? 'Revisar conexión' : 'Conectado'}</span></header>
    {data && <><p>@{data.username}</p><p>{data.selectedIds.length} repositorios seleccionados</p>{data.warnings.map(warning => <p role="status" key={warning}>{warning}</p>)}<Link className="flow-link" to={paths.githubInfo}>Ver información y gestionar repositorios</Link></>}
    {error && <><p role="alert">{error.message}</p>{error instanceof RepositoryApiError && [401, 409].includes(error.status) ? <a className="flow-link" href={`${apiBase}/api/v1/auth/github?intent=${error.status === 401 ? 'login' : 'link'}`}>Autorizar GitHub</a> : <button className="flow-link" onClick={() => void reload()}>Reintentar</button>}</>}
    <p className="connection-provider-note">La selección se guarda en tu cuenta. Publicarla es una decisión separada en Visibilidad.</p>
  </div></article>;
}
