export type AuthProviderName = 'google' | 'github';
export interface SessionProfile {
  id: string; handleName: string; name: string; firstSurname: string;
  email: string; profilePicture: string | null; requiresProfileCompletion: boolean;
}
export interface LinkedIdentity {
  provider: AuthProviderName; username: string | null; email: string | null;
  state: string; scopes: string[];
}
export interface AuthSession {
  authenticated: true; profile: SessionProfile; accounts: LinkedIdentity[];
}
export interface GitHubConnection {
  connected: true; username: string;
  permissions: { canReadPublicRepositories: boolean; canReadPrivateRepositories: boolean };
  checkedAt: string;
}

