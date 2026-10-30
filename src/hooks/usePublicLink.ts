import { useEffect, useState } from 'react';
import {
  checkPublicHandle,
  getPublicLink,
  updatePublicLink,
} from '../api/publicLink';
import { getVisibility } from '../api/visibilityApi';
import { visibilityIsPublic } from '../utils/visibility';
import type {
  HandleAvailability,
  PublicLink,
} from '../types/publicLink';

const handlePattern = /^[a-z0-9-]{3,50}$/;
const reservedHandles = new Set([
  'admin',
  'api',
  'login',
  'public',
]);

const emptyPublicLink: PublicLink = {
  handleName: '',
  url: '',
  publicLinkActive: false,
  allOptionalFieldsPrivate: false,
};

function getErrorMessage(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback;
}

function usePublicLink() {
  const [publicLink, setPublicLink] = useState<PublicLink>(
    emptyPublicLink,
  );
  const [draftHandle, setDraftHandle] = useState('');
  const [availability, setAvailability] =
    useState<HandleAvailability>('unchanged');
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [serverError, setServerError] = useState('');
  const [notice, setNotice] = useState('');
  const [visibilityLoaded, setVisibilityLoaded] = useState(false);
  const [visibilityError, setVisibilityError] = useState('');

  useEffect(() => {
    let cancelled = false;

    getPublicLink()
      .then(data => {
        if (cancelled) return;

        setPublicLink(current => ({
          ...data,
          allOptionalFieldsPrivate:
            current.allOptionalFieldsPrivate,
        }));
        setDraftHandle(data.handleName);
        setIsLoaded(true);
      })
      .catch(error => {
        if (!cancelled) {
          setServerError(
            getErrorMessage(error, 'No se pudo cargar el enlace.'),
          );
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    getVisibility(controller.signal)
      .then(records => {
        if (controller.signal.aborted) return;

        const hasPublicOptionalField = records.some(record =>
          record.type !== 'repositories' &&
          record.type !== 'githubActivity' &&
          visibilityIsPublic(record, records)
        );

        setPublicLink(current => ({
          ...current,
          allOptionalFieldsPrivate: !hasPublicOptionalField,
        }));

        setVisibilityLoaded(true);
      })
      .catch(error => {
        if (controller.signal.aborted) return;

        setVisibilityError(
          getErrorMessage(
            error,
            'No se pudo consultar la visibilidad del perfil.',
          ),
        );
      });

    return () => {
      controller.abort();
    };
  }, []);

  useEffect(() => {
    if (!isLoaded || draftHandle === publicLink.handleName) {
      setAvailability('unchanged');
      return;
    }

    if (!handlePattern.test(draftHandle)) {
      setAvailability('invalid');
      return;
    }

    if (reservedHandles.has(draftHandle)) {
      setAvailability('reserved');
      return;
    }

    let cancelled = false;
    setAvailability('checking');

    const timeout = setTimeout(() => {
      checkPublicHandle(draftHandle)
        .then(result => {
          if (!cancelled) {
            setAvailability(
              result.available ? 'available' : 'taken',
            );
          }
        })
        .catch(() => {
          if (!cancelled) setAvailability('error');
        });
    }, 450);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [draftHandle, publicLink.handleName, isLoaded]);

  function updateDraftHandle(value: string) {
    setDraftHandle(value);
    setServerError('');
    setNotice('');
  }

  async function saveHandle(): Promise<boolean> {
    if (
      !isLoaded ||
      isSaving ||
      availability !== 'available' ||
      !handlePattern.test(draftHandle) ||
      reservedHandles.has(draftHandle)
    ) {
      return false;
    }

    setIsSaving(true);
    setServerError('');

    try {
      const availabilityResult =
        await checkPublicHandle(draftHandle);

      if (!availabilityResult.available) {
        setAvailability('taken');
        throw new Error('El identificador ya está ocupado.');
      }

      const updated = await updatePublicLink({
        handleName: draftHandle,
      });

      setPublicLink(current => ({
        ...updated,
        allOptionalFieldsPrivate:
          current.allOptionalFieldsPrivate,
      }));
      setDraftHandle(updated.handleName);
      setAvailability('unchanged');
      setNotice('Identificador actualizado correctamente.');

      return true;
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          'No se pudo actualizar el identificador.',
        ),
      );
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function togglePublicLink() {
    if (!isLoaded || isSaving) return;

    setIsSaving(true);
    setServerError('');
    setNotice('');

    try {
      const updated = await updatePublicLink({
        publicLinkActive: !publicLink.publicLinkActive,
      });

      setPublicLink(current => ({
        ...updated,
        allOptionalFieldsPrivate:
          current.allOptionalFieldsPrivate,
      }));

      setNotice('Estado del enlace actualizado correctamente.');
    } catch (error) {
      setServerError(
        getErrorMessage(
          error,
          'No se pudo actualizar el estado del enlace.',
        ),
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
    isLoaded,
    isSaving,
    serverError,
    notice,
    visibilityLoaded,
    visibilityError,
    updateDraftHandle,
    saveHandle,
    togglePublicLink,
    setOptionalFieldsPrivate,
  };
}

export default usePublicLink;
