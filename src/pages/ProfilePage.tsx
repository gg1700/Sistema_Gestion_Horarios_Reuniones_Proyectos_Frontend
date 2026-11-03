import { FiExternalLink, FiLink, FiLock, FiMail, FiPlus } from 'react-icons/fi';
import { MemberShell } from '../components/features/flows/FlowShell';
import { TextLink } from '../components/features/flows/FlowPrimitives';
import { ProfileTabs, WorkTimeline } from '../components/features/profile/ProfileParts';
import { Alert, Avatar, Button, OrbitalGraphic, ProviderIcon, SectionHeading } from '../components/ui';
import { useMemberIdentity } from '../features/github/MemberIdentityContext';
import { paths } from '../constants/paths';
import { useState } from 'react';
import { EditProfileDialog } from '../components/features/profile/EditProfileDialog';
import { ExperienceEditor } from '../components/features/profile/ExperienceEditor';
import { updateWorkExperience } from '../api/profileApi';
import { useUI } from '../contexts/UIContext';

export default function ProfilePage() {
  const member = useMemberIdentity();
  const profile = member?.profile;
  const [editing, setEditing] = useState(false);
  const [editingExperienceId, setEditingExperienceId] = useState<string | null>(null);
  const [savingExperience, setSavingExperience] = useState(false);

  const { notify } = useUI();

  if (!member) return <Alert tone="warning">No se pudo consultar tu perfil.</Alert>;
  if (!profile) return <MemberShell />;

  const fullName = [profile.name, profile.firstSurname, profile.surname?.surname].filter(Boolean).join(' ');
  const experiences = profile.workExperiences.map(item => ({
    ...item, company: item.companyName ?? '', description: item.description ?? '',
  }));
  const editingUnavailable = 'La edición del perfil aún no está conectada.';

  return <MemberShell>
    <SectionHeading title="Mi perfil" eyebrow="MI CUENTA" accentPeriod actions={<>
      <span className="profile-private-indicator"><FiLock />Vista privada</span>
      <Button variant="secondary" size="small" onClick={() => setEditing(true)}>Editar información</Button>
    </>} />
    <div className="profile-hero">
      <Avatar name={fullName || profile.handleName} src={profile.profilePicture} size="large" />
      <div><h2>{fullName || profile.handleName}</h2><p><span>@{profile.handleName}</span><i>·</i><FiMail />{profile.email || 'Sin especificar'}</p><small>Tu información personal y tus conexiones, en el mismo lugar.</small></div>
      <div className="profile-hero__orbit"><OrbitalGraphic /></div>
    </div>
    <ProfileTabs />
    <div className="private-profile-columns">
      <section>
        <div className="profile-section-head"><h3>Datos personales</h3></div>
        <dl className="profile-data-grid">
          <div><dt>Nombre</dt><dd>{profile.name || 'Sin especificar'}</dd></div>
          <div><dt>Primer apellido</dt><dd>{profile.firstSurname || 'Sin especificar'}</dd></div>
          <div><dt>Segundo apellido</dt><dd>{profile.surname?.surname || 'Sin especificar'}</dd></div>
          <div><dt>País de residencia</dt><dd>{profile.countries.length ? profile.countries.map(country => <p key={country.id}>{country.countryName}</p>) : 'Sin especificar'}</dd></div>
          <div className="profile-data-wide"><dt>Dirección</dt><dd>{profile.addresses.length ? profile.addresses.map(address => <p key={address.id}>{address.address}</p>) : 'Sin especificar'}</dd></div>
        </dl>
        <section className="profile-contact-section"><h3>Contacto</h3><div className="profile-contact-data">
          <div><h4>Correo de contacto</h4>{profile.contactEmails.length ? profile.contactEmails.map(email => <p key={email.id}>{email.email}</p>) : <p>Sin especificar</p>}</div>
          <div><h4>Teléfono</h4>{profile.phones.length ? profile.phones.map(phone => <p key={phone.id}>+{phone.countryCode} {phone.phoneNumber}</p>) : <p>Sin especificar</p>}</div>
        </div></section>
        <section className="profile-personal-links"><h3>Enlaces personales</h3>
          {profile.links.map(link => <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer"><FiLink /><strong>{link.text}</strong><span>{link.url.replace(/^https?:\/\//, '').replace(/\/$/, '')}</span><FiExternalLink /></a>)}
          {!profile.links.length && <p className="flow-note">Aún no agregaste enlaces personales.</p>}
        </section>
      </section>
      <aside>
        <div className="profile-section-head"><h3>Experiencia laboral</h3><small>Añadida por ti</small></div>
        {experiences.length ? (
          <WorkTimeline
            experiences={experiences}
            onEdit={setEditingExperienceId}
          />
        ) : (
          <p className="flow-note">
            Aún no agregaste experiencia laboral.
          </p>
        )}
        <button type="button" className="flow-link profile-add-experience" disabled title={editingUnavailable}><FiPlus />Agregar experiencia</button>
      </aside>
    </div>
    <div className="profile-connections-entry"><ProviderIcon provider="google" /><ProviderIcon provider="github" /><div><h3>Conecta tus herramientas a tu perfil.</h3><p>Gestiona Google Calendar y GitHub desde Conexiones.</p></div><TextLink to={paths.connections}>Ir a conexiones</TextLink></div>
    {editing && (
      <EditProfileDialog
        profile={profile}
        onClose={() => setEditing(false)}
      />
    )}
    {editingExperienceId && (() => {
      const selectedExperience = profile.workExperiences.find(
        experience => experience.id === editingExperienceId
      );

      if (!selectedExperience) return null;

      return (
        <ExperienceEditor
          experience={selectedExperience}
          saving={savingExperience}
          onClose={() => setEditingExperienceId(null)}
          onSave={handleSaveExperience}
        />
      );
    })()}
  </MemberShell>;

  async function handleSaveExperience(
    payload: Parameters<typeof updateWorkExperience>[1]
  ) {
    if (!editingExperienceId)
      throw new Error('No se seleccionó una experiencia laboral.');
    setSavingExperience(true);

    try {
      const result = await updateWorkExperience(editingExperienceId, payload);
      setEditingExperienceId(null);

      member!.retry();

      notify(
        result.message || 'Experiencia laboral actualizada correctamente.',
        'success'
      );
    } finally {
      setSavingExperience(false);
    }
  }
}