import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createAdditionalInfo } from '../api/profileApi';
import { routePaths } from '../constants/routes';
import { ApiError } from '../types/api';
import type { AdditionalInfoValues, WorkExperienceItem } from '../types/profile';
import { buildAdditionalInfoFormData, hasFormDataContent } from '../utils/profilePayload';

export type CompleteProfileStep = 'additionalInfo' | 'workExperience';

function useCompleteProfile() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<CompleteProfileStep>('additionalInfo');
  const [savedAdditionalInfo, setSavedAdditionalInfo] = useState<AdditionalInfoValues | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  function goToWorkExperience(additionalInfo: AdditionalInfoValues | null) {
    setSavedAdditionalInfo(additionalInfo);
    setSubmitError('');
    setCurrentStep('workExperience');
  }

  function goBackToAdditionalInfo() {
    setSubmitError('');
    setCurrentStep('additionalInfo');
  }

  function goToProfile() {
    navigate(routePaths.home);
  }

  async function finishProfile(workExperiences: WorkExperienceItem[]) {
    if (isSubmitting) return;
    const formData = buildAdditionalInfoFormData(savedAdditionalInfo, workExperiences);
    if (!hasFormDataContent(formData)) {
      goToProfile();
      return;
    }
    setIsSubmitting(true);
    setSubmitError('');
    try {
      await createAdditionalInfo(formData);
      goToProfile();
    } 
    catch (error) {
      if (error instanceof ApiError && error.statusCode === 401) {
        navigate(routePaths.register);
      } else if (error instanceof ApiError && error.statusCode === 409) {
        goToProfile();
      } else if (error instanceof ApiError) {
        setSubmitError(error.message);
      } else {
        setSubmitError('No se pudo guardar tu información. Intenta nuevamente.');
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  return {
    currentStep,
    isSubmitting,
    submitError,
    goToWorkExperience,
    goBackToAdditionalInfo,
    finishProfile,
    goToProfile,
  };
}

export default useCompleteProfile;
