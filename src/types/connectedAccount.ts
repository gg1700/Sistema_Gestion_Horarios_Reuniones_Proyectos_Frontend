export type OAuthProvider = 'google' | 'github';

export type ConnectionStatus =
  | 'connected'
  | 'disconnected'
  | 'reconnectRequired';

export interface ConnectedAccount {
  provider: OAuthProvider;
  username: string | null;
  scopes: string[];
  status: ConnectionStatus;
}
