import { FiAlertCircle, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';
import ContactListHeader from './ContactListHeader';
import { countries, describePhoneDigits, findCountryByCode } from '../../../constants/countries';
import { maximumPhones } from '../../../constants/profile';
import type { PhoneFormItem } from '../../../types/profile';

interface PhonesEditorProps {
  phones: PhoneFormItem[];
  errors?: Record<string, string>;
  canAddPhone: boolean;
  onAdd: () => void;
  onUpdate: (phoneId: string, changes: Partial<PhoneFormItem>) => void;
  onRemove: (phoneId: string) => void;
}

function getPhonePlaceholder(countryCode: string) {
  const country = findCountryByCode(countryCode);
  return country ? describePhoneDigits(country) : 'Número';
}

function PhonesEditor({ phones, errors = {}, canAddPhone, onAdd, onUpdate, onRemove }: PhonesEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <ContactListHeader label="Teléfonos de contacto" count={phones.length} maximum={maximumPhones} />

      {phones.map((phone, index) => (
        <div key={phone.id} className="flex flex-col gap-1">
          <div className="flex gap-2">
            <select
              aria-label={`Código de país del teléfono ${index + 1}`}
              value={phone.countryCode}
              onChange={(event) => onUpdate(phone.id, { countryCode: event.target.value })}
              className="h-11 w-36 shrink-0 rounded-lg border border-orbita-outline bg-orbita-surface px-2 text-sm text-orbita-text focus:border-orbita-accent focus:outline-none sm:w-44"
            >
              {countries.map((country) => (
                <option key={country.code} value={country.code}>
                  +{country.code} {country.name}
                </option>
              ))}
            </select>
            <input
              type="tel"
              inputMode="numeric"
              aria-label={`Número de teléfono ${index + 1}`}
              value={phone.number}
              onChange={(event) => onUpdate(phone.id, { number: event.target.value.replace(/\D/g, '') })}
              placeholder={getPhonePlaceholder(phone.countryCode)}
              maxLength={15}
              className={`h-11 w-full min-w-0 rounded-lg border bg-orbita-surface px-3 text-sm text-orbita-text placeholder:text-orbita-disabled focus:outline-none ${
                errors[phone.id] ? 'border-orbita-error' : 'border-orbita-outline focus:border-orbita-accent'
              }`}
            />
            {phones.length > 1 && (
              <IconButton
                label="Eliminar teléfono"
                icon={<FiTrash2 />}
                onClick={() => onRemove(phone.id)}
                variant="danger"
                size="medium"
              />
            )}
          </div>
          {errors[phone.id] && (
            <p className="flex items-center gap-1.5 text-xs text-orbita-error">
              <FiAlertCircle aria-hidden="true" />
              {errors[phone.id]}
            </p>
          )}
        </div>
      ))}

      {canAddPhone && (
        <Button variant="link" onClick={onAdd} leftIcon={<FiPlus />}>
          Agregar otro teléfono
        </Button>
      )}
    </div>
  );
}

export default PhonesEditor;
