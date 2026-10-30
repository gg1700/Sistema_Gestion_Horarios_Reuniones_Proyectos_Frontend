import { useEffect, useState } from 'react';
import { FiCheck, FiEye } from 'react-icons/fi';
import { MemberShell } from '../../components/features/flows/FlowShell';
import { ProfileTabs } from '../../components/features/profile/ProfileParts';
import { PublicProfileView } from '../../components/features/profile/PublicProfileView';
import { Alert, Button, SectionHeading, Switch } from '../../components/ui';
import { Dialog } from '../../components/modals';
import { toPublicSnapshot } from '../../api/publicProfileAdapter';
import type { PublicProfile } from '../../types/profilePreview';
import { getRepositories, githubApi, saveRepositoryVisibility, type RepositoryCatalogue } from './api';

interface VisibilityRow { type: string; id: string; label: string; visible: boolean; group: string }
type Owned<T> = T & { id: string; visible: boolean };
interface OwnProfile {
  id: string; handleName: string; name: string; firstSurname: string; profilePicture: string | null;
  surname: { surname: string; visible: boolean } | null;
  countries: Owned<{countryName: string; countryCode: string}>[];
  addresses: Owned<{address: string}>[];
  contactEmails: Owned<{email: string}>[];
  phones: Owned<{phoneNumber: string; countryCode: string}>[];
  workExperiences: Owned<{title: string; description: string | null; companyName: string | null; startDate: string; endDate: string | null}>[];
  links: Owned<{text: string; url: string}>[];
}
// GET /profile devuelve registros con id/visible. PATCH /profile/visibility acepta
// {changes:[{type:'repository',id:'UUID de selección',visible:true}]} y responde success:true.
// El UUID es el de PostgreSQL, no el ID numérico de GitHub. No enviar email de acceso.
export default function ProfileVisibilityPage() {
  const [own, setOwn] = useState<OwnProfile | null>(null);
  const [catalogue, setCatalogue] = useState<RepositoryCatalogue | null>(null);
  const [rows, setRows] = useState<VisibilityRow[]>([]);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [preview, setPreview] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        const profile = await githubApi<OwnProfile>('/profile', { signal: controller.signal });
        let repos: RepositoryCatalogue | null = null;
        try { repos = await getRepositories(controller.signal); }
        catch (failure) { if (!controller.signal.aborted) setNotice(failure instanceof Error ? failure.message : 'No se pudo consultar GitHub.'); }
        if (controller.signal.aborted) return;
        setOwn(profile); setCatalogue(repos);
        const result: VisibilityRow[] = [];
        if (profile.surname) result.push({ type: 'surname', id: profile.id, label: profile.surname.surname, visible: profile.surname.visible, group: 'Datos personales' });
        const addRows = <T extends {id: string; visible: boolean},>(items: T[], type: string, group: string, label: (item: T) => string) => {
          for (const item of items ?? []) result.push({type,group,id:item.id,visible:item.visible,label:label(item)});
        };
        addRows(profile.countries,'country','Datos personales',item=>item.countryName);
        addRows(profile.addresses,'address','Datos personales',item=>item.address);
        addRows(profile.contactEmails,'email','Contacto',item=>item.email);
        addRows(profile.phones,'phone','Contacto',item=>`${item.countryCode} ${item.phoneNumber}`);
        addRows(profile.workExperiences,'workExperience','Trayectoria',item=>item.title);
        addRows(profile.links,'link','Enlaces personales',item=>item.text);
        for (const id of repos?.selectedIds ?? []) {
          const repo = repos?.repositories.find(item => item.id === id);
          if (repo?.selectionId) result.push({ type: 'repository', id: repo.selectionId, label: repo.name, visible: repo.visible, group: 'Repositorios seleccionados' });
        }
        setRows(result);
      } catch (failure) { if (!controller.signal.aborted) setError(failure instanceof Error ? failure.message : 'No se pudo cargar la visibilidad.'); }
    }
    void load(); return () => controller.abort();
  }, []);
  const visible = (type: string, id: string) => rows.some(row => row.type === type && row.id === id && row.visible);
  const filtered: PublicProfile | null = own ? {
    handleName: own.handleName, name: own.name, firstLastName: own.firstSurname, profilePicture: own.profilePicture,
    surname: own.surname && visible('surname', own.id) ? own.surname.surname : null,
    countries: own.countries.filter(item => visible('country',item.id)),
    addresses: own.addresses.filter(item => visible('address',item.id)),
    contactEmails: own.contactEmails.filter(item => visible('email',item.id)),
    phones: own.phones.filter(item => visible('phone',item.id)),
    workExperiences: own.workExperiences.filter(item => visible('workExperience',item.id)),
    links: own.links.filter(item => visible('link',item.id)),
    repositories: catalogue?.selectedIds.flatMap(id => {
      const repo = catalogue.repositories.find(item => item.id === id);
      return repo?.selectionId && visible('repository', repo.selectionId) ? [repo] : [];
    }),
  } : null;
  async function save() {
    setSaving(true); setError(''); setNotice('');
    try { if (rows.length) await saveRepositoryVisibility(rows.map(({ type, id, visible }) => ({ type, id, visible }))); setNotice('Visibilidad guardada. Tu perfil público ya muestra los cambios.'); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'No se pudo guardar.'); }
    finally { setSaving(false); }
  }
  return <MemberShell><SectionHeading title="Decide qué compartes" eyebrow="MI CUENTA / PERFIL" accentPeriod actions={<Button variant="ghost" disabled={!own} leadingIcon={<FiEye />} onClick={() => setPreview(true)}>Vista previa</Button>} /><ProfileTabs />
    {error && <Alert tone="danger">{error}</Alert>}{notice && <Alert tone="info">{notice}</Alert>}
    {!own && !error && <p role="status">Cargando visibilidad…</p>}
    {own && <><p className="flow-note">Nombre, primer apellido, usuario y fotografía siempre identifican tu perfil. Los demás datos se muestran solo si los activas.</p>
      {[...new Set(rows.map(row => row.group))].map(group => <section className="visibility-group" key={group}>
        <h3>{group}</h3>
        {rows.filter(row => row.group === group).map(row => <div className="visibility-row" key={`${row.type}-${row.id}`}>
          <span>{row.label}</span><p />
          <small className={row.visible ? 'is-public' : undefined}>{row.visible ? 'Público' : 'Solo yo'}</small>
          <span className="visibility-toggle">
            <Switch disabled={saving} label={`${row.label}: público`} checked={row.visible} onChange={event => {
              const checked = event.target.checked;
              setRows(current => current.map(item => item.id === row.id && item.type === row.type ? { ...item, visible: checked } : item));
            }} />
          </span>
        </div>)}
      </section>)}
      {!rows.some(row => row.type === 'repository') && <p>No hay repositorios seleccionados disponibles para publicar. Elígelos en Conexiones → GitHub.</p>}
      <footer className="visibility-save"><p>Guardar la selección de proyectos no activa su visibilidad.</p><Button loading={saving} leadingIcon={<FiCheck />} onClick={save}>Guardar cambios</Button></footer></>}
    {preview && filtered && <Dialog open title="Así te ven otras personas." eyebrow="VISTA PREVIA" size="large" onOpenChange={open => { if (!open) setPreview(false); }} footer={<Button onClick={() => setPreview(false)}>Volver a visibilidad</Button>}><PublicProfileView profile={toPublicSnapshot(filtered)} visitor /></Dialog>}
  </MemberShell>;
}
