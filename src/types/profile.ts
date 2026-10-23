export interface LinkFormItem {
  id: string;
  text: string;
  url: string;
  visibility: boolean;
}

export interface AdditionalInfoValues {
  surname: string;
  phoneCountryCode: string;
  phoneNumber: string;
  contactEmail: string;
  address: string;
  countryName: string;
  links: LinkFormItem[];
  photo: File | null;
}

export type AdditionalInfoField = Exclude<keyof AdditionalInfoValues, 'links' | 'photo'>;

export interface LinkErrors {
  text?: string;
  url?: string;
}

export interface AdditionalInfoErrors {
  surname?: string;
  phoneNumber?: string;
  contactEmail?: string;
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

export interface Country {
  name: string;
  code: string;
}

export interface CreateAdditionalInfoResponse {
  success: boolean;
  message: string;
}
