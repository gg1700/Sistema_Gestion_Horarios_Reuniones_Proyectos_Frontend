
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FiUpload } from 'react-icons/fi';
import { Alert, Avatar, Button, Input } from '../../ui';
import type { Profile } from '../../../types/profile-response.types';
import type { UpdateProfilePayload } from '../../../types/profile';

type EditablePhone = NonNullable<UpdateProfilePayload['phones']>[number];
type EditableEmail = NonNullable<UpdateProfilePayload['contactEmails']>[number];
type EditableAddress = NonNullable<UpdateProfilePayload['addresses']>[number];
type EditableLink = NonNullable<UpdateProfilePayload['links']>[number];
type EditableCountry = NonNullable<UpdateProfilePayload['countries']>[number];

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

export function ProfileForm({
  id,
  profile,
  saving,
  onSave,}: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [firstSurname, setFirstSurname] = useState(profile.firstSurname);
  const [surname, setSurname] = useState(profile.surname?.surname ?? '');

  const [phones, setPhones] = useState<EditablePhone[]>(() =>
    profile.phones.map(phone => ({
      id: phone.id,
      phoneNumber: phone.phoneNumber,
      countryCode: phone.countryCode,
      visibility: phone.visible,
    }))
  );

  const [contactEmails, setContactEmails] = useState<EditableEmail[]>(() =>
    profile.contactEmails.map(email => ({
      id: email.id,
      email: email.email,
      visibility: email.visible,
    }))
  );

  const [addresses, setAddresses] = useState<EditableAddress[]>(() =>
    profile.addresses.map(address => ({
      id: address.id,
      address: address.address,
      visibility: address.visible,
    }))
  );

  const [countries, setCountries] = useState<EditableCountry[]>(() =>
    profile.countries.map(country => ({
      id: country.id,
      countryName: country.countryName,
      visibility: country.visible,
    }))
  );

  const [links, setLinks] = useState<EditableLink[]>(() =>
    profile.links.map(link => ({
      id: link.id,
      text: link.text,
      url: link.url,
      visibility: link.visible,
    }))
  );

  const [profilePicture, setProfilePicture] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    profile.profilePicture
  );

  const [error, setError] = useState('');

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

  function updatePhone(
    id: string,
    field: 'phoneNumber' | 'countryCode',
    value: string
  ) {
    setPhones(current =>
      current.map(phone =>
        phone.id === id ? { ...phone, [field]: value } : phone
      )
    );
  }

  function updateEmail(id: string, value: string) {
    setContactEmails(current =>
      current.map(email =>
        email.id === id ? { ...email, email: value } : email
      )
    );
  }

  function updateAddress(id: string, value: string) {
    setAddresses(current =>
      current.map(address =>
        address.id === id ? { ...address, address: value } : address
      )
    );
  }

  function updateCountry(id: string, value: string) {
    setCountries(current =>
      current.map(country =>
        country.id === id ? { ...country, countryName: value } : country
      )
    );
  }

  function updateLink(
    id: string,
    field: 'text' | 'url',
    value: string
  ) {
    setLinks(current =>
      current.map(link =>
        link.id === id ? { ...link, [field]: value } : link
      )
    );
  }

  function selectProfilePicture(file?: File) {
    if (!file) return;

    if (
      !['image/jpeg', 'image/png'].includes(file.type) ||
      file.size > 2 * 1024 * 1024
    ) {
      setError('Selecciona una imagen JPG o PNG de hasta 2 MB.');

      if (fileRef.current) {
        fileRef.current.value = '';
      }

      return;
    }

    setProfilePicture(file);
    setError('');
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError('');

    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        firstSurname: firstSurname.trim(),
      };

      // El backend permite actualizar el segundo apellido.
      // Si queda vacío, omitimos el campo para no intentar eliminarlo.
      if (surname.trim()) {
        payload.surname = {
          surname: surname.trim(),
          visibility: profile.surname?.visible ?? true,
        };
      }

      // Solo mandamos listas que tengan elementos.
      // Cada elemento conserva su ID y visibilidad originales.
      if (phones.length > 0) {
        payload.phones = phones.map(phone => ({
          ...phone,
          phoneNumber: phone.phoneNumber.trim(),
          countryCode: phone.countryCode.trim(),
        }));
      }

      if (contactEmails.length > 0) {
        payload.contactEmails = contactEmails.map(email => ({
          ...email,
          email: email.email.trim(),
        }));
      }

      if (addresses.length > 0) {
        payload.addresses = addresses.map(address => ({
          ...address,
          address: address.address.trim(),
        }));
      }

      if (countries.length > 0) {
        payload.countries = countries.map(country => ({
          ...country,
          countryName: country.countryName.trim(),
        }));
      }

      if (links.length > 0) {
        payload.links = links.map(link => ({
          ...link,
          text: link.text.trim(),
          url: link.url.trim(),
        }));
      }

      await onSave({
        personalInfo: payload,
        profilePicture,
      });
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo actualizar la información.'
      );
    }
  }

  return (
    <form id={id} className="flow-form profile-form" onSubmit={submit}>
      {error && <Alert tone="danger">{error}</Alert>}

      <div className="profile-photo-editor">
        <Avatar
          name={`${name} ${firstSurname}`}
          src={photoPreview}
          size="large"
        />

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
          onChange={event =>
            selectProfilePicture(event.target.files?.[0])
          }
        />

        <Button
          type="button"
          variant="secondary"
          size="small"
          leadingIcon={<FiUpload />}
          disabled={saving}
          onClick={() => fileRef.current?.click()}
        >
          Cambiar imagen
        </Button>
      </div>

      <div className="flow-fields flow-fields--three">
        <Input
          label="Nombre"
          required
          maxLength={100}
          value={name}
          disabled={saving}
          onChange={event => setName(event.target.value)}
        />

        <Input
          label="Primer apellido"
          required
          maxLength={100}
          value={firstSurname}
          disabled={saving}
          onChange={event => setFirstSurname(event.target.value)}
        />

        <Input
          label="Segundo apellido"
          maxLength={100}
          value={surname}
          disabled={saving}
          hint="Dejarlo vacío conserva el valor actual."
          onChange={event => setSurname(event.target.value)}
        />
      </div>

      <section className="profile-contact-section">
        <h3>Países de residencia</h3>

        {countries.length > 0 ? (
          countries.map((country, index) => (
            <Input
              key={country.id}
              label={`País ${index + 1}`}
              required
              maxLength={100}
              value={country.countryName}
              disabled={saving}
              hint="Debe corresponder a un país existente en el catálogo."
              onChange={event =>
                updateCountry(country.id, event.target.value)
              }
            />
          ))
        ) : (
          <p className="flow-note">No tienes países registrados.</p>
        )}
      </section>

      <section className="profile-contact-section">
        <h3>Direcciones</h3>

        {addresses.length > 0 ? (
          addresses.map((address, index) => (
            <Input
              key={address.id}
              label={`Dirección ${index + 1}`}
              required
              maxLength={300}
              value={address.address}
              disabled={saving}
              onChange={event =>
                updateAddress(address.id, event.target.value)
              }
            />
          ))
        ) : (
          <p className="flow-note">No tienes direcciones registradas.</p>
        )}
      </section>

      <section className="profile-contact-section">
        <h3>Correos de contacto</h3>

        {contactEmails.length > 0 ? (
          contactEmails.map((email, index) => (
            <Input
              key={email.id}
              label={`Correo de contacto ${index + 1}`}
              type="email"
              required
              maxLength={200}
              value={email.email}
              disabled={saving}
              onChange={event =>
                updateEmail(email.id, event.target.value)
              }
            />
          ))
        ) : (
          <p className="flow-note">No tienes correos de contacto registrados.</p>
        )}
      </section>

      <section className="profile-contact-section">
        <h3>Teléfonos</h3>

        {phones.length > 0 ? (
          phones.map((phone, index) => (
            <div className="flow-fields" key={phone.id}>
              <Input
                label={`Código de país ${index + 1} (sin +)`}
                required
                maxLength={3}
                pattern="[1-9][0-9]{0,2}"
                value={phone.countryCode}
                disabled={saving}
                onChange={event =>
                  updatePhone(phone.id, 'countryCode', event.target.value)
                }
              />

              <Input
                label={`Número de teléfono ${index + 1}`}
                type="tel"
                required
                maxLength={15}
                pattern="[0-9]{6,15}"
                value={phone.phoneNumber}
                disabled={saving}
                onChange={event =>
                  updatePhone(phone.id, 'phoneNumber', event.target.value)
                }
              />
            </div>
          ))
        ) : (
          <p className="flow-note">No tienes teléfonos registrados.</p>
        )}
      </section>

      <section className="profile-links-editor">
        <div className="profile-repeat-heading">
          <h3>Enlaces personales</h3>
        </div>

        {links.length > 0 ? (
          links.map((link, index) => (
            <div className="profile-link-editor" key={link.id}>
              <Input
                label={`Nombre del enlace ${index + 1}`}
                required
                maxLength={150}
                value={link.text}
                disabled={saving}
                onChange={event =>
                  updateLink(link.id, 'text', event.target.value)
                }
              />

              <Input
                label="URL"
                type="text"
                required
                maxLength={2048}
                value={link.url}
                disabled={saving}
                onChange={event =>
                  updateLink(link.id, 'url', event.target.value)
                }
              />
            </div>
          ))
        ) : (
          <p className="flow-note">No tienes enlaces personales registrados.</p>
        )}
      </section>
    </form>
  );
}