import { FiAlertCircle } from 'react-icons/fi';
import Modal from './Modal';
import ModalHeader from './ModalHeader';
import StepIndicator from '../ui/StepIndicator';
import ModalFooter from '../ui/ModalFooter';
import AdditionalInfoStep from '../features/profile/AdditionalInfoStep';
import WorkExperienceStep from '../features/profile/WorkExperienceStep';
import useCompleteProfile from '../../hooks/useCompleteProfile';
import useAdditionalInfoForm from '../../hooks/useAdditionalInfoForm';
import useWorkExperienceForm from '../../hooks/useWorkExperienceForm';

const titleId = 'complete-profile-title';
const stepNames = ['Información adicional', 'Experiencia laboral'];

interface CompleteProfileModalProps {
  initials: string;
}

function CompleteProfileModal({ initials }: CompleteProfileModalProps) {
  const completeProfile = useCompleteProfile();
  const additionalInfoForm = useAdditionalInfoForm();
  const workExperienceForm = useWorkExperienceForm();

  const isFirstStep = completeProfile.currentStep === 'additionalInfo';

  function handleContinue() {
    if (additionalInfoForm.isValid()) {
      completeProfile.goToWorkExperience(additionalInfoForm.values);
    }
  }

  function handleClose() {
    if (isFirstStep) {
      completeProfile.goToProfile();
      return;
    }
    completeProfile.finishProfile([]);
  }

  return (
    <Modal titleId={titleId} widthClassName="max-w-[54rem]">
      <StepIndicator steps={stepNames} currentStepIndex={isFirstStep ? 0 : 1} note="Opcional" />

      <ModalHeader
        titleId={titleId}
        title={isFirstStep ? 'Dale forma a tu perfil.' : 'Tu recorrido también conecta.'}
        description={
          isFirstStep
            ? 'Agrega los datos con los que quieres presentarte.'
            : 'Agrega tus experiencias y revisa cómo quedarán en tu perfil.'
        }
        onClose={handleClose}
      />

      <div className="ui-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        {isFirstStep ? (
          <AdditionalInfoStep form={additionalInfoForm} initials={initials} />
        ) : (
          <WorkExperienceStep form={workExperienceForm} />
        )}

        {completeProfile.submitError && (
          <p
            role="alert"
            className="mt-5 flex items-start gap-2.5 rounded-control border border-ui-danger/30 bg-ui-danger-tint px-4 py-3 text-xs leading-5 text-ui-danger"
          >
            <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
            {completeProfile.submitError}
          </p>
        )}
      </div>

      {isFirstStep ? (
        <ModalFooter
          skipLabel="Omitir este paso"
          confirmLabel="Guardar y continuar"
          onSkip={() => completeProfile.goToWorkExperience(null)}
          onConfirm={handleContinue}
        />
      ) : (
        <ModalFooter
          skipLabel="Completar más tarde"
          confirmLabel="Guardar e ir a mi perfil"
          onSkip={() => completeProfile.finishProfile([])}
          onConfirm={() => completeProfile.finishProfile(workExperienceForm.workExperiences)}
          onBack={completeProfile.goBackToAdditionalInfo}
          isLoading={completeProfile.isSubmitting}
        />
      )}
    </Modal>
  );
}

export default CompleteProfileModal;
