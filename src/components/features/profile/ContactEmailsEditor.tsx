import { FiAlertCircle, FiMail, FiTrash2 } from 'react-icons/fi';
import IconButton from '../../ui/IconButton';
import ContactListHeader from './ContactListHeader';
import { fieldBoxClassName, getFieldBorderClassName } from '../../../utils/fieldClassNames';
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
    <div className="flex min-w-0 flex-col gap-2">
      <ContactListHeader label="Correo de contacto" canAdd={canAddContactEmail} onAdd={onAdd} />

      {contactEmails.map((contactEmail, index) => (
        <div key={contactEmail.id} className="flex flex-col gap-1.5">
          <div className="flex items-center gap-2">
            <div
              className={`flex min-w-0 flex-1 items-center gap-3 ${fieldBoxClassName} ${getFieldBorderClassName(
                Boolean(errors[contactEmail.id])
              )}`}
            >
              <FiMail className="shrink-0 text-ui-muted" aria-hidden="true" />
              <input
                type="email"
                aria-label={`Correo de contacto ${index + 1}`}
                value={contactEmail.email}
                onChange={(event) => onUpdate(contactEmail.id, event.target.value)}
                placeholder="contacto@ejemplo.com"
                maxLength={200}
                className="h-12 w-full min-w-0 bg-transparent placeholder:text-ui-soft focus:outline-none"
              />
            </div>
            <IconButton
              label="Eliminar correo"
              icon={<FiTrash2 />}
              onClick={() => onRemove(contactEmail.id)}
              variant="danger"
              size="medium"
            />
          </div>
          {errors[contactEmail.id] && (
            <p className="flex items-center gap-1.5 text-[11px] text-ui-danger">
              <FiAlertCircle aria-hidden="true" />
              {errors[contactEmail.id]}
            </p>
          )}
        </div>
      ))}
    </div>
  );
}

export default ContactEmailsEditor;
