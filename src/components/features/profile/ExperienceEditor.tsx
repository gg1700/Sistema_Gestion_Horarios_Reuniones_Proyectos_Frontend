import { useState, type FormEvent } from 'react';
import { FiCheck } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, Checkbox, Input, Textarea } from '../../ui';
import type { WorkExperience } from '../../../mocks/account';
import { newMockId } from '../../../utils/calendar';

/*
CONTRATO BACKEND PROPUESTO — AGREGAR / EDITAR EXPERIENCIA
Sesión obligatoria. El id de la URL debe pertenecer al perfil autenticado.
POST /api/v1/profile/work-experience (alta)
PATCH /api/v1/profile/work-experience/work-1 (edición)
Request JSON para ambos:
{ "title": "Desarrollador frontend", "company": "Nexo Digital", "startDate": "2024-03-01", "endDate": "2025-12-31", "description": "Desarrollo de interfaces web." }
Respuesta JSON 201 para POST / 200 para PATCH:
{ "data": { "id": "work-1", "title": "Desarrollador frontend", "company": "Nexo Digital", "startDate": "2024-03-01", "endDate": "2025-12-31", "description": "Desarrollo de interfaces web." } }
Llenado: agregar o sustituir el elemento por id; luego cerrar este modal.
Obligatorios: title y startDate. Fechas YYYY-MM-DD; endDate null significa trabajo
actual. Fin no anterior al inicio. Descripción hasta 200 caracteres; hasta 10 puestos.
En PATCH, los campos omitidos se conservan. 401 sin sesión; 404 puesto ajeno/inexistente;
422 validación: {"error":{"code":"VALIDATION_ERROR","message":"Revisa las fechas.","fields":{"endDate":"El fin debe ser posterior o igual al inicio."}}}
*/
export function ExperienceEditor({ experience, onClose, onSave }: { experience?: WorkExperience; onClose: () => void; onSave: (experience: WorkExperience) => void }) {
  const [draft, setDraft] = useState<WorkExperience>(() => experience ? { ...experience } : { id: newMockId('work'), title: '', company: '', startDate: '', endDate: null, description: '' });
  const [current, setCurrent] = useState(experience ? experience.endDate === null : false);
  const [error, setError] = useState('');
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try { onSave({ ...draft, endDate: current ? null : draft.endDate || null }); }
    catch (failure) { setError(failure instanceof Error ? failure.message : 'Revisa la experiencia.'); }
  }
  return <Dialog open onOpenChange={value => { if (!value) onClose(); }} title={experience ? 'Editar experiencia.' : 'Experiencia laboral.'} eyebrow="MI PERFIL / EXPERIENCIA" description={experience ? 'Actualiza los datos de este puesto. · * Campos obligatorios' : 'Completa los datos de esta experiencia. · * Campos obligatorios'} className="experience-editor-dialog"
    footer={<><Button variant="secondary" onClick={onClose}>Cancelar</Button><Button type="submit" form="experience-form" leadingIcon={<FiCheck />}>Guardar experiencia</Button></>}>
    <form id="experience-form" className="flow-form profile-form" onSubmit={submit}>{error && <Alert tone="danger">{error}</Alert>}
      <div className="flow-fields"><Input label="Cargo" required autoFocus maxLength={100} value={draft.title} onChange={event => setDraft({ ...draft, title: event.target.value })} /><Input label="Empresa" maxLength={100} value={draft.company} onChange={event => setDraft({ ...draft, company: event.target.value })} /></div>
      <div className="flow-fields"><Input label="Fecha de inicio" required type="date" value={draft.startDate} onChange={event => setDraft({ ...draft, startDate: event.target.value })} /><Input label="Fecha de fin" type="date" disabled={current} min={draft.startDate || undefined} value={current ? '' : draft.endDate ?? ''} onChange={event => setDraft({ ...draft, endDate: event.target.value })} /></div>
      <Checkbox label="Trabajo aquí actualmente" checked={current} onChange={event => setCurrent(event.target.checked)} />
      <Textarea label="Descripción" maxLength={200} rows={4} value={draft.description} onChange={event => setDraft({ ...draft, description: event.target.value })} hint={`${draft.description.length} / 200`} />
    </form>
  </Dialog>;
}
