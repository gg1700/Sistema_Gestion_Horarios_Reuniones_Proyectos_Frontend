import { useState } from 'react';
import { FiCheck, FiChevronDown, FiChevronUp, FiEye, FiSearch } from 'react-icons/fi';
import { Dialog } from '../../components/modals';
import { Alert, Button, Checkbox, Input, ProviderIcon } from '../../components/ui';
import { saveRepositories, type RepositoryCatalogue } from './api';
import { useRepositories } from './useRepositories';

export function RepositoryPicker({ data, onClose, onSaved }: { data: RepositoryCatalogue; onClose: () => void; onSaved: () => void }) {
  const [selected, setSelected] = useState([...data.selectedIds]);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const shown = data.repositories.filter(repo => repo.name.toLowerCase().includes(search.trim().toLowerCase()));
  function select(id: number, checked: boolean) {
    if (checked && selected.length >= data.maxSelected) { setError(`Puedes seleccionar hasta ${data.maxSelected} repositorios.`); return; }
    setSelected(items => checked ? [...items, id] : items.filter(item => item !== id)); setError('');
  }
  function move(index: number, offset: number) {
    const next = [...selected]; [next[index], next[index + offset]] = [next[index + offset], next[index]]; setSelected(next);
  }
  async function save() {
    setSaving(true); setError('');
    try { await saveRepositories(selected); onSaved(); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar.'); setSaving(false); }
  }
  return <Dialog open dismissible={!saving} onOpenChange={open => { if (!open && !saving) onClose(); }} title="Elige qué proyectos te representan." eyebrow="GITHUB / REPOSITORIOS" description={`Selecciona hasta ${data.maxSelected} repositorios públicos y define el orden en tu perfil.`} size="large" className="repository-selection-dialog"
    footer={<><span className="profile-dialog-note"><ProviderIcon provider="github" />@{data.username}</span><Button variant="secondary" disabled={saving} onClick={onClose}>Cancelar</Button><Button loading={saving} onClick={save} trailingIcon={<FiCheck />}>Guardar selección</Button></>}>
    {error && <Alert tone="danger">{error}</Alert>}
    <Input label="Buscar por nombre de repositorio" placeholder="Buscar por nombre de repositorio" leadingContent={<FiSearch />} value={search} onChange={event => setSearch(event.target.value)} />
    <div className="repository-selection-columns"><div>{shown.map(repo => <article className="repository-choice" key={repo.id}>
      <Checkbox disabled={saving || repo.visibility !== 'public'} label={<><strong>{repo.name}</strong><small>{repo.visibility === 'public' ? 'Público' : 'Privado · no se puede publicar'}</small></>} checked={selected.includes(repo.id)} onChange={event => select(repo.id, event.target.checked)} />
      <p>{repo.description ?? 'Sin descripción.'}</p><span>{repo.language ?? 'Lenguaje no especificado'}</span>
    </article>)}{!shown.length && <p className="flow-copy">{data.repositories.length ? 'No se encontraron repositorios con ese nombre.' : 'Tu cuenta no tiene repositorios disponibles.'}</p>}</div>
    <aside><p className="ui-eyebrow">TU SELECCIÓN</p><h3>{selected.length} de {data.maxSelected} repositorios</h3><p>Ordénalos como quieres mostrarlos.</p>
      <ol aria-live="polite">{selected.map((id, index) => <li key={id}><span>{index + 1}</span><strong>{data.repositories.find(repo => repo.id === id)?.name}</strong>
        <button type="button" disabled={saving || index === 0} aria-label={`Subir ${id}`} onClick={() => move(index, -1)}><FiChevronUp /></button>
        <button type="button" disabled={saving || index === selected.length - 1} aria-label={`Bajar ${id}`} onClick={() => move(index, 1)}><FiChevronDown /></button>
      </li>)}</ol><p className="flow-note flow-top-rule"><FiEye />Guardar la selección no la publica. Configura su visibilidad después.</p></aside></div>
  </Dialog>;
}

export function RemoteRepositorySelection({ onClose }: { onClose: () => void }) {
  const { data, error, loading } = useRepositories();
  if (data) return <RepositoryPicker data={data} onClose={onClose} onSaved={onClose} />;
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }} title="Tus repositorios" footer={<Button onClick={onClose}>Volver</Button>}>{loading ? <p role="status">Consultando GitHub…</p> : <Alert tone="danger">{error?.message}</Alert>}</Dialog>;
}
