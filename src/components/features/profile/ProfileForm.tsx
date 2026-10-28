import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FiEye, FiMail, FiMapPin, FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { Alert, Avatar, Button, Input, Select } from '../../ui';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import type { ProfileDetails } from '../../../mocks/account';
import { newMockId } from '../../../utils/calendar';

export interface ProfileFormValue { name: string; firstSurname: string; details: ProfileDetails }

/*
CONTRATO BACKEND — FORMULARIO COMPARTIDO Y FOTO
Datos iniciales: GET /api/v1/profile (ProfilePage.tsx).
Guardar datos: PATCH /api/v1/profile (EditProfileDialog.tsx). En el primer ingreso
se omiten name/firstSurname porque ya están confirmados; los demás campos son opcionales.

PUT /api/v1/profile/photo — sesión del titular.
Request: multipart/form-data; campo "image" con un archivo JPG o PNG de hasta 2 MB.
No es JSON. El navegador genera Content-Type con boundary; no escribirlo a mano.
Enviar la foto al confirmar Guardar; elegir una imagen solo previsualiza el borrador.
Cancelar no debe enviar ni guardar cambios de imagen.
Respuesta JSON 200:
{ "data": { "imageUrl": "https://orbitia.app/media/profile/photo-1.png" } }
Usar imageUrl como details.image. DELETE /api/v1/profile/photo, sin body, responde 204
y vuelve al avatar de iniciales. Validar contenido real y tamaño en servidor.
413 archivo grande; 415 tipo no permitido; 401 sin sesión. Conservar foto anterior si falla.
El data URL y la previsualización actuales son solo mocks locales; no mandarlos en PATCH.
*/
export function ProfileForm({ id, includeIdentity = false, onSave }: { id: string; includeIdentity?: boolean; onSave: (value: ProfileFormValue) => void }) {
  const { state } = useMockFlow();
  const [name, setName] = useState(state.profile.name);
  const [firstSurname, setFirstSurname] = useState(state.profile.firstSurname);
  const [details, setDetails] = useState<ProfileDetails>(() => structuredClone(state.account.details));
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);
  const readerRef = useRef<FileReader | null>(null);
  useEffect(() => () => { readerRef.current?.abort(); }, []);

  function update<K extends keyof ProfileDetails>(key: K, value: ProfileDetails[K]) { setDetails(current => ({ ...current, [key]: value })); }
  function readImage(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) { setError('Elige una imagen JPG o PNG de hasta 2 MB.'); return; }
    readerRef.current?.abort();
    const reader = new FileReader();
    readerRef.current = reader;
    reader.onload = () => { if (typeof reader.result === 'string') update('image', reader.result); setError(''); };
    reader.onerror = () => setError('No se pudo leer la imagen.');
    reader.readAsDataURL(file);

  }
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      onSave({ name, firstSurname, details: { ...details,
        contactEmails: details.contactEmails.filter(email => email.value.trim()),
        phones: details.phones.filter(phone => phone.number.trim()),
        links: details.links.filter(link => link.label.trim() || link.url.trim()),
      } });
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa la información.'); }
  }
  return <form id={id} className="flow-form profile-form" onSubmit={submit}>
    {error && <Alert tone="danger">{error}</Alert>}
    <div className="profile-photo-editor"><Avatar name={`${name} ${firstSurname}`} src={details.image} size="large" /><div><h3>Foto de perfil</h3><p>JPG o PNG · máximo 2 MB</p></div>
      {details.image && <button type="button" className="flow-link" onClick={() => update('image', null)}>Quitar foto</button>}
      <input type="file" ref={fileRef} className="ui-sr-only" aria-label="Seleccionar imagen de perfil" accept="image/png,image/jpeg" onChange={event => readImage(event.target.files?.[0])} />
      <Button variant="secondary" size="small" leadingIcon={<FiUpload />} onClick={() => fileRef.current?.click()}>{includeIdentity ? 'Cambiar imagen' : 'Subir imagen'}</Button>
    </div>
    {includeIdentity ? <div className="flow-fields flow-fields--three"><Input label="Nombre" required value={name} maxLength={100} onChange={event => setName(event.target.value)} /><Input label="Primer apellido" required value={firstSurname} maxLength={100} onChange={event => setFirstSurname(event.target.value)} /><Input label="Segundo apellido" value={details.secondSurname} maxLength={100} onChange={event => update('secondSurname', event.target.value)} /></div> : null}
    <div className={`flow-fields ${includeIdentity ? 'profile-location-fields' : ''}`}>
      {!includeIdentity && <Input label="Segundo apellido" value={details.secondSurname} maxLength={100} onChange={event => update('secondSurname', event.target.value)} />}
      <Select label="País de residencia" value={details.country} onChange={event => update('country', event.target.value)}><option value="">Sin especificar</option>{['Bolivia', 'Argentina', 'Chile', 'Colombia', 'España', 'México', 'Perú'].map(country => <option key={country}>{country}</option>)}</Select>
      {includeIdentity && <Input label="Dirección" leadingContent={<FiMapPin />} value={details.address} maxLength={250} onChange={event => update('address', event.target.value)} />}
    </div>
    <div className="flow-fields profile-contact-fields"><div>
      <div className="profile-repeat-heading"><span>Correo de contacto</span><button type="button" onClick={() => update('contactEmails', [...details.contactEmails, { id: newMockId('email'), value: '' }])}><FiPlus />Agregar</button></div>
      {details.contactEmails.map((email, index) => <div className="profile-repeat-field" key={email.id}><Input label={`Correo de contacto ${index + 1}`} containerClassName="profile-label-sr-only" leadingContent={<FiMail />} type="email" value={email.value} onChange={event => update('contactEmails', details.contactEmails.map(item => item.id === email.id ? { ...item, value: event.target.value } : item))} /><button type="button" className="profile-small-action" aria-label={`Quitar correo ${index + 1}`} onClick={() => update('contactEmails', details.contactEmails.filter(item => item.id !== email.id))}><FiTrash2 /></button></div>)}
    </div><div><div className="profile-repeat-heading"><span>Teléfono</span><button type="button" onClick={() => update('phones', [...details.phones, { id: newMockId('phone'), code: '+591', number: '' }])}><FiPlus />Agregar</button></div>
      {details.phones.map((phone, index) => <div className="profile-repeat-field" key={phone.id}><Input label={`Teléfono ${index + 1}`} containerClassName="profile-label-sr-only" type="tel" inputMode="numeric" maxLength={15} value={phone.number} onChange={event => update('phones', details.phones.map(item => item.id === phone.id ? { ...item, number: event.target.value } : item))} leadingContent={<select aria-label={`Código de país del teléfono ${index + 1}`} className="profile-phone-code" value={phone.code} onChange={event => update('phones', details.phones.map(item => item.id === phone.id ? { ...item, code: event.target.value } : item))}>{['+591', '+54', '+56', '+57', '+51', '+52', '+34'].map(code => <option key={code}>{code}</option>)}</select>} /><button type="button" className="profile-small-action" aria-label={`Quitar teléfono ${index + 1}`} onClick={() => update('phones', details.phones.filter(item => item.id !== phone.id))}><FiTrash2 /></button></div>)}
    </div></div>
    {!includeIdentity && <Input label="Dirección" leadingContent={<FiMapPin />} value={details.address} maxLength={250} onChange={event => update('address', event.target.value)} />}
    <section className="profile-links-editor"><div className="profile-repeat-heading"><h3>Enlaces personales</h3><small>{details.links.length} de 5</small></div>
      {details.links.map((link, index) => <div className="profile-link-editor" key={link.id}><Input label={index === 0 ? 'Nombre del enlace' : `Nombre del enlace ${index + 1}`} maxLength={60} value={link.label} onChange={event => update('links', details.links.map(item => item.id === link.id ? { ...item, label: event.target.value } : item))} /><Input label="URL" value={link.url} onChange={event => update('links', details.links.map(item => item.id === link.id ? { ...item, url: event.target.value } : item))} /><button type="button" className="ui-icon-button" aria-label={`Quitar enlace ${link.label || index + 1}`} onClick={() => update('links', details.links.filter(item => item.id !== link.id))}><FiTrash2 /></button></div>)}
      <div className="profile-links-actions"><button type="button" className="flow-link" disabled={details.links.length >= 5} onClick={() => update('links', [...details.links, { id: newMockId('link'), label: '', url: '' }])}><FiPlus />Agregar enlace</button><span><FiEye />La visibilidad se configura en tu perfil.</span></div>
    </section>
  </form>;
}
