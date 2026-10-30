
import { defaultProfileVisibility } from "../constants/profileVisibility";
import type {
  ProfileVisibility,
  VisibilityFieldKey,
} from "../types/profileVisibility";

const storageKey = "orbita-profile-visibility-preview";

export async function getProfileVisibility(): Promise<ProfileVisibility> {
  const saved = localStorage.getItem(storageKey);

  if (!saved) {
    return { ...defaultProfileVisibility };
  }

  try {
    const parsed: unknown = JSON.parse(saved);

    if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
      return { ...defaultProfileVisibility };
    }

    const values = parsed as Record<string, unknown>;
    const visibility = { ...defaultProfileVisibility };

    for (const key of Object.keys(visibility) as VisibilityFieldKey[]) {
      if (typeof values[key] === "boolean") {
        visibility[key] = values[key];
      }
    }

    return visibility;
  } catch {
    return { ...defaultProfileVisibility };
  }
}

export async function saveProfileVisibility(
  visibility: ProfileVisibility
): Promise<void> {
  localStorage.setItem(storageKey, JSON.stringify(visibility));
}
