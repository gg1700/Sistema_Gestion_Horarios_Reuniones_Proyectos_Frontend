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

export interface UpdateProfileSurname {
  surname: string;
  visibility: boolean;
}

export interface UpdateProfilePhone {
  /** Sin id: el elemento se agrega al perfil. */
  id?: string;
  phoneNumber: string;
  countryCode: string;
  visibility: boolean;
}

export interface UpdateProfileContactEmail {
  /** Sin id: el elemento se agrega al perfil. */
  id?: string;
  email: string;
  visibility: boolean;
}

export interface UpdateProfileAddress {
  /** Sin id: el elemento se agrega al perfil. */
  id?: string;
  address: string;
  visibility: boolean;
}

export interface UpdateProfileLink {
  /** Sin id: el elemento se agrega al perfil. */
  id?: string;
  text: string;
  url: string;
  visibility: boolean;
}

export interface UpdateProfileCountry {
  /** Sin id: el elemento se agrega al perfil. */
  id?: string;
  countryName: string;
  visibility: boolean;
}

export interface UpdateProfilePayload {
  name?: string;
  firstSurname?: string;
  surname?: UpdateProfileSurname;
  phones?: UpdateProfilePhone[];
  contactEmails?: UpdateProfileContactEmail[];
  addresses?: UpdateProfileAddress[];
  links?: UpdateProfileLink[];
  countries?: UpdateProfileCountry[];
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
}