import { useEffect, useMemo, useRef, useState, type FormEvent } from 'react';
import { FiMapPin } from 'react-icons/fi';

import { Alert, Avatar, Button } from '../../ui';
import TextField from '../../ui/TextField';
import SelectField from '../../ui/SelectField';
import PhonesEditor from './PhonesEditor';
import ContactEmailsEditor from './ContactEmailsEditor';
import LinksEditor from './LinksEditor';
import { countries as countryCatalog } from '../../../constants/countries';
import { maximumContactEmails, maximumLinks, maximumPhones } from '../../../constants/profile';
import { properNounPattern } from '../../../constants/validation';
import { normalizeUrl, validateAdditionalInfo } from '../../../utils/profileValidations';
import type { Profile } from '../../../types/profile-response.types';
import type {
  AdditionalInfoErrors,
  ContactEmailFormItem,
  LinkFormItem,
  PhoneFormItem,
  UpdateProfilePayload,
} from '../../../types/profile';

export interface ProfileFormValue {
  personalInfo: UpdateProfilePayload;
  profilePicture: File | null;
}

interface ProfileFormProps {
  id: string;
  profile: Profile;
  saving: boolean;
  onSave: (value: ProfileFormValue) => Promise<void>;
}

const NEW_PREFIX = 'nuevo-';
const defaultCountryCode = '591';
const countryOptions = countryCatalog.map(country => ({ value: country.name, label: country.name }));

function newId() {
  return `${NEW_PREFIX}${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

/** Los elementos creados en este formulario no tienen id real: se envían sin id para que se agreguen. */
function persistedId(id: string) {
  return id.startsWith(NEW_PREFIX) ? {} : { id };
}

function validateName(value: string, label: string) {
  const trimmed = value.trim();
  if (trimmed.length === 0) return `${label} es obligatorio.`;
  if (trimmed.length > 100 || !properNounPattern.test(trimmed)) {
    return 'Solo letras, espacios, apóstrofes o guiones.';
  }
  return undefined;
}

/**
 * Editar información usa los mismos campos y reglas que el registro: códigos de país
 * en lista con los dígitos de cada país, país de residencia del catálogo y listas en
 * las que se pueden agregar o quitar teléfonos, correos y enlaces.
 */
export function ProfileForm({ id, profile, saving, onSave }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [firstSurname, setFirstSurname] = useState(profile.firstSurname);
  const [surname, setSurname] = useState(profile.surname?.surname ?? '');

  const [phones, setPhones] = useState<PhoneFormItem[]>(() =>
    profile.phones.map(phone => ({ id: phone.id, countryCode: phone.countryCode, number: phone.phoneNumber })),
  );
  const [contactEmails, setContactEmails] = useState<ContactEmailFormItem[]>(() =>
    profile.contactEmails.map(email => ({ id: email.id, email: email.email })),
  );
  const [links, setLinks] = useState<LinkFormItem[]>(() =>
    profile.links.map(link => ({ id: link.id, text: link.text, url: link.url, visibility: link.visible })),
  );
  const [countryName, setCountryName] = useState(profile.countries[0]?.countryName ?? '');
  const [address, setAddress] = useState(profile.addresses[0]?.address ?? '');

  const visibilityById = useMemo(() => {
    const map = new Map<string, boolean>();
    for (const item of [...profile.phones, ...profile.contactEmails, ...profile.addresses, ...profile.countries]) {
      map.set(item.id, item.visible);
    }
    return map;
  }, [profile]);

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(profile.profilePicture);
  const [error, setError] = useState('');
  const [triedToSave, setTriedToSave] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!profilePicture) {
      setPhotoPreview(profile.profilePicture);
      return;
    }
    const objectUrl = URL.createObjectURL(profilePicture);
    setPhotoPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [profilePicture, profile.profilePicture]);

  const listErrors: AdditionalInfoErrors = validateAdditionalInfo({
    surname,
    phones,
    contactEmails,
    address,
    countryName,
    links,
    photo: null,
  });
  const nameError = validateName(name, 'El nombre');
  const firstSurnameError = validateName(firstSurname, 'El primer apellido');
  const hasErrors = Boolean(nameError || firstSurnameError || Object.keys(listErrors).length > 0);
  const errors = triedToSave ? listErrors : {};

  function selectProfilePicture(file?: File) {
    if (!file) return;
    if (!['image/jpeg', 'image/png'].includes(file.type) || file.size > 2 * 1024 * 1024) {
      setError('Selecciona una imagen JPG o PNG de hasta 2 MB.');
      if (fileRef.current) fileRef.current.value = '';
      return;
    }
    setProfilePicture(file);
    setError('');
  }

  function buildPayload(): UpdateProfilePayload {
    const payload: UpdateProfilePayload = {
      name: name.trim(),
      firstSurname: firstSurname.trim(),
    };

    if (surname.trim()) {
      payload.surname = { surname: surname.trim(), visibility: profile.surname?.visible ?? true };
    }

    // Las listas se envían completas: lo que se quitó aquí también se elimina del perfil.
    payload.phones = phones
      .filter(phone => phone.number.trim().length > 0)
      .map(phone => ({
        ...persistedId(phone.id),
        countryCode: phone.countryCode,
        phoneNumber: phone.number.trim(),
        visibility: visibilityById.get(phone.id) ?? true,
      }));

    payload.contactEmails = contactEmails
      .filter(email => email.email.trim().length > 0)
      .map(email => ({
        ...persistedId(email.id),
        email: email.email.trim(),
        visibility: visibilityById.get(email.id) ?? true,
      }));

    payload.links = links.map(link => ({
      ...persistedId(link.id),
      text: link.text.trim(),
      url: normalizeUrl(link.url),
      visibility: link.visibility,
    }));

    const [currentAddress, ...otherAddresses] = profile.addresses;
    payload.addresses = [
      ...(address.trim()
        ? [{
          ...(currentAddress ? { id: currentAddress.id } : {}),
          address: address.trim(),
          visibility: currentAddress?.visible ?? true,
        }]
        : []),
      ...otherAddresses.map(item => ({ id: item.id, address: item.address, visibility: item.visible })),
    ];

    const [currentCountry, ...otherCountries] = profile.countries;
    payload.countries = [
      ...(countryName
        ? [{
          ...(currentCountry ? { id: currentCountry.id } : {}),
          countryName,
          visibility: currentCountry?.visible ?? true,
        }]
        : []),
      ...otherCountries.map(item => ({ id: item.id, countryName: item.countryName, visibility: item.visible })),
    ];

    return payload;
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (saving) return;

    setTriedToSave(true);
    setError('');

    if (hasErrors) {
      setError('Revisa los campos marcados antes de guardar.');
      return;
    }

    try {
      await onSave({ personalInfo: buildPayload(), profilePicture });
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : 'No se pudo actualizar la información.');
    }
  }

  return (
    <form id={id} className="flow-form profile-form" onSubmit={submit} noValidate>
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="profile-photo-editor">
        <Avatar name={`${name} ${firstSurname}`} src={photoPreview} size="large" />

        <div>
          <h3>Foto de perfil</h3>
          <p>JPG o PNG · máximo 2 MB</p>
        </div>

        <input
          type="file"
          ref={fileRef}
          className="ui-sr-only"
          aria-label="Seleccionar imagen de perfil"
          accept="image/png,image/jpeg"
          disabled={saving}
          onChange={event => selectProfilePicture(event.target.files?.[0])}
        />

        <Button
          type="button"
          variant="secondary"
          size="small"
          disabled={saving}
          onClick={() => fileRef.current?.click()}
        >
          Cambiar imagen
        </Button>
      </div>

      <fieldset className="profile-form-grid" disabled={saving}>
        <div className="grid gap-x-[18px] gap-y-5 sm:grid-cols-3">
          <TextField
            label="Nombre"
            name="name"
            value={name}
            onChange={event => setName(event.target.value)}
            maxLength={100}
            isRequired
            error={triedToSave ? nameError : undefined}
          />
          <TextField
            label="Primer apellido"
            name="firstSurname"
            value={firstSurname}
            onChange={event => setFirstSurname(event.target.value)}
            maxLength={100}
            isRequired
            error={triedToSave ? firstSurnameError : undefined}
          />
          <TextField
            label="Segundo apellido"
            name="surname"
            value={surname}
            onChange={event => setSurname(event.target.value)}
            placeholder="Gutiérrez"
            maxLength={100}
            error={errors.surname}
            helperText={profile.surname ? 'Dejarlo vacío conserva el valor actual.' : undefined}
          />
        </div>

        <div className="grid gap-x-[18px] gap-y-5 sm:grid-cols-2">
          <SelectField
            label="País de residencia"
            name="countryName"
            value={countryName}
            options={countryOptions}
            onChange={setCountryName}
            placeholder="Selecciona un país"
          />

          <TextField
            label="Dirección"
            name="address"
            value={address}
            onChange={event => setAddress(event.target.value)}
            placeholder="Av. 6 de Agosto, La Paz"
            maxLength={300}
            leftIcon={<FiMapPin />}
            error={errors.address}
          />

          <ContactEmailsEditor
            contactEmails={contactEmails}
            errors={errors.contactEmails}
            canAddContactEmail={contactEmails.length < maximumContactEmails}
            onAdd={() => setContactEmails(current =>
              current.length < maximumContactEmails ? [...current, { id: newId(), email: '' }] : current)}
            onUpdate={(itemId, email) => setContactEmails(current =>
              current.map(item => (item.id === itemId ? { ...item, email } : item)))}
            onRemove={itemId => setContactEmails(current => current.filter(item => item.id !== itemId))}
          />

          <PhonesEditor
            phones={phones}
            errors={errors.phones}
            canAddPhone={phones.length < maximumPhones}
            onAdd={() => setPhones(current =>
              current.length < maximumPhones
                ? [...current, { id: newId(), countryCode: defaultCountryCode, number: '' }]
                : current)}
            onUpdate={(itemId, changes) => setPhones(current =>
              current.map(item => (item.id === itemId ? { ...item, ...changes } : item)))}
            onRemove={itemId => setPhones(current => current.filter(item => item.id !== itemId))}
          />
        </div>

        <LinksEditor
          links={links}
          errors={errors.links}
          canAddLink={links.length < maximumLinks}
          onAdd={() => setLinks(current =>
            current.length < maximumLinks
              ? [...current, { id: newId(), text: '', url: '', visibility: true }]
              : current)}
          onUpdate={(itemId, changes) => setLinks(current =>
            current.map(item => (item.id === itemId ? { ...item, ...changes } : item)))}
          onRemove={itemId => setLinks(current => current.filter(item => item.id !== itemId))}
        />
      </fieldset>
    </form>
  );
}
