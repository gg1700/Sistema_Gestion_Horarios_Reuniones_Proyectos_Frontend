import { useState } from 'react';
import { createPortal } from 'react-dom';
import { FiAlertCircle } from 'react-icons/fi';
import BrandHeading from '../ui/BrandHeading';
import StepIndicator from '../ui/StepIndicator';
import ModalFooter from '../ui/ModalFooter';
import AdditionalInfoStep from '../features/profile/AdditionalInfoStep';
import WorkExperienceStep from '../features/profile/WorkExperienceStep';
import useCompleteProfile from '../../hooks/useCompleteProfile';
import useAdditionalInfoForm from '../../hooks/useAdditionalInfoForm';
import useWorkExperienceForm from '../../hooks/useWorkExperienceForm';

const stepNames = ['Información adicional', 'Experiencia laboral'];

function CompleteProfileModal() {
  const completeProfile = useCompleteProfile();
  const additionalInfoForm = useAdditionalInfoForm();
  const workExperienceForm = useWorkExperienceForm();
  const [draftWarning, setDraftWarning] = useState('');

  const isFirstStep = completeProfile.currentStep === 'additionalInfo';
  const modalRoot = document.getElementById('modal-root') ?? document.body;

  function handleContinue() {
    if (additionalInfoForm.isValid()) {
      completeProfile.goToWorkExperience(additionalInfoForm.values);
    }
  }

  function handleFinish() {
    if (workExperienceForm.hasUnsavedDraft()) {
      setDraftWarning('Tienes una experiencia sin guardar. Agrégala, guarda los cambios o vacía el formulario.');
      return;
    }
    setDraftWarning('');
    completeProfile.finishProfile(workExperienceForm.workExperiences);
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-body">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="complete-profile-title"
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-orbita-outline bg-orbita-modal text-orbita-text shadow-2xl"
      >
        <div className="border-b border-orbita-outline px-6 pt-6 pb-5 sm:px-8">
          <div id="complete-profile-title">
            <BrandHeading
              badge={isFirstStep ? 'Paso 1 de 2' : 'Paso 2 de 2'}
              title={isFirstStep ? 'Completa tu perfil' : 'Experiencia laboral'}
              description="Esta información es opcional. Puedes completarla luego desde tu perfil."
              isCompact
            />
          </div>
          <div className="mt-5">
            <StepIndicator steps={stepNames} currentStepIndex={isFirstStep ? 0 : 1} />
          </div>
        </div>

        <div className="orbita-scrollbar flex-1 overflow-y-auto px-6 py-6 sm:px-8">
          {isFirstStep ? (
            <AdditionalInfoStep form={additionalInfoForm} />
          ) : (
            <WorkExperienceStep form={workExperienceForm} />
          )}

          {(completeProfile.submitError || draftWarning) && (
            <p
              role="alert"
              className="mt-4 flex items-center gap-2 rounded-lg bg-orbita-error-tint px-3 py-2 text-sm text-orbita-error"
            >
              <FiAlertCircle aria-hidden="true" />
              {completeProfile.submitError || draftWarning}
            </p>
          )}
        </div>

        {isFirstStep ? (
          <ModalFooter
            skipLabel="Omitir"
            confirmLabel="Guardar y continuar"
            onSkip={() => completeProfile.goToWorkExperience(null)}
            onConfirm={handleContinue}
          />
        ) : (
          <ModalFooter
            skipLabel="Completar más tarde"
            confirmLabel="Guardar e ir a mi perfil"
            onSkip={() => completeProfile.finishProfile([])}
            onConfirm={handleFinish}
            onBack={completeProfile.goBackToAdditionalInfo}
            isLoading={completeProfile.isSubmitting}
          />
        )}
      </div>
    </div>,
    modalRoot
  );
}

export default CompleteProfileModal;
