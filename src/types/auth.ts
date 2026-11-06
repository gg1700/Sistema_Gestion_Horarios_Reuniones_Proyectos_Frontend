export type OAuthProvider = 'google' | 'github';

export interface RegisterFormValues {
  handleName: string;
  name: string;
  firstSurname: string;
}

export type RegisterField = keyof RegisterFormValues;

export type RegisterFormErrors = Partial<Record<RegisterField, string>>;

export interface RegisteredUser {
  id: string;
  handleName: string;
  name: string;
  firstSurname: string;
  email: string;
  registrationCompleted: boolean;
}

export interface RegistrationResponse {
  success: boolean;
  message: string;
  data: {
    user: RegisteredUser;
  };
}
