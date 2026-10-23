import type { ChangeEvent } from 'react';
import TextField from '../../ui/TextField';
import SelectField from '../../ui/SelectField';
import SectionCard from '../../ui/SectionCard';
import ProfilePhotoPicker from './ProfilePhotoPicker';
import LinksEditor from './LinksEditor';
import { countries } from '../../../constants/countries';
import type useAdditionalInfoForm from '../../../hooks/useAdditionalInfoForm';
import type { AdditionalInfoField } from '../../../types/profile';

interface AdditionalInfoStepProps {
  form: ReturnType<typeof useAdditionalInfoForm>;
}

const countryCodeOptions = countries.map((country) => ({
  value: country.code,
  label: `+${country.code} ${country.name}`,
}));

const countryOptions = countries.map((country) => ({ value: country.name, label: country.name }));

function AdditionalInfoStep({ form }: AdditionalInfoStepProps) {
  const { values, errors } = form;

  function handleInputChange(event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
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
          <TextField
            label="Correo de contacto"
            name="contactEmail"
            type="email"
            value={values.contactEmail}
            onChange={handleInputChange}
            placeholder="contacto@ejemplo.com"
            maxLength={200}
            error={errors.contactEmail}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-[180px_1fr]">
          <SelectField
            label="Código"
            name="phoneCountryCode"
            value={values.phoneCountryCode}
            options={countryCodeOptions}
            onChange={handleInputChange}
          />
          <TextField
            label="Teléfono"
            name="phoneNumber"
            type="tel"
            value={values.phoneNumber}
            onChange={handleInputChange}
            placeholder="71234567"
            maxLength={15}
            error={errors.phoneNumber}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="País de residencia"
            name="countryName"
            value={values.countryName}
            options={countryOptions}
            onChange={handleInputChange}
            placeholder="Selecciona un país"
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
        </div>
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
