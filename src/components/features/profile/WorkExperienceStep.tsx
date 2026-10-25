import { useEffect, useRef } from 'react';
import { FiAlertCircle, FiCheck, FiPlus } from 'react-icons/fi';
import TextField from '../../ui/TextField';
import SectionCard from '../../ui/SectionCard';
import Button from '../../ui/Button';
import RequiredFieldsNote from '../../ui/RequiredFieldsNote';
import WorkExperienceCard from './WorkExperienceCard';
import { descriptionMaximumLength, maximumWorkExperiences } from '../../../constants/profile';
import type useWorkExperienceForm from '../../../hooks/useWorkExperienceForm';

interface WorkExperienceStepProps {
  form: ReturnType<typeof useWorkExperienceForm>;
}

function WorkExperienceStep({ form }: WorkExperienceStepProps) {
  const { draft, errors, workExperiences, isEditing, editingId } = form;
  const formSectionReference = useRef<HTMLElement>(null);

  useEffect(() => {
    if (editingId) {
      formSectionReference.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [editingId]);

  return (
    <div className="flex flex-col gap-6">
      <SectionCard
        ref={formSectionReference}
        title={isEditing ? 'Editar experiencia' : 'Agregar nueva experiencia'}
        isHighlighted={isEditing}
        headerRight={
          <span className="font-code text-[11px] uppercase tracking-wider text-orbita-muted">
            {workExperiences.length} de {maximumWorkExperiences}
          </span>
        }
      >
        <RequiredFieldsNote condition="Si agregas una experiencia" />

        <div className="grid gap-4 sm:grid-cols-2">
          <TextField
            label="Cargo"
            name="title"
            value={draft.title}
            onChange={form.handleDraftChange}
            placeholder="Desarrollador backend"
            maxLength={150}
            error={errors.title}
            isRequired
          />
          <TextField
            label="Empresa"
            name="companyName"
            value={draft.companyName}
            onChange={form.handleDraftChange}
            placeholder="Empresa (opcional)"
            maxLength={200}
            error={errors.companyName}
          />
          <TextField
            label="Fecha de inicio"
            name="startDate"
            type="date"
            value={draft.startDate}
            onChange={form.handleDraftChange}
            error={errors.startDate}
            isRequired
          />
          {!draft.isCurrentJob && (
            <TextField
              label="Fecha de fin"
              name="endDate"
              type="date"
              value={draft.endDate}
              onChange={form.handleDraftChange}
              error={errors.endDate}
            />
          )}
        </div>

        <label className="flex w-fit cursor-pointer items-center gap-2 text-sm text-orbita-muted">
          <input
            type="checkbox"
            checked={draft.isCurrentJob}
            onChange={form.toggleCurrentJob}
            className="h-4 w-4 accent-orbita-primary"
          />
          Trabajo aquí actualmente
        </label>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="description" className="text-sm font-medium text-orbita-text">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={draft.description}
            onChange={form.handleDraftChange}
            maxLength={descriptionMaximumLength}
            rows={3}
            placeholder="Cuéntanos qué hacías en este puesto (opcional)"
            className="orbita-scrollbar resize-none rounded-lg border border-orbita-outline bg-orbita-surface p-3 text-sm text-orbita-text placeholder:text-orbita-disabled focus:border-orbita-accent focus:outline-none"
          />
          <p className="text-right font-code text-[11px] text-orbita-muted">
            {draft.description.length} / {descriptionMaximumLength}
          </p>
          {errors.description && (
            <p className="flex items-center gap-1 text-xs text-orbita-error">
              <FiAlertCircle aria-hidden="true" /> {errors.description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={form.saveWorkExperience}
            disabled={!form.canAddWorkExperience}
            leftIcon={isEditing ? <FiCheck /> : <FiPlus />}
          >
            {isEditing ? 'Guardar cambios' : 'Agregar experiencia'}
          </Button>
          {isEditing && (
            <Button variant="secondary" onClick={form.cancelEditing}>
              Cancelar
            </Button>
          )}
        </div>
      </SectionCard>

      <section className="flex flex-col gap-3">
        <h3 className="font-heading text-base font-semibold text-orbita-text">Experiencias agregadas</h3>
        {workExperiences.length === 0 ? (
          <p className="rounded-lg border border-dashed border-orbita-outline p-4 text-center text-sm text-orbita-muted">
            Aún no agregaste experiencias. Puedes agregar varias o continuar sin ellas.
          </p>
        ) : (
          workExperiences.map((workExperience) => (
            <WorkExperienceCard
              key={workExperience.id}
              workExperience={workExperience}
              isBeingEdited={workExperience.id === editingId}
              onEdit={form.editWorkExperience}
              onRemove={form.removeWorkExperience}
            />
          ))
        )}
      </section>
    </div>
  );
}

export default WorkExperienceStep;
