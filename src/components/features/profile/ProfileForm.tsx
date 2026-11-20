
import { useEffect, useRef, useState, type FormEvent } from 'react';
import { FiPlus, FiTrash2, FiUpload } from 'react-icons/fi';
import { Alert, Avatar, Button, Input, Select } from '../../ui';
import {
  countries as phoneCountries,
  describePhoneDigits,
  findCountryByCode,
} from '../../../constants/countries';
import type { Profile } from '../../../types/profile-response.types';
import type { UpdateProfilePayload } from '../../../types/profile';

type EditablePhone = NonNullable<UpdateProfilePayload['phones']>[number] & {
  clientKey: string;
};

type EditableEmail = NonNullable<UpdateProfilePayload['contactEmails']>[number] & {
  clientKey: string;
};

type EditableAddress = NonNullable<UpdateProfilePayload['addresses']>[number] & {
  clientKey: string;
};

type EditableLink = NonNullable<UpdateProfilePayload['links']>[number] & {
  clientKey: string;
};

type EditableCountry = NonNullable<UpdateProfilePayload['countries']>[number] & {
  clientKey: string;
};

function createClientKey() {
  return crypto.randomUUID();
}

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

function getPhoneError(phone: EditablePhone) {
  const number = phone.phoneNumber.trim();
  if (!number) return 'El número de teléfono es obligatorio.';

  const country = findCountryByCode(phone.countryCode);
  if (!country) return 'Selecciona un código de país.';
  if (!/^\d+$/.test(number)) return 'El teléfono debe contener solamente números.';

  const { minimum, maximum } = country.phoneDigits;
  if (number.length < minimum || number.length > maximum)
    return `${country.name} requiere ${describePhoneDigits(country)}.`;
  return '';
}

export function ProfileForm({
  id,
  profile,
  saving,
  onSave, }: ProfileFormProps) {
  const [name, setName] = useState(profile.name);
  const [firstSurname, setFirstSurname] = useState(profile.firstSurname);
  const [surname, setSurname] = useState(profile.surname?.surname ?? '');

  const [phones, setPhones] = useState<EditablePhone[]>(() =>
    profile.phones.map(phone => ({
      id: phone.id,
      clientKey: createClientKey(),
      phoneNumber: phone.phoneNumber,
      countryCode: phone.countryCode,
      visibility: phone.visible,
    }))
  );

  const [contactEmails, setContactEmails] = useState<EditableEmail[]>(() =>
    profile.contactEmails.map(email => ({
      id: email.id,
      clientKey: createClientKey(),
      email: email.email,
      visibility: email.visible,
    }))
  );

  const [addresses, setAddresses] = useState<EditableAddress[]>(() =>
    profile.addresses.map(address => ({
      id: address.id,
      clientKey: createClientKey(),
      address: address.address,
      visibility: address.visible,
    }))
  );

  const [countries, setCountries] = useState<EditableCountry[]>(() =>
    profile.countries.map(country => ({
      id: country.id,
      clientKey: createClientKey(),
      countryName: country.countryName,
      visibility: country.visible,
    }))
  );

  const [links, setLinks] = useState<EditableLink[]>(() =>
    profile.links.map(link => ({
      id: link.id,
      clientKey: createClientKey(),
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
    clientKey: string,
    field: 'phoneNumber' | 'countryCode',
    value: string
  ) {
    setPhones(current =>
      current.map(phone =>
        phone.clientKey === clientKey ? { ...phone, [field]: value } : phone
      )
    );
  }

  function updateEmail(clientKey: string, value: string) {
    setContactEmails(current =>
      current.map(email =>
        email.clientKey === clientKey ? { ...email, email: value } : email
      )
    );
  }

  function updateAddress(clientKey: string, value: string) {
    setAddresses(current =>
      current.map(address =>
        address.clientKey === clientKey ? { ...address, address: value } : address
      )
    );
  }

  function updateCountry(clientKey: string, value: string) {
    setCountries(current =>
      current.map(country =>
        country.id === clientKey ? { ...country, countryName: value } : country
      )
    );
  }

  function updateLink(
    clientKey: string,
    field: 'text' | 'url',
    value: string
  ) {
    setLinks(current =>
      current.map(link =>
        link.clientKey === clientKey ? { ...link, [field]: value } : link
      )
    );
  }

  function addPhone() {
    setPhones(current => [
      ...current,
      {
        clientKey: createClientKey(),
        phoneNumber: '',
        countryCode: '',
        visibility: true,
      },
    ]);
  }

  function removePhone(clientKey: string) {
    setPhones(current => current.filter(phone => phone.clientKey !== clientKey));
  }

  function addEmail() {
    setContactEmails(current => [
      ...current,
      {
        clientKey: createClientKey(),
        email: '',
        visibility: true,
      },
    ]);
  }

  function removeEmail(clientKey: string) {
    setContactEmails(current =>
      current.filter(email => email.clientKey !== clientKey)
    );
  }

  function addAddress() {
    setAddresses(current => [
      ...current,
      {
        clientKey: createClientKey(),
        address: '',
        visibility: true,
      },
    ]);
  }

  function removeAddress(clientKey: string) {
    setAddresses(current =>
      current.filter(address => address.clientKey !== clientKey)
    );
  }

  function addCountry() {
    setCountries(current => [
      ...current,
      {
        clientKey: createClientKey(),
        countryName: '',
        visibility: true,
      },
    ]);
  }

  function removeCountry(clientKey: string) {
    setCountries(current =>
      current.filter(country => country.clientKey !== clientKey)
    );
  }

  function addLink() {
    setLinks(current => [
      ...current,
      {
        clientKey: createClientKey(),
        text: '',
        url: '',
        visibility: true,
      },
    ]);
  }

  function removeLink(clientKey: string) {
    setLinks(current => current.filter(link => link.clientKey !== clientKey));
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

    const invalidPhone = phones.find(phone => getPhoneError(phone));

    if (invalidPhone) {
      setError(getPhoneError(invalidPhone));
      return;
    }

    try {
      const payload: UpdateProfilePayload = {
        name: name.trim(),
        firstSurname: firstSurname.trim(),
      };

      if (surname.trim()) {
        payload.surname = {
          surname: surname.trim(),
          visibility: profile.surname?.visible ?? true,
        };
      }

      payload.phones = phones.map(({ clientKey, ...phone }) => ({
        ...phone,
        phoneNumber: phone.phoneNumber.trim(),
        countryCode: phone.countryCode.trim(),
      }));

      payload.contactEmails = contactEmails.map(({ clientKey, ...email }) => ({
        ...email,
        email: email.email.trim(),
      }));

      payload.addresses = addresses.map(({ clientKey, ...address }) => ({
        ...address,
        address: address.address.trim(),
      }));

      payload.countries = countries.map(({ clientKey, ...country }) => ({
        ...country,
        countryName: country.countryName.trim(),
      }));

      payload.links = links.map(({ clientKey, ...link }) => ({
        ...link,
        text: link.text.trim(),
        url: link.url.trim(),
      }));

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
          hint={
            profile.surname
              ? 'Dejarlo vacío conserva el valor actual.'
              : 'Puedes agregar tu segundo apellido ahora.'
          }
          onChange={event => setSurname(event.target.value)}
        />
      </div>

      <section className="profile-contact-section">
        <div className="profile-repeat-heading">
          <h3>Países de residencia</h3>
          <Button
            type="button"
            size="small"
            variant="secondary"
            leadingIcon={<FiPlus />}
            disabled={saving}
            onClick={addCountry}
          >
            Agregar país
          </Button>
        </div>

        {countries.length > 0 ? (
          countries.map((country, index) => (
            <div key={country.clientKey} className="profile-repeat-item">
              <Input
                label={`País ${index + 1}`}
                required
                maxLength={100}
                value={country.countryName}
                disabled={saving}
                hint="Debe corresponder a un país existente en el catálogo."
                onChange={event =>
                  updateCountry(country.clientKey, event.target.value)
                }
              />

              <Button
                type="button"
                size="small"
                variant="danger"
                leadingIcon={<FiTrash2 />}
                disabled={saving}
                onClick={() => removeCountry(country.clientKey)}
              >
                Eliminar
              </Button>
            </div>
          ))
        ) : (
          <p className="flow-note">No tienes países registrados.</p>
        )}
      </section>

      <section className="profile-contact-section">
        <div className="profile-repeat-heading">
          <h3>Direcciones</h3>
          <Button
            type="button"
            size="small"
            variant="secondary"
            leadingIcon={<FiPlus />}
            disabled={saving}
            onClick={addAddress}
          >
            Agregar dirección
          </Button>
        </div>

        {addresses.length > 0 ? (
          addresses.map((address, index) => (
            <div key={address.clientKey} className="profile-repeat-item">
              <Input
                label={`Dirección ${index + 1}`}
                required
                maxLength={300}
                value={address.address}
                disabled={saving}
                onChange={event =>
                  updateAddress(address.clientKey, event.target.value)
                }
              />

              <Button
                type="button"
                size="small"
                variant="danger"
                leadingIcon={<FiTrash2 />}
                disabled={saving}
                onClick={() => removeAddress(address.clientKey)}
              >
                Eliminar
              </Button>
            </div>
          ))
        ) : (
          <p className="flow-note">No tienes direcciones registradas.</p>
        )}
      </section>

      <section className="profile-contact-section">
        <div className="profile-repeat-heading">
          <h3>Correos de contacto</h3>
          <Button
            type="button"
            size="small"
            variant="secondary"
            leadingIcon={<FiPlus />}
            disabled={saving}
            onClick={addEmail}
          >
            Agregar correo
          </Button>
        </div>

        {contactEmails.length > 0 ? (
          contactEmails.map((email, index) => (
            <div key={email.clientKey} className="profile-repeat-item">
              <Input
                label={`Correo de contacto ${index + 1}`}
                type="email"
                required
                maxLength={200}
                value={email.email}
                disabled={saving}
                onChange={event =>
                  updateEmail(email.clientKey, event.target.value)
                }
              />

              <Button
                type="button"
                size="small"
                variant="danger"
                leadingIcon={<FiTrash2 />}
                disabled={saving}
                onClick={() => removeEmail(email.clientKey)}
              >
                Eliminar
              </Button>
            </div>
          ))
        ) : (
          <p className="flow-note">No tienes correos de contacto registrados.</p>
        )}
      </section>

      <section className="profile-contact-section">
        <div className="profile-repeat-heading">
          <h3>Teléfonos</h3>
          <Button
            type="button"
            size="small"
            variant="secondary"
            leadingIcon={<FiPlus />}
            disabled={saving}
            onClick={addPhone}
          >
            Agregar teléfono
          </Button>
        </div>

        {phones.length > 0 ? (
          phones.map((phone, index) => {
            const country = findCountryByCode(phone.countryCode);
            const phoneError = getPhoneError(phone);

            return (
              <div key={phone.clientKey} className="profile-repeat-item">
                <div className="flow-fields">
                  <Select
                    label={`País y código telefónico ${index + 1}`}
                    required
                    value={phone.countryCode}
                    disabled={saving}
                    onChange={event =>
                      updatePhone(
                        phone.clientKey,
                        'countryCode',
                        event.target.value
                      )
                    }
                  >
                    <option value="">Selecciona un país</option>
                    {phoneCountries.map(countryOption => (
                      <option key={countryOption.code} value={countryOption.code}>
                        {countryOption.name} (+{countryOption.code})
                      </option>
                    ))}
                  </Select>

                  <Input
                    label={`Número de teléfono ${index + 1}`}
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={15}
                    value={phone.phoneNumber}
                    disabled={saving}
                    hint={
                      country
                        ? `Introduce ${describePhoneDigits(country)}.`
                        : 'Selecciona primero un país.'
                    }
                    error={phoneError || undefined}
                    onChange={event =>
                      updatePhone(
                        phone.clientKey,
                        'phoneNumber',
                        event.target.value.replace(/\D/g, '').slice(0, 15)
                      )
                    }
                  />
                </div>

                <Button
                  type="button"
                  size="small"
                  variant="danger"
                  leadingIcon={<FiTrash2 />}
                  disabled={saving}
                  onClick={() => removePhone(phone.clientKey)}
                >
                  Eliminar
                </Button>
              </div>
            );
          })
        ) : (
          <p className="flow-note">No tienes teléfonos registrados.</p>
        )}
      </section>

      <section className="profile-links-editor">
        <div className="profile-repeat-heading">
          <h3>Enlaces personales</h3>
          <Button
            type="button"
            size="small"
            variant="secondary"
            leadingIcon={<FiPlus />}
            disabled={saving}
            onClick={addLink}
          >
            Agregar enlace
          </Button>
        </div>

        {links.length > 0 ? (
          links.map((link, index) => (
            <div className="profile-link-editor" key={link.clientKey}>
              <Input
                label={`Nombre del enlace ${index + 1}`}
                required
                maxLength={150}
                value={link.text}
                disabled={saving}
                onChange={event =>
                  updateLink(link.clientKey, 'text', event.target.value)
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
                  updateLink(link.clientKey, 'url', event.target.value)
                }
              />

              <Button
                type="button"
                size="small"
                variant="danger"
                leadingIcon={<FiTrash2 />}
                disabled={saving}
                onClick={() => removeLink(link.clientKey)}
              >
                Eliminar
              </Button>
            </div>
          ))
        ) : (
          <p className="flow-note">No tienes enlaces personales registrados.</p>
        )}
      </section>
    </form>
  );
}