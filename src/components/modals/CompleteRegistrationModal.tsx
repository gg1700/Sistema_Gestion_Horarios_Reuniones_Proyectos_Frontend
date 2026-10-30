import { FiAlertCircle, FiArrowRight, FiLink } from 'react-icons/fi';
import Modal from './Modal';
import ModalHeader from './ModalHeader';
import TextField from '../ui/TextField';
import RequiredFieldsNote from '../ui/RequiredFieldsNote';
import VerifiedAccount from '../features/register/VerifiedAccount';
import useRegisterForm from '../../hooks/useRegisterForm';
import type { RegisteredUser } from '../../types/auth';

const titleId = 'complete-registration-title';
const formId = 'complete-registration-form';

interface CompleteRegistrationModalProps {
  user: RegisteredUser;
  onClose: () => void;
}

function CompleteRegistrationModal({ user, onClose }: CompleteRegistrationModalProps) {
  const {
    values,
    isSubmitting,
    generalError,
    getFieldError,
    isFieldValid,
    handleChange,
    handleBlur,
    handleSubmit,
  } = useRegisterForm(user);

  const handlePreview = values.handleName.trim().toLowerCase() || 'tu-usuario';

  return (
    <Modal titleId={titleId} onClose={onClose}>
      <ModalHeader
        titleId={titleId}
        eyebrow="Primer acceso · Google o GitHub"
        title="Dale un nombre a tu espacio."
        onClose={onClose}
      />

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <VerifiedAccount email={user.email} />

        <p className="mt-5 text-xs leading-6 text-[#A7C4B1]">
          Confirma cómo aparecerás en Orbitia y elige tu nombre de usuario.
        </p>

        <form id={formId} onSubmit={handleSubmit} noValidate className="mt-5 flex flex-col gap-5">
          <RequiredFieldsNote />

          <div className="grid gap-[18px] sm:grid-cols-2">
            <TextField
              label="Nombre"
              name="name"
              value={values.name}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Marcos"
              autoComplete="given-name"
              maxLength={100}
              error={getFieldError('name')}
              isValid={isFieldValid('name')}
              isRequired
            />
            <TextField
              label="Primer apellido"
              name="firstSurname"
              value={values.firstSurname}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Morales"
              autoComplete="family-name"
              maxLength={100}
              error={getFieldError('firstSurname')}
              isValid={isFieldValid('firstSurname')}
              isRequired
            />
          </div>

          <TextField
            label="Nombre de usuario"
            name="handleName"
            value={values.handleName}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="tu-usuario"
            autoComplete="nickname"
            maxLength={50}
            helperText={`orbitia.app/${handlePreview} · 3 a 50 letras minúsculas, números o guiones`}
            error={getFieldError('handleName')}
            isValid={isFieldValid('handleName')}
            labelHint={isFieldValid('handleName') ? 'Formato válido' : undefined}
            isRequired
          />

          {generalError && (
            <p
              role="alert"
              className="flex items-start gap-2.5 rounded-control border border-ui-danger/30 bg-ui-danger-tint px-4 py-3 text-xs leading-5 text-ui-danger"
            >
              <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
              {generalError}
            </p>
          )}
        </form>

        <p className="mt-6 flex items-start gap-2.5 border-t border-ui-divider pt-5 text-[10px] leading-5 text-ui-moss">
          <FiLink className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
          El correo está asociado a la cuenta verificada. Podrás completar el resto de tu perfil y autorizar tus
          integraciones después.
        </p>
      </div>

      <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-ui-border px-5 py-[18px] sm:px-8">
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting}
          className="min-h-[3.25rem] flex-1 rounded-control border border-ui-field-border bg-ui-surface px-5 text-[11px] font-semibold text-ui-text transition-colors hover:border-ui-soft disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          Volver
        </button>
        <button
          type="submit"
          form={formId}
          disabled={isSubmitting}
          className="flex min-h-[3.25rem] flex-1 items-center justify-center gap-2.5 rounded-control bg-ui-mint px-5 text-[11px] font-semibold text-ui-ink transition-colors hover:bg-ui-mint-strong disabled:cursor-not-allowed disabled:opacity-50 sm:flex-none"
        >
          {isSubmitting ? 'Guardando...' : 'Crear mi perfil'}
          {!isSubmitting && <FiArrowRight className="h-[18px] w-[18px]" aria-hidden="true" />}
        </button>
      </footer>
    </Modal>
  );
}

export default CompleteRegistrationModal;
