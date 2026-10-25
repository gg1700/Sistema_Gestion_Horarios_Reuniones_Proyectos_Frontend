export interface LinkFormItem {
  id: string;
  text: string;
  url: string;
  visibility: boolean;
}

export interface PhoneFormItem {
  id: string;
  countryCode: string;
  number: string;
}

export interface ContactEmailFormItem {
  id: string;
  email: string;
}

export interface AdditionalInfoValues {
  surname: string;
  phones: PhoneFormItem[];
  contactEmails: ContactEmailFormItem[];
  address: string;
  countryName: string;
  links: LinkFormItem[];
  photo: File | null;
}

export type AdditionalInfoField = 'surname' | 'address' | 'countryName';

export interface LinkErrors {
  text?: string;
  url?: string;
}

export interface AdditionalInfoErrors {
  surname?: string;
  phones?: Record<string, string>;
  contactEmails?: Record<string, string>;
  address?: string;
  photo?: string;
  links?: Record<string, LinkErrors>;
}

export interface WorkExperienceValues {
  title: string;
  companyName: string;
  startDate: string;
  endDate: string;
  isCurrentJob: boolean;
  description: string;
}

export interface WorkExperienceItem extends WorkExperienceValues {
  id: string;
}

export type WorkExperienceErrors = Partial<Record<keyof WorkExperienceValues, string>>;

export interface PhoneDigitsRange {
  minimum: number;
  maximum: number;
}

export interface Country {
  name: string;
  code: string;
  phoneDigits: PhoneDigitsRange;
}

export interface CreateAdditionalInfoResponse {
  success: boolean;
  message: string;
}
