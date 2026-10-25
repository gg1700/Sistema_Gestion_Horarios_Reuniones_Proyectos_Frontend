import { FiAlertCircle, FiMail, FiPlus, FiTrash2 } from 'react-icons/fi';
import Button from '../../ui/Button';
import IconButton from '../../ui/IconButton';
import ContactListHeader from './ContactListHeader';
import { maximumContactEmails } from '../../../constants/profile';
import type { ContactEmailFormItem } from '../../../types/profile';

interface ContactEmailsEditorProps {
  contactEmails: ContactEmailFormItem[];
  errors?: Record<string, string>;
  canAddContactEmail: boolean;
  onAdd: () => void;
  onUpdate: (contactEmailId: string, email: string) => void;
  onRemove: (contactEmailId: string) => void;
}

function ContactEmailsEditor({
  contactEmails,
  errors = {},
  canAddContactEmail,
  onAdd,
  onUpdate,
  onRemove,
}: ContactEmailsEditorProps) {
  return (
    <div className="flex flex-col gap-2">
      <ContactListHeader label="Correos de respaldo" count={contactEmails.length} maximum={maximumContactEmails} />

      {contactEmails.map((contactEmail, index) => (
        <div key={contactEmail.id} className="flex flex-col gap-1">
          <div className="flex gap-2">
            <div
              className={`flex flex-1 items-center gap-2 rounded-lg border bg-orbita-surface px-3 ${
                errors[contactEmail.id] ? 'border-orbita-error' : 'border-orbita-outline focus-within:border-orbita-accent'
              }`}
            >
              <FiMail className="shrink-0 text-orbita-muted" aria-hidden="true" />
              <input
                type="email"
                aria-label={`Correo de respaldo ${index + 1}`}
                value={contactEmail.email}
                onChange={(event) => onUpdate(contactEmail.id, event.target.value)}
                placeholder="respaldo@ejemplo.com"
                maxLength={200}
                className="h-11 w-full bg-transparent text-sm text-orbita-text placeholder:text-orbita-disabled focus:outline-none"
              />
            </div>
            {contactEmails.length > 1 && (
              <IconButton
                label="Eliminar correo"
                icon={<FiTrash2 />}
                onClick={() => onRemove(contactEmail.id)}
                variant="danger"
                size="medium"
              />
            )}
          </div>
          {errors[contactEmail.id] && (
            <p className="flex items-center gap-1.5 text-xs text-orbita-error">
              <FiAlertCircle aria-hidden="true" />
              {errors[contactEmail.id]}
            </p>
          )}
        </div>
      ))}

      {canAddContactEmail && (
        <Button variant="link" onClick={onAdd} leftIcon={<FiPlus />}>
          Agregar otro correo
        </Button>
      )}
    </div>
  );
}

export default ContactEmailsEditor;
