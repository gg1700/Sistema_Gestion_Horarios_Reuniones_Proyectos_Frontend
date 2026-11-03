
import { useState, type FormEvent } from 'react';
import { FiCheck } from 'react-icons/fi';
import { Dialog } from '../../modals';
import { Alert, Button, Checkbox, Input, Textarea } from '../../ui';
import type { ProfileWorkExperience } from '../../../types/profile-response.types';
import type { UpdateWorkExperiencePayload } from '../../../api/profileApi';

interface ExperienceEditorProps {
  experience: ProfileWorkExperience;
  saving: boolean;
  onClose: () => void;
  onSave: (payload: UpdateWorkExperiencePayload) => Promise<void>;
}

function getToday() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function ExperienceEditor({
  experience,
  saving,
  onClose,
  onSave,
}: ExperienceEditorProps) {
  const [title, setTitle] = useState(experience.title);
  const [companyName, setCompanyName] = useState(
    experience.companyName ?? ''
  );
  const [startDate, setStartDate] = useState(experience.startDate);
  const [endDate, setEndDate] = useState(experience.endDate ?? '');
  const [description, setDescription] = useState(
    experience.description ?? ''
  );

  const [current, setCurrent] = useState(
    experience.endDate === null
  );

  const [error, setError] = useState('');

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (saving) return;

    setError('');

    const cleanTitle = title.trim();
    const cleanCompany = companyName.trim();
    const cleanDescription = description.trim();

    if (!cleanTitle) {
      setError('El cargo es obligatorio.');
      return;
    }

    if (cleanTitle.length > 100) {
      setError('El cargo no puede superar los 100 caracteres.');
      return;
    }

    if (!startDate) {
      setError('La fecha de inicio es obligatoria.');
      return;
    }

    if (startDate > getToday()) {
      setError('La fecha de inicio no puede ser futura.');
      return;
    }

    if (!current && !endDate) {
      setError('Selecciona una fecha de fin o marca que trabajas aquí actualmente.');
      return;
    }

    if (!current && endDate) {
      if (endDate > getToday()) {
        setError('La fecha de fin no puede ser futura.');
        return;
      }

      if (endDate <= startDate) {
        setError('La fecha de fin debe ser posterior a la fecha de inicio.');
        return;
      }
    }

    if (cleanCompany.length > 200) {
      setError('El nombre de la empresa no puede superar los 200 caracteres.');
      return;
    }

    if (cleanDescription.length > 200) {
      setError('La descripción no puede superar los 200 caracteres.');
      return;
    }

    // El backend actual no permite borrar estos textos
    // enviando una cadena vacía.
    if (experience.companyName && !cleanCompany) {
      setError(
        'El backend actual no permite eliminar el nombre de la empresa. Conserva el valor o solicita ese cambio en el backend.'
      );
      return;
    }

    if (experience.description && !cleanDescription) {
      setError(
        'El backend actual no permite eliminar la descripción. Conserva el valor o solicita ese cambio en el backend.'
      );
      return;
    }

    const payload: UpdateWorkExperiencePayload = {
      title: cleanTitle,
      startDate,
      endDate: current ? null : endDate || null,
    };

    // Los campos opcionales solo se envían si tienen contenido.
    if (cleanCompany) {
      payload.companyName = cleanCompany;
    }

    if (cleanDescription) {
      payload.description = cleanDescription;
    }

    try {
      await onSave(payload);
    } catch (failure) {
      setError(
        failure instanceof Error
          ? failure.message
          : 'No se pudo actualizar la experiencia laboral.'
      );
    }
  }

  return (
    <Dialog
      open
      onOpenChange={open => {
        if (!open && !saving) onClose();
      }}
      title="Editar experiencia."
      eyebrow="MI PERFIL / EXPERIENCIA"
      description="Actualiza los datos de este puesto. · * Campos obligatorios"
      className="experience-editor-dialog"
      dismissible={!saving}
      footer={
        <>
          <Button
            type="button"
            variant="secondary"
            disabled={saving}
            onClick={onClose}
          >
            Cancelar
          </Button>

          <Button
            type="submit"
            form="experience-form"
            leadingIcon={<FiCheck />}
            loading={saving}
          >
            Guardar cambios
          </Button>
        </>
      }
    >
      <form
        id="experience-form"
        className="flow-form profile-form"
        onSubmit={submit}
      >
        {error && <Alert tone="danger">{error}</Alert>}

        <div className="flow-fields">
          <Input
            label="Cargo"
            required
            autoFocus
            maxLength={100}
            value={title}
            disabled={saving}
            onChange={event => setTitle(event.target.value)}
          />

          <Input
            label="Empresa"
            maxLength={200}
            value={companyName}
            disabled={saving}
            onChange={event => setCompanyName(event.target.value)}
          />
        </div>

        <div className="flow-fields">
          <Input
            label="Fecha de inicio"
            required
            type="date"
            max={getToday()}
            value={startDate}
            disabled={saving}
            onChange={event => setStartDate(event.target.value)}
          />

          <Input
            label="Fecha de fin"
            type="date"
            required={!current}
            min={startDate || undefined}
            max={getToday()}
            disabled={current || saving}
            value={current ? '' : endDate}
            onChange={event => setEndDate(event.target.value)}
          />
        </div>

        <Checkbox
          label="Trabajo aquí actualmente"
          checked={current}
          disabled={saving}
          onChange={event => setCurrent(event.target.checked)}
        />

        <Textarea
          label="Descripción"
          maxLength={200}
          rows={4}
          value={description}
          disabled={saving}
          onChange={event => setDescription(event.target.value)}
          hint={`${description.length} / 200`}
        />
      </form>
    </Dialog>
  );
}
