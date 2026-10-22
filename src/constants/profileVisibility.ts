
import type {
  ProfileVisibility,
  VisibilityField,
} from "../types/profileVisibility";

export const visibilityFields: VisibilityField[] = [
  { key: "secondLastName", label: "Segundo apellido", category: "DATOS PERSONALES" },
  { key: "email", label: "Correo electrónico", category: "CONTACTO" },
  { key: "phone", label: "Teléfono", category: "CONTACTO" },
  { key: "country", label: "País", category: "UBICACIÓN" },
  { key: "address", label: "Dirección", category: "UBICACIÓN" },
  { key: "workExperience", label: "Experiencia laboral", category: "EXPERIENCIA" },
  { key: "professionalLinks", label: "Enlaces profesionales", category: "ENLACES" },
  { key: "repositories", label: "Repositorios", category: "GITHUB" },
  { key: "githubActivity", label: "Actividad de GitHub", category: "GITHUB" },
];

export const defaultProfileVisibility: ProfileVisibility = {
  secondLastName: false,
  email: false,
  phone: false,
  country: true,
  address: false,
  workExperience: true,
  professionalLinks: true,
  repositories: false,
  githubActivity: false,
};

export const permanentPublicFields = [
  "Nombre de usuario",
  "Nombre",
  "Primer apellido",
  "Fotografía de perfil",
];
