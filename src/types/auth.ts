export interface RegisterFormValues {
  handleName: string;
  name: string;
  firstSurname: string;
  email: string;
  password: string;
}

export type RegisterField = keyof RegisterFormValues;

export type RegisterFormErrors = Partial<Record<RegisterField, string>>;

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
