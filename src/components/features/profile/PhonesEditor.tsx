import { FiAlertCircle, FiTrash2 } from 'react-icons/fi';
import IconButton from '../../ui/IconButton';
import Dropdown from '../../ui/Dropdown';
import ContactListHeader from './ContactListHeader';
import { countries, describePhoneDigits, findCountryByCode } from '../../../constants/countries';
import { fieldBoxClassName, getFieldBorderClassName } from '../../../utils/fieldClassNames';
import type { PhoneFormItem } from '../../../types/profile';

interface PhonesEditorProps {
  phones: PhoneFormItem[];
  errors?: Record<string, string>;
  canAddPhone: boolean;
  onAdd: () => void;
  onUpdate: (phoneId: string, changes: Partial<PhoneFormItem>) => void;
  onRemove: (phoneId: string) => void;
}

const defaultMaximumDigits = 15;

const countryCodeOptions = countries.map((country) => ({
  value: country.code,
  label: `+${country.code} ${country.name}`,
}));

function getPhonePlaceholder(countryCode: string) {
  const country = findCountryByCode(countryCode);
  return country ? describePhoneDigits(country) : 'Número';
}

function getMaximumDigits(countryCode: string) {
  return findCountryByCode(countryCode)?.phoneDigits.maximum ?? defaultMaximumDigits;
}

function keepAllowedDigits(value: string, countryCode: string) {
  return value.replace(/\D/g, '').slice(0, getMaximumDigits(countryCode));
}

function PhonesEditor({ phones, errors = {}, canAddPhone, onAdd, onUpdate, onRemove }: PhonesEditorProps) {
  return (
    <div className="flex min-w-0 flex-col gap-2">
      <ContactListHeader label="Teléfono" canAdd={canAddPhone} onAdd={onAdd} />

      {phones.map((phone, index) => (
        <div key={phone.id} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <Dropdown
              ariaLabel={`Código de país del teléfono ${index + 1}`}
              value={phone.countryCode}
              displayValue={`+${phone.countryCode}`}
              options={countryCodeOptions}
              onChange={(countryCode) =>
                onUpdate(phone.id, { countryCode: countryCode, number: keepAllowedDigits(phone.number, countryCode) })
              }
              className="w-24 shrink-0"
            />
            <input
              type="tel"
              inputMode="numeric"
              aria-label={`Número de teléfono ${index + 1}`}
              value={phone.number}
              onChange={(event) => onUpdate(phone.id, { number: keepAllowedDigits(event.target.value, phone.countryCode) })}
              placeholder={getPhonePlaceholder(phone.countryCode)}
              maxLength={getMaximumDigits(phone.countryCode)}
              className={`w-full min-w-0 ${fieldBoxClassName} ${getFieldBorderClassName(Boolean(errors[phone.id]))}`}
            />
            <IconButton
              label="Eliminar teléfono"
              icon={<FiTrash2 />}
              onClick={() => onRemove(phone.id)}
              variant="danger"
              size="medium"
            />
          </div>
          {errors[phone.id] && (
            <p className="flex items-center gap-1.5 text-[11px] text-ui-danger">
              <FiAlertCircle aria-hidden="true" />
              {errors[phone.id]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default PhonesEditor;
