import { FiCheck, FiShield } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Button } from '../../ui';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { useUI } from '../../../contexts/UIContext';
import { ProfileForm } from './ProfileForm';

/*
CONTRATO BACKEND PROPUESTO — EDITAR INFORMACIÓN
PATCH /api/v1/profile — sesión obligatoria; solo el perfil del usuario autenticado.
Request JSON:
{
  "name": "Mateo Ignacio", "firstSurname": "Silva",
  "details": {
    "secondSurname": "Gutiérrez", "country": "Bolivia", "address": "Av. 6 de Agosto, La Paz",
    "contactEmails": [{ "id": "email-1", "value": "contacto@mateosilva.dev" }],
    "phones": [{ "id": "phone-1", "code": "+591", "number": "70123456" }],
    "links": [{ "id": "link-1", "label": "Portafolio", "url": "https://mateosilva.dev" }]
  }
}
Respuesta 204: sin cuerpo. Recargar GET /api/v1/profile, documentado en ProfilePage.tsx.
Nombre y primer apellido no pueden quedar vacíos. Los campos omitidos se conservan.
Un array enviado reemplaza esa lista; [] la vacía. Para altas se omite id y lo genera
el servidor. Máximo 5 enlaces, URL HTTP(S), correo válido y teléfono guardado como texto.
No aceptar email de acceso, handle ni fieldOrigins en este PATCH. Al personalizar un
valor importado, conservar su originalValue y provider. La foto tiene endpoint propio.
Errores: 401 sin sesión; 422 con errores por campo. Mantener abierto el formulario.
Ejemplo de error JSON 422:
{ "error": { "code": "VALIDATION_ERROR", "message": "Revisa los datos.", "fields": { "name": "El nombre es obligatorio." } } }
*/
export function EditProfileDialog({ onClose }: { onClose: () => void }) {
  const { dispatch } = useMockFlow();
  const { notify } = useUI();
  return <Dialog open onOpenChange={open => { if (!open) onClose(); }} title="Mantén tu perfil al día." eyebrow="MI PERFIL / INFORMACIÓN" description="Actualiza tus datos personales y de contacto. · * Campos obligatorios" size="large" className="edit-profile-dialog"
    footer={<><span className="profile-dialog-note"><FiShield />Tú decides qué información compartir.</span><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="edit-personal-info" leadingIcon={<FiCheck />}>Guardar cambios</Button></>}>
    <ProfileForm id="edit-personal-info" includeIdentity onSave={value => { dispatch({ type: 'update-profile', ...value }); onClose(); notify('Información actualizada.', 'success'); }} />
  </Dialog>;
}
