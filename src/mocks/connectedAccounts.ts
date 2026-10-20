import type { ConnectedAccount } from '../types/connectedAccount';

export const mockConnectedAccounts: ConnectedAccount[] = [
  {
    provider: 'google',
    username: 'cuenta.demo@ejemplo.com',
    scopes: ['openid', 'profile', 'email'],
    status: 'connected',
  },
  {
    provider: 'github',
    username: 'proyecto-demo',
    scopes: ['read:user', 'user:email'],
    status: 'connected',
  },
];
