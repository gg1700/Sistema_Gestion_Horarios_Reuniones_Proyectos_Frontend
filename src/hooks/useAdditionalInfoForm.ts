import { useState } from 'react';
import { maximumContactEmails, maximumLinks, maximumPhones } from '../constants/profile';
import type {
  AdditionalInfoErrors,
  AdditionalInfoField,
  AdditionalInfoValues,
  ContactEmailFormItem,
  LinkFormItem,
  PhoneFormItem,
} from '../types/profile';
import { validateAdditionalInfo } from '../utils/profileValidations';

const defaultCountryCode = '591';

function createItemId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function createPhone(): PhoneFormItem {
  return { id: createItemId('phone'), countryCode: defaultCountryCode, number: '' };
}

function createContactEmail(): ContactEmailFormItem {
  return { id: createItemId('email'), email: '' };
}

function createEmptyAdditionalInfo(): AdditionalInfoValues {
  return {
    surname: '',
    phones: [createPhone()],
    contactEmails: [createContactEmail()],
    address: '',
    countryName: '',
    links: [],
    photo: null,
  };
}

function useAdditionalInfoForm() {
  const [values, setValues] = useState<AdditionalInfoValues>(createEmptyAdditionalInfo);
  const [hasTriedToSave, setHasTriedToSave] = useState(false);
  const errors: AdditionalInfoErrors = hasTriedToSave ? validateAdditionalInfo(values) : {};
  const canAddLink = values.links.length < maximumLinks;
  const canAddPhone = values.phones.length < maximumPhones;
  const canAddContactEmail = values.contactEmails.length < maximumContactEmails;

  function updateField(field: AdditionalInfoField, value: string) {
    setValues((previousValues) => ({ ...previousValues, [field]: value }));
  }

  function updatePhoto(photo: File | null) {
    setValues((previousValues) => ({ ...previousValues, photo: photo }));
  }

  function addPhone() {
    if (!canAddPhone) return;
    setValues((previousValues) => ({ ...previousValues, phones: [...previousValues.phones, createPhone()] }));
  }

  function updatePhone(phoneId: string, changes: Partial<PhoneFormItem>) {
    setValues((previousValues) => ({
      ...previousValues,
      phones: previousValues.phones.map((phone) => (phone.id === phoneId ? { ...phone, ...changes } : phone)),
    }));
  }

  function removePhone(phoneId: string) {
    setValues((previousValues) => ({
      ...previousValues,
      phones: previousValues.phones.filter((phone) => phone.id !== phoneId),
    }));
  }

  function addContactEmail() {
    if (!canAddContactEmail) return;
    setValues((previousValues) => ({
      ...previousValues,
      contactEmails: [...previousValues.contactEmails, createContactEmail()],
    }));
  }

  function updateContactEmail(contactEmailId: string, email: string) {
    setValues((previousValues) => ({
      ...previousValues,
      contactEmails: previousValues.contactEmails.map((contactEmail) =>
        contactEmail.id === contactEmailId ? { ...contactEmail, email: email } : contactEmail
      ),
    }));
  }

  function removeContactEmail(contactEmailId: string) {
    setValues((previousValues) => ({
      ...previousValues,
      contactEmails: previousValues.contactEmails.filter((contactEmail) => contactEmail.id !== contactEmailId),
    }));
  }

  function addLink() {
    if (!canAddLink) return;
    const newLink: LinkFormItem = { id: createItemId('link'), text: '', url: '', visibility: true };
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
    canAddPhone,
    canAddContactEmail,
    updateField,
    updatePhoto,
    addPhone,
    updatePhone,
    removePhone,
    addContactEmail,
    updateContactEmail,
    removeContactEmail,
    addLink,
    updateLink,
    removeLink,
    isValid,
  };
}

export default useAdditionalInfoForm;
