export type OAuthProvider = 'google' | 'github';

export interface RegisterFormValues {
  handleName: string;
  name: string;
  firstSurname: string;
}

export type RegisterField = keyof RegisterFormValues;

export type RegisterFormErrors = Partial<Record<RegisterField, string>>;

export interface PendingRegistration {
  token: string;
  email: string;
  provider: OAuthProvider;
}

export interface RegisteredUser {
  id: string;
  handleName: string;
  name: string;
  firstSurname: string;
  email: string;
}

export interface Session {
  token: string;
  expiresIn: string;
}

export interface RegisterResponse {
  success: boolean;
  message: string;
  data: {
    user: RegisteredUser;
    session: Session;
  };
}
