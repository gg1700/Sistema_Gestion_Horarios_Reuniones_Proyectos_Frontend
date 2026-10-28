import { useEffect, useState } from 'react';
import { useParams } from 'react-router';
import { getPublicProfile } from '../api/publicProfiles';
import type { PublicProfile } from '../types/profilePreview';

function usePublicProfile() {
  const { publicHandle } = useParams<{ publicHandle: string }>();

  const handleName = (publicHandle ?? '')
    .replace(/^@/, '')
    .toLowerCase();

  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    setProfile(null);
    setError(null);
    setIsLoading(true);

    getPublicProfile(handleName, controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setProfile(result);
        }
      })
      .catch((err: unknown) => {
        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : 'No se pudo consultar el perfil.',
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setIsLoading(false);
        }
      });

    return () => controller.abort();
  }, [handleName]);

  return {
    handleName,
    profile,
    isLoading,
    error,
  };
}

export default usePublicProfile;
