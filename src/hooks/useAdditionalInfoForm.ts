import { useState } from 'react';
import { maximumLinks } from '../constants/profile';
import type {
  AdditionalInfoErrors,
  AdditionalInfoField,
  AdditionalInfoValues,
  LinkFormItem,
} from '../types/profile';
import { validateAdditionalInfo } from '../utils/profileValidations';

const emptyAdditionalInfo: AdditionalInfoValues = {
  surname: '',
  phoneCountryCode: '591',
  phoneNumber: '',
  contactEmail: '',
  address: '',
  countryName: '',
  links: [],
  photo: null,
};

function createLinkId() {
  return `link-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function useAdditionalInfoForm() {
  const [values, setValues] = useState<AdditionalInfoValues>(emptyAdditionalInfo);
  const [hasTriedToSave, setHasTriedToSave] = useState(false);
  const errors: AdditionalInfoErrors = hasTriedToSave ? validateAdditionalInfo(values) : {};
  const canAddLink = values.links.length < maximumLinks;

  function updateField(field: AdditionalInfoField, value: string) {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
  }

  function updatePhoto(photo: File | null) {
    setValues((previousValues) => ({ ...previousValues, photo: photo }));
  }

  function addLink() {
    if (!canAddLink) return;
    const newLink: LinkFormItem = { id: createLinkId(), text: '', url: '', visibility: true };
    setValues((previousValues) => ({ ...previousValues, links: [...previousValues.links, newLink] }));
  }

  function updateLink(linkId: string, changes: Partial<LinkFormItem>) {
    setValues((previousValues) => ({
      ...previousValues,
      links: previousValues.links.map((link) => (link.id === linkId ? { ...link, ...changes } : link)),
    }));
  }

  function removeLink(linkId: string) {
    setValues((previousValues) => ({
      ...previousValues,
      links: previousValues.links.filter((link) => link.id !== linkId),
    }));
  }

  function isValid() {
    setHasTriedToSave(true);
    return Object.keys(validateAdditionalInfo(values)).length === 0;
  }

  return {
    values,
    errors,
    canAddLink,
    updateField,
    updatePhoto,
    addLink,
    updateLink,
    removeLink,
    isValid,
  };
}

export default useAdditionalInfoForm;
