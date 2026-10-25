import Dropdown from './Dropdown';
import type { DropdownOption } from './Dropdown';

interface SelectFieldProps {
  label: string;
  name: string;
  value: string;
  options: DropdownOption[];
  onChange: (value: string) => void;
  placeholder?: string;
  isRequired?: boolean;
}

function SelectField({
  label,
  name,
  value,
  options,
  onChange,
  placeholder,
  isRequired = false,
}: SelectFieldProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={name} className="text-sm font-medium text-orbita-text">
        {label}
        {isRequired && (
          <span className="ml-0.5 text-orbita-error" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <Dropdown id={name} ariaLabel={label} value={value} options={options} onChange={onChange} placeholder={placeholder} />
    </div>
  );
}

export default SelectField;
