import { FiPlus } from 'react-icons/fi';
import ActionButton from '../../ui/ActionButton';

interface ContactListHeaderProps {
  label: string;
  canAdd: boolean;
  onAdd: () => void;
}

function ContactListHeader({ label, canAdd, onAdd }: ContactListHeaderProps) {
  return (
    <div className="flex min-h-8 items-center justify-between gap-3">
      <span className="text-xs font-medium text-ui-text">{label}</span>
      {canAdd && (
        <ActionButton variant="link" onClick={onAdd} leftIcon={<FiPlus />} className="text-[10px]">
          Agregar
        </ActionButton>
      )}
    </div>
  );
}

export default ContactListHeader;
