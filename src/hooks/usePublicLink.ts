import { useEffect, useState } from 'react';
import {
  checkMockHandleAvailability,
  createMockPublicLink,
  createMockPublicUrl,
  handlePattern,
  isReservedHandle,
  waitMockRequest,
} from '../mocks/publicLink';
import type {
  HandleAvailability,
  PublicLink,
} from '../types/publicLink';

function usePublicLink() {
  const [publicLink, setPublicLink] = useState<PublicLink>(
    createMockPublicLink,
  );

  const [draftHandle, setDraftHandle] = useState(
    publicLink.handleName,
  );

  const [availability, setAvailability] =
    useState<HandleAvailability>('unchanged');

  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');
  const [simulateServerError, setSimulateServerError] =
    useState(false);

  useEffect(() => {
    if (draftHandle === publicLink.handleName) {
      setAvailability('unchanged');
      return;
    }

    if (!handlePattern.test(draftHandle)) {
      setAvailability('invalid');
      return;
    }

    if (isReservedHandle(draftHandle)) {
      setAvailability('reserved');
      return;
    }

    let cancelled = false;

    setAvailability('checking');

    const timeout = setTimeout(async () => {
      try {
        const available = await checkMockHandleAvailability(
          draftHandle,
          simulateServerError,
        );

        if (!cancelled) {
          setAvailability(available ? 'available' : 'taken');
        }
      } catch {
        if (!cancelled) {
          setAvailability('error');
        }
      }
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [
    draftHandle,
    publicLink.handleName,
    simulateServerError,
  ]);

  function updateDraftHandle(value: string) {
    setDraftHandle(value);
    setServerError('');
    setNotice('');
  }

  async function saveHandle(): Promise<boolean> {
    if (
      isSaving ||
      availability !== 'available' ||
      !handlePattern.test(draftHandle) ||
      isReservedHandle(draftHandle)
    ) {
      return false;
    }

    setIsSaving(true);
    setServerError('');

    try {
      const available = await checkMockHandleAvailability(
        draftHandle,
        simulateServerError,
      );

      if (!available) {
        setAvailability('taken');
        throw new Error('El identificador ya está ocupado.');
      }

      await waitMockRequest();

      const nextUrl = createMockPublicUrl(draftHandle);

      setPublicLink(current => ({
        ...current,
        handleName: draftHandle,
        url: nextUrl,
      }));

      setNotice(
        'Identificador actualizado en la simulación.',
      );

      return true;
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el enlace público.',
      );

      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function togglePublicLink() {
    if (isSaving) return;

    setIsSaving(true);
    setServerError('');
    setNotice('');

    try {
      await waitMockRequest();

      if (simulateServerError) {
        throw new Error(
          'No se pudo actualizar el estado del enlace.',
        );
      }

      setPublicLink(current => ({
        ...current,
        publicLinkActive: !current.publicLinkActive,
      }));

      setNotice(
        'Estado del enlace actualizado en la simulación.',
      );
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : 'Ocurrió un error del servidor.',
      );
    } finally {
      setIsSaving(false);
    }
  }

  function setOptionalFieldsPrivate(value: boolean) {
    setPublicLink(current => ({
      ...current,
      allOptionalFieldsPrivate: value,
    }));
  }

  return {
    publicLink,
    draftHandle,
    availability,
    isSaving,
    serverError,
    notice,
    simulateServerError,
    setSimulateServerError,
    updateDraftHandle,
    saveHandle,
    togglePublicLink,
    setOptionalFieldsPrivate,
  };
}

export default usePublicLink;
