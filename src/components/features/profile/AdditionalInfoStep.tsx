import type { ChangeEvent } from 'react';
import { FiMapPin } from 'react-icons/fi';
import TextField from '../../ui/TextField';
import SelectField from '../../ui/SelectField';
import ProfilePhotoPicker from './ProfilePhotoPicker';
import LinksEditor from './LinksEditor';
import ContactEmailsEditor from './ContactEmailsEditor';
import PhonesEditor from './PhonesEditor';
import { countries } from '../../../constants/countries';
import type useAdditionalInfoForm from '../../../hooks/useAdditionalInfoForm';
import type { AdditionalInfoField } from '../../../types/profile';

interface AdditionalInfoStepProps {
  form: ReturnType<typeof useAdditionalInfoForm>;
  initials: string;
}

const countryOptions = countries.map((country) => ({ value: country.name, label: country.name }));

function AdditionalInfoStep({ form, initials }: AdditionalInfoStepProps) {
  const { values, errors } = form;

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    form.updateField(event.target.name as AdditionalInfoField, event.target.value);
  }

  return (
    <div className="flex flex-col gap-6">
      <ProfilePhotoPicker photo={values.photo} initials={initials} error={errors.photo} onChange={form.updatePhoto} />

      <div className="grid gap-x-[18px] gap-y-5 sm:grid-cols-2">
        <TextField
          label="Segundo apellido"
          name="surname"
          value={values.surname}
          onChange={handleInputChange}
          placeholder="Gutiérrez"
          maxLength={100}
          error={errors.surname}
        />
        <SelectField
          label="País de residencia"
          name="countryName"
          value={values.countryName}
          options={countryOptions}
          onChange={(value) => form.updateField('countryName', value)}
          placeholder="Selecciona un país"
        />

        <ContactEmailsEditor
          contactEmails={values.contactEmails}
          errors={errors.contactEmails}
          canAddContactEmail={form.canAddContactEmail}
          onAdd={form.addContactEmail}
          onUpdate={form.updateContactEmail}
          onRemove={form.removeContactEmail}
        />
        <PhonesEditor
          phones={values.phones}
          errors={errors.phones}
          canAddPhone={form.canAddPhone}
          onAdd={form.addPhone}
          onUpdate={form.updatePhone}
          onRemove={form.removePhone}
        />

        <div className="sm:col-span-2">
          <TextField
            label="Dirección"
            name="address"
            value={values.address}
            onChange={handleInputChange}
            placeholder="Av. 6 de Agosto, La Paz"
            maxLength={300}
            leftIcon={<FiMapPin />}
            error={errors.address}
          />
        </div>
      </div>

      <LinksEditor
        links={values.links}
        errors={errors.links}
        canAddLink={form.canAddLink}
        onAdd={form.addLink}
        onUpdate={form.updateLink}
        onRemove={form.removeLink}
      />
    </div>
  );
}

export default AdditionalInfoStep;
