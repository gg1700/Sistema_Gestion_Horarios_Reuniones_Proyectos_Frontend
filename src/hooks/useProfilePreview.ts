
import { useEffect, useState } from "react";
import { getProfilePreview } from "../api/profilePreviewApi";
import type { PublicProfile } from "../types/profilePreview";

function useProfilePreview() {
  const [profile, setProfile] = useState<PublicProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadProfile() {
    setIsLoading(true);
    setError("");

    try {
      const data = await getProfilePreview();
      setProfile(data);
    } catch {
      setProfile(null);
      setError("No se pudo cargar la vista previa del perfil.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;

    async function loadInitialProfile() {
      try {
        const data = await getProfilePreview();

        if (active) {
          setProfile(data);
        }
      } catch {
        if (active) {
          setError("No se pudo cargar la vista previa del perfil.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    loadInitialProfile();

    return () => {
      active = false;
    };
  }, []);

  return {
    profile,
    isLoading,
    error,
    loadProfile,
  };
}

export default useProfilePreview;
