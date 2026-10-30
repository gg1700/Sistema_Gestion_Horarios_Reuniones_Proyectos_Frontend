import { useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp, FiEye, FiSearch } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, Checkbox, Input, ProviderIcon } from '../../ui';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { repositories } from '../../../mocks/account';

/*
CONTRATO BACKEND PROPUESTO — SELECCIÓN Y ORDEN DE REPOSITORIOS
GET /api/v1/connections/github/repositories — sesión e integración GitHub; sin body.
Respuesta JSON 200:
{ "data": { "repositories": [{ "id": "repo-1", "name": "orbitia-web", "description": "Interfaz para coordinar reuniones.", "language": "TypeScript", "stars": 24, "forks": 4, "url": "https://github.com/mateosilva/orbitia-web", "visibility": "public" }, { "id": "repo-2", "name": "telematics-api", "description": "Integración de herramientas.", "language": "TypeScript", "stars": 18, "forks": 3, "url": "https://github.com/mateosilva/telematics-api", "visibility": "public" }], "selectedIds": ["repo-1", "repo-2"] } }
Llenado: repositories -> búsqueda y checks; selectedIds -> checks iniciales y orden
del panel derecho. Buscar, marcar y mover usa un borrador local; Cancelar lo descarta.
PUT /api/v1/connections/github/repositories/selection
Request JSON (el orden del array es el orden del perfil):
{ "repositoryIds": ["repo-2", "repo-1"] }
Respuesta JSON 200:
{ "data": { "repositoryIds": ["repo-2", "repo-1"] } }
De 0 a 5 ids distintos de la cuenta vinculada; servidor valida pertenencia y selección
permitida. [] limpia la selección. Esto no publica: publicación depende de Visibilidad.
Errores: 401 sin sesión; 409 GITHUB_NOT_CONNECTED -> autorizar; 422 id ajeno, repetido
o más de cinco. Mantener selección y mostrar error. Guardar solo tras confirmar respuesta.
*/
export { RemoteRepositorySelection as RepositorySelection } from '../../../features/github/RepositoryPicker';

// Maqueta original conservada como referencia visual del equipo.
export function DemoRepositorySelection({ onClose }: { onClose: () => void }) {
  const { state, dispatch } = useMockFlow();
  const [selected, setSelected] = useState([...state.account.github.selectedRepositories]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const shown = repositories.filter(repo => repo.name.toLowerCase().includes(search.toLowerCase().trim()));
  function select(id: string, value: boolean) {
    if (value && selected.length >= 5) { setError('Puedes seleccionar hasta 5 repositorios.'); return; }
    setSelected(current => value ? [...current, id] : current.filter(item => item !== id)); setError('');
  }
  function move(index: number, offset: number) {
    const target = index + offset;
    if (target < 0 || target >= selected.length) return;
    const next = [...selected]; [next[index], next[target]] = [next[target], next[index]]; setSelected(next);
  }
  function save() {
    try { dispatch({ type: 'account', action: { type: 'select-repositories', ids: selected } }); onClose(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa la selección.'); }
  }
  return <Dialog open onOpenChange={value => { if (!value) onClose(); }} title="Elige qué proyectos te representan." eyebrow="GITHUB / REPOSITORIOS" description="Selecciona hasta 5 repositorios y define el orden en tu perfil." size="large" className="repository-selection-dialog"
    footer={<><span className="profile-dialog-note"><ProviderIcon provider="github" />@mateosilva</span><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button onClick={save} trailingIcon={<FiCheck />}>Guardar selección</Button></>}>
    {error && <Alert tone="danger">{error}</Alert>}<Input label="Buscar por nombre de repositorio" containerClassName="profile-label-sr-only repository-search" placeholder="Buscar por nombre de repositorio" leadingContent={<FiSearch />} value={search} onChange={event => setSearch(event.target.value)} />
    <div className="repository-selection-columns"><div>{shown.map(repo => <article key={repo.id} className="repository-choice"><Checkbox label={<><strong>{repo.name}</strong><small>Público</small></>} checked={selected.includes(repo.id)} onChange={event => select(repo.id, event.target.checked)} /><p>{repo.description}</p><span className={`repository-language repository-language--${repo.language.toLowerCase()}`}>{repo.language}</span></article>)}{!shown.length && <p className="flow-copy">No se encontraron repositorios con ese nombre.</p>}</div>
      <aside><p className="ui-eyebrow">TU SELECCIÓN</p><h3>{selected.length} de 5 repositorios</h3><p>Ordénalos como quieres mostrarlos.</p><ol aria-live="polite">{selected.map((id, index) => <li key={id}><span>{String(index + 1).padStart(2, '0')}</span><strong>{repositories.find(repo => repo.id === id)?.name}</strong><button type="button" className="profile-small-action" disabled={index === 0} aria-label={`Subir ${id}`} onClick={() => move(index, -1)}><FiChevronUp /></button><button type="button" className="profile-small-action" disabled={index === selected.length - 1} aria-label={`Bajar ${id}`} onClick={() => move(index, 1)}><FiChevronDown /></button></li>)}</ol><p className="flow-note flow-top-rule"><FiEye />Su publicación se controla desde Visibilidad.</p></aside>
    </div>
  </Dialog>;
}
