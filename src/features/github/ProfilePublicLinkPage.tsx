import { useState } from 'react';
import { FiCopy, FiExternalLink, FiLink } from 'react-icons/fi';
import { MemberShell } from '../../components/features/flows/FlowShell';
import { ProfileTabs } from '../../components/features/profile/ProfileParts';
import { Alert, Button, Input, SectionHeading, Switch } from '../../components/ui';
import { Dialog } from '../../components/modals';
import usePublicLink from '../../hooks/usePublicLink';

export default function ProfilePublicLinkPage() {
  const { publicLink, draftHandle, availability, isLoaded, isSaving, serverError, notice, updateDraftHandle, saveHandle, togglePublicLink } = usePublicLink();
  const [editing, setEditing] = useState(false);
  const [copyNotice, setCopyNotice] = useState('');
  async function copy() {
    try { await navigator.clipboard.writeText(publicLink.url); setCopyNotice('Enlace copiado.'); }
    catch { setCopyNotice('Selecciona y copia la dirección del enlace.'); }
  }
  return <MemberShell><SectionHeading title="Tu perfil tiene una dirección" eyebrow="MI CUENTA / PERFIL" accentPeriod /><ProfileTabs />
    {serverError && <Alert tone="danger">{serverError}</Alert>}{notice && <Alert tone="success">{notice}</Alert>}{copyNotice && <p role="status">{copyNotice}</p>}
    {!isLoaded && !serverError && <p role="status">Cargando enlace público…</p>}
    {isLoaded && <><div className="public-link-sharing"><div><h2>Compartir mi perfil</h2><p>Permite que otras personas consulten tu información pública.</p></div><span>{publicLink.publicLinkActive ? 'Enlace activo' : 'Enlace inactivo'}</span><Switch label="Compartir mi perfil" checked={publicLink.publicLinkActive} disabled={isSaving} onChange={() => void togglePublicLink()} /></div>
      <section className="public-link-address"><p className="ui-eyebrow">TU ENLACE ACTUAL</p><div><FiLink /><p>{publicLink.url}</p><Button variant="secondary" leadingIcon={<FiCopy />} disabled={!publicLink.publicLinkActive} onClick={copy}>Copiar enlace</Button></div>
      <a className="flow-link" href={publicLink.url} target="_blank" rel="noopener noreferrer">Ver mi perfil público <FiExternalLink /></a></section>
      <section className="public-link-identifier"><h2>Identificador del perfil</h2><p>@{publicLink.handleName}</p><Button variant="secondary" onClick={() => setEditing(true)}>Cambiar identificador</Button></section>
    </>}
    {editing && <Dialog open title="Cambia tu dirección pública." onOpenChange={open => { if (!open) setEditing(false); }} footer={<><Button variant="secondary" disabled={isSaving} onClick={() => setEditing(false)}>Cancelar</Button><Button loading={isSaving} disabled={availability !== 'available'} onClick={async () => { if (await saveHandle()) setEditing(false); }}>Guardar nuevo enlace</Button></>}>
      <Input label="Nuevo identificador" value={draftHandle} onChange={event => updateDraftHandle(event.target.value.toLowerCase())} hint={`Disponibilidad: ${availability}`} /><p>La dirección anterior dejará de estar disponible.</p>{serverError && <Alert tone="danger">{serverError}</Alert>}
    </Dialog>}
  </MemberShell>;
}
