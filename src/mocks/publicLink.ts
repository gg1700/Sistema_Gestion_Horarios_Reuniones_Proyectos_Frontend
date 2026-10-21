import type { PublicLink } from '../types/publicLink';

const reservedHandles = new Set([
  'admin',
  'api',
  'login',
  'public',
]);

const occupiedHandles = new Set([
  'mateo-dev',
  'ana-2026',
  'usuario-existente',
]);

export const handlePattern = /^[a-z0-9-]{3,50}$/;

export function isReservedHandle(handle: string): boolean {
  return reservedHandles.has(handle);
}

export function createMockPublicUrl(handle: string): string {
  return `${window.location.origin}/@${handle}`;
}

export function createMockPublicLink(): PublicLink {
  const handleName = 'demo-fv';

  return {
    handleName,
    url: createMockPublicUrl(handleName),
    publicLinkActive: false,
    allOptionalFieldsPrivate: true,
  };
}

export function waitMockRequest(delay = 350): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, delay);
  });
}

export async function checkMockHandleAvailability(
  handle: string,
  simulateError = false,
): Promise<boolean> {
  await waitMockRequest();

  if (simulateError) {
    throw new Error('No se pudo consultar la disponibilidad.');
  }

  return !occupiedHandles.has(handle);
}
