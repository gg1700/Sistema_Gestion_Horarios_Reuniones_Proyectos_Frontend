import type { AdditionalInfoValues, WorkExperienceItem } from '../types/profile';
import { normalizeUrl } from './profileValidations';

function appendJson(formData: FormData, field: string, value: unknown) {
  formData.append(field, JSON.stringify(value));
}

export function buildAdditionalInfoFormData(
  additionalInfo: AdditionalInfoValues | null,
  workExperiences: WorkExperienceItem[]
) {
  const formData = new FormData();

  if (additionalInfo) {
    if (additionalInfo.surname.trim()) {
      appendJson(formData, 'surname', { surname: additionalInfo.surname.trim(), visibility: true });
    }
    const filledPhones = additionalInfo.phones.filter((phone) => phone.number.trim());
    if (filledPhones.length > 0) {
      appendJson(
        formData,
        'phones',
        filledPhones.map((phone) => ({ phoneNumber: phone.number.trim(), countryCode: phone.countryCode }))
      );
    }
    const filledContactEmails = additionalInfo.contactEmails.filter((contactEmail) => contactEmail.email.trim());
    if (filledContactEmails.length > 0) {
      appendJson(
        formData,
        'contactEmails',
        filledContactEmails.map((contactEmail) => ({ email: contactEmail.email.trim() }))
      );
    }
    if (additionalInfo.address.trim()) {
      appendJson(formData, 'addresses', [{ address: additionalInfo.address.trim() }]);
    }
    if (additionalInfo.countryName) {
      appendJson(formData, 'countries', [{ countryName: additionalInfo.countryName }]);
    }
    if (additionalInfo.links.length > 0) {
      appendJson(
        formData,
        'links',
        additionalInfo.links.map((link) => ({
          text: link.text.trim(),
          url: normalizeUrl(link.url),
          visibility: link.visibility,
        }))
      );
    }
    if (additionalInfo.photo) {
      formData.append('profilePicture', additionalInfo.photo);
    }
  }

  if (workExperiences.length > 0) {
    appendJson(
      formData,
      'workExperiences',
      workExperiences.map((workExperience) => ({
        title: workExperience.title.trim(),
        companyName: workExperience.companyName.trim(),
        description: workExperience.description.trim(),
        startDate: workExperience.startDate,
        endDate: workExperience.isCurrentJob ? '' : workExperience.endDate,
      }))
    );
  }
  return formData;
}

export function hasFormDataContent(formData: FormData) {
  return Array.from(formData.keys()).length > 0;
}
