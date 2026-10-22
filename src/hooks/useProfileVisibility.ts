
import { useEffect, useState } from "react";
import {
  getProfileVisibility,
  saveProfileVisibility,
} from "../api/profileVisibilityApi";
import { defaultProfileVisibility } from "../constants/profileVisibility";
import type {
  ProfileVisibility,
  VisibilityFieldKey,
} from "../types/profileVisibility";

function useProfileVisibility() {
  const [visibility, setVisibility] = useState<ProfileVisibility>({
    ...defaultProfileVisibility,
  });
  const [savedVisibility, setSavedVisibility] = useState<ProfileVisibility>({
    ...defaultProfileVisibility,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  useEffect(() => {
    async function loadVisibility() {
      try {
        const data = await getProfileVisibility();
        setVisibility(data);
        setSavedVisibility(data);
      } catch {
        setError("No se pudo cargar la configuración de visibilidad.");
      } finally {
        setIsLoading(false);
      }
    }

    loadVisibility();
  }, []);

  const hasPendingChanges =
    JSON.stringify(visibility) !== JSON.stringify(savedVisibility);

  const visibleCount = Object.values(visibility).filter(Boolean).length;
  const hiddenCount = Object.keys(visibility).length - visibleCount;

  function toggleVisibility(key: VisibilityFieldKey) {
    setVisibility((previous) => ({
      ...previous,
      [key]: !previous[key],
    }));
    setMessage("");
    setError("");
  }

  async function saveChanges() {
    if (!hasPendingChanges || isSaving) {
      return;
    }

    setIsSaving(true);
    setError("");
    setMessage("");

    try {
      await saveProfileVisibility(visibility);
      setSavedVisibility({ ...visibility });
      setMessage("Los cambios de visibilidad se guardaron correctamente.");
    } catch {
      setError("No se pudieron guardar los cambios. Inténtalo nuevamente.");
    } finally {
      setIsSaving(false);
    }
  }

  return {
    visibility,
    isLoading,
    isSaving,
    error,
    message,
    hasPendingChanges,
    visibleCount,
    hiddenCount,
    toggleVisibility,
    saveChanges,
  };
}

export default useProfileVisibility;
