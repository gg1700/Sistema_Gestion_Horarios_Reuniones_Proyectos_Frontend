import { FiCheck, FiCircle } from 'react-icons/fi';
import { getPasswordRequirements } from '../../../utils/registerValidations';

interface PasswordRequirementsProps {
  password: string;
}

function PasswordRequirements({ password }: PasswordRequirementsProps) {
  const requirements = getPasswordRequirements(password);

  return (
    <ul className="grid grid-cols-3 gap-2 rounded-lg border border-orbita-outline bg-orbita-background/60 p-3">
      {requirements.map((requirement) => (
        <li
          key={requirement.label}
          className={`flex items-center gap-1.5 text-xs ${
            requirement.isMet ? 'text-orbita-accent' : 'text-orbita-muted'
          }`}
        >
          {requirement.isMet ? <FiCheck aria-hidden="true" /> : <FiCircle aria-hidden="true" />}
          {requirement.label}
        </li>
      ))}
    </ul>
  );
}

export default PasswordRequirements;
