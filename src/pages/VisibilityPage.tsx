import { FiCheck, FiLock } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { ProfileTabs } from '../components/features/profile/ProfileParts';
import { Alert, Avatar, Button, SectionHeading, Switch } from '../components/ui';
import { useUI } from '../contexts/UIContext';
import { useVisibilitySettings } from '../hooks/useVisibilitySettings';
import type { VisibilityType } from '../types/visibility';
import { visibilityKey, visibilityValue } from '../utils/visibility';

const groups: { title: string; types: VisibilityType[] }[] = [
  { title: 'Datos personales', types: ['surname', 'country', 'address'] },
  { title: 'Contacto', types: ['email', 'phone'] },
  { title: 'Trayectoria y enlaces', types: ['workExperience', 'link'] },
  { title: 'Repositorios y actividad', types: ['repository', 'githubActivityList', 'githubActivityGrid'] },
];
const labels: Record<VisibilityType, string> = {
  surname: 'Segundo apellido', country: 'País', address: 'Dirección', email: 'Correo de contacto',
  phone: 'Teléfono', workExperience: 'Experiencia laboral', link: 'Enlace personal',
  repository: 'Repositorio', githubActivityList: 'Actividad de GitHub', githubActivityGrid: 'Contribuciones de GitHub',
};

export default function VisibilityPage() {
  const settings = useVisibilitySettings();
  const { notify } = useUI();
  const { profile, draft, isLoading, isSaving, error, message, hasPendingChanges } = settings;
  async function save() {
    if (await settings.save()) notify('Visibilidad guardada.', 'success');
  }
  return <MemberShell>
    <SectionHeading title="Decide qué compartes" eyebrow="MI CUENTA / PERFIL" accentPeriod />
    {profile && <div className="profile-context">
      <Avatar name={`${profile.name} ${profile.firstSurname}`} src={profile.profilePicture} size="small" />
      <span>{profile.name} {profile.firstSurname}</span><small>@{profile.handleName}</small>
    </div>}
    <ProfileTabs />
    {error && <Alert tone="danger">{error}</Alert>}
    {isLoading && <p role="status">Cargando tu configuración de visibilidad…</p>}
    {!isLoading && !profile && <Button variant="secondary" onClick={settings.retry}>Reintentar</Button>}
    {!isLoading && profile && <>
      <div className="visibility-columns"><div>
        {groups.map(group => {
          const records = draft.filter(record => group.types.includes(record.type));
          return <section className="visibility-group" key={group.title}>
            <h3>{group.title}</h3>
            {!records.length && <p className="flow-copy">No tienes datos configurados en esta sección.</p>}
            {records.map(record => {
              const key = visibilityKey(record);
              const value = visibilityValue(record, profile);
              return <div className="visibility-row" key={key}>
                <span>{labels[record.type]}</span><p>{value}</p>
                <small className={record.visible ? 'is-public' : ''}>{record.visible ? 'Público' : 'Solo yo'}</small>
                <span className="visibility-toggle"><Switch label={`${labels[record.type]}: ${value}, público`}
                  checked={record.visible} disabled={isSaving} onChange={() => settings.toggle(key)} /></span>
              </div>;
            })}
          </section>;
        })}
      </div><aside className="visibility-aside">
        <section><p className="ui-eyebrow">TU IDENTIDAD PÚBLICA</p><h2>Siempre visibles.</h2>
          <p>Estos datos identifican tu perfil cuando el enlace público está activo.</p>
          <ul>{['Nombre de usuario', 'Nombre', 'Primer apellido', 'Fotografía de perfil'].map(label => <li key={label}><FiLock />{label}</li>)}</ul>
        </section>
        <section><h3>Tu información, a tu manera.</h3><p>Elige por separado qué correos, teléfonos, experiencias y enlaces quieres compartir.</p></section>
      </aside></div>
      <footer className="visibility-save">
        <p role="status">{hasPendingChanges ? 'Tienes cambios pendientes de guardar.' : message || 'No hay cambios pendientes.'}</p>
        <Button variant="secondary" disabled={isSaving || !hasPendingChanges} onClick={settings.discard}>Descartar cambios</Button>
        <Button leadingIcon={<FiCheck />} disabled={isSaving || !hasPendingChanges} onClick={save}>{isSaving ? 'Guardando…' : 'Guardar cambios'}</Button>
      </footer>
    </>}
  </MemberShell>;
}
