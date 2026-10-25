import { useState } from 'react';
import type { ChangeEvent } from 'react';
import { maximumWorkExperiences } from '../constants/profile';
import type { WorkExperienceErrors, WorkExperienceItem, WorkExperienceValues } from '../types/profile';
import { validateWorkExperience } from '../utils/profileValidations';

const emptyWorkExperience: WorkExperienceValues = {
  title: '',
  companyName: '',
  startDate: '',
  endDate: '',
  isCurrentJob: false,
  description: '',
};

type WorkExperienceTextField = Exclude<keyof WorkExperienceValues, 'isCurrentJob'>;

function createWorkExperienceId() {
  return `experience-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function useWorkExperienceForm() {
  const [workExperiences, setWorkExperiences] = useState<WorkExperienceItem[]>([]);
  const [draft, setDraft] = useState<WorkExperienceValues>(emptyWorkExperience);
  const [errors, setErrors] = useState<WorkExperienceErrors>({});
  const [editingId, setEditingId] = useState<string | null>(null);
  const isEditing = editingId !== null;
  const canAddWorkExperience = isEditing || workExperiences.length < maximumWorkExperiences;

  function updateDraftField(field: WorkExperienceTextField, value: string) {
    setDraft((previousDraft) => ({ ...previousDraft, [field]: value }));
    setErrors((previousErrors) => ({ ...previousErrors, [field]: undefined }));
  }

  function handleDraftChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    updateDraftField(event.target.name as WorkExperienceTextField, event.target.value);
  }

  function toggleCurrentJob() {
    setDraft((previousDraft) => ({
      ...previousDraft,
      isCurrentJob: !previousDraft.isCurrentJob,
      endDate: previousDraft.isCurrentJob ? previousDraft.endDate : '',
    }));
  }

  function resetDraft() {
    setDraft(emptyWorkExperience);
    setErrors({});
    setEditingId(null);
  }

  function saveWorkExperience() {
    if (!canAddWorkExperience) return;
    const draftErrors = validateWorkExperience(draft);
    setErrors(draftErrors);
    if (Object.keys(draftErrors).length > 0) return;
    if (isEditing) {
      setWorkExperiences((previousExperiences) =>
        previousExperiences.map((experience) =>
          experience.id === editingId ? { ...draft, id: experience.id } : experience
        )
      );
    } 
    else {
      setWorkExperiences((previousExperiences) => [
        ...previousExperiences,
        { ...draft, id: createWorkExperienceId() },
      ]);
    }
    resetDraft();
  }

  function editWorkExperience(workExperienceId: string) {
    const selectedExperience = workExperiences.find((experience) => experience.id === workExperienceId);
    if (!selectedExperience) return;
    const { id, ...experienceValues } = selectedExperience;
    setDraft(experienceValues);
    setErrors({});
    setEditingId(id);
  }

  function removeWorkExperience(workExperienceId: string) {
    setWorkExperiences((previousExperiences) =>
      previousExperiences.filter((experience) => experience.id !== workExperienceId)
    );
    if (editingId === workExperienceId) resetDraft();
  }

  function hasUnsavedDraft() {
    return draft.title.trim().length > 0 || draft.startDate.length > 0;
  }

  return {
    workExperiences,
    draft,
    errors,
    editingId,
    isEditing,
    canAddWorkExperience,
    handleDraftChange,
    updateDraftField,
    toggleCurrentJob,
    saveWorkExperience,
    cancelEditing: resetDraft,
    editWorkExperience,
    removeWorkExperience,
    hasUnsavedDraft,
  };
}

export default useWorkExperienceForm;
