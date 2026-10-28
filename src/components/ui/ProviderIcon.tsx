import { FaGithub } from 'react-icons/fa';

export function ProviderIcon({ provider }: { provider: 'google' | 'github' }) {
  if (provider === 'github') return <FaGithub aria-hidden="true" />;
  return <svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true"><path fill="#4285F4" d="M21.8 12.2c0-.7-.1-1.4-.2-2H12v3.9h5.5a4.7 4.7 0 0 1-2 3.1v2.6h3.3c1.9-1.8 3-4.4 3-7.6Z" /><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.7-2.4l-3.3-2.6c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.2H3v2.7A10.1 10.1 0 0 0 12 22Z" /><path fill="#FBBC05" d="M6.4 13.8a6 6 0 0 1 0-3.6V7.5H3a10 10 0 0 0 0 9l3.4-2.7Z" /><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A9.7 9.7 0 0 0 12 2a10.1 10.1 0 0 0-9 5.5l3.4 2.7A5.9 5.9 0 0 1 12 6Z" /></svg>;
}
