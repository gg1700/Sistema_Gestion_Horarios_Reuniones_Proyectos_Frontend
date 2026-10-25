import type { ChangeEvent } from 'react';
import TextField from '../../ui/TextField';
import SelectField from '../../ui/SelectField';
import SectionCard from '../../ui/SectionCard';
import ProfilePhotoPicker from './ProfilePhotoPicker';
import LinksEditor from './LinksEditor';
import ContactEmailsEditor from './ContactEmailsEditor';
import PhonesEditor from './PhonesEditor';
import { countries } from '../../../constants/countries';
import type useAdditionalInfoForm from '../../../hooks/useAdditionalInfoForm';
import type { AdditionalInfoField } from '../../../types/profile';

interface AdditionalInfoStepProps {
  form: ReturnType<typeof useAdditionalInfoForm>;
}

const countryOptions = countries.map((country) => ({ value: country.name, label: country.name }));

function AdditionalInfoStep({ form }: AdditionalInfoStepProps) {
  const { values, errors } = form;

  function handleInputChange(event: ChangeEvent<HTMLInputElement>) {
    form.updateField(event.target.name as AdditionalInfoField, event.target.value);
  }

  return (
    <div className="flex flex-col gap-6">
      <SectionCard title="Datos personales">
        <ProfilePhotoPicker photo={values.photo} error={errors.photo} onChange={form.updatePhoto} />

        <div className="grid gap-4 sm:grid-cols-2">
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
        </div>

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

        <TextField
          label="Dirección"
          name="address"
          value={values.address}
          onChange={handleInputChange}
          placeholder="Av. Principal #450"
          maxLength={300}
          error={errors.address}
        />
      </SectionCard>

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
