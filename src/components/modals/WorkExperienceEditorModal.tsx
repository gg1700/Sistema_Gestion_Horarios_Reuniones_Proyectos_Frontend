import { FiAlertCircle, FiCheck } from 'react-icons/fi';
import Modal from './Modal';
import ModalHeader from './ModalHeader';
import TextField from '../ui/TextField';
import DateField from '../ui/DateField';
import Button from '../ui/Button';
import { descriptionMaximumLength } from '../../constants/profile';
import { fieldBoxClassName, getFieldBorderClassName } from '../../utils/fieldClassNames';
import type useWorkExperienceForm from '../../hooks/useWorkExperienceForm';

const titleId = 'work-experience-editor-title';

interface WorkExperienceEditorModalProps {
  form: ReturnType<typeof useWorkExperienceForm>;
}

function WorkExperienceEditorModal({ form }: WorkExperienceEditorModalProps) {
  const { draft, errors, isEditing } = form;

  return (
    <Modal titleId={titleId} onClose={form.closeEditor}>
      <ModalHeader
        titleId={titleId}
        eyebrow="Mi perfil / Experiencia"
        title="Experiencia laboral."
        description="Completa los datos de esta experiencia. · * Campos obligatorios"
        onClose={form.closeEditor}
      />

      <div className="ui-scrollbar min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
        <div className="grid gap-x-[18px] gap-y-5 sm:grid-cols-2">
          <TextField
            label="Cargo"
            name="title"
            value={draft.title}
            onChange={form.handleDraftChange}
            placeholder="Desarrollador frontend"
            maxLength={150}
            error={errors.title}
            isRequired
          />
          <TextField
            label="Empresa"
            name="companyName"
            value={draft.companyName}
            onChange={form.handleDraftChange}
            placeholder="Nexo Digital"
            maxLength={200}
            error={errors.companyName}
          />
          <DateField
            label="Fecha de inicio"
            name="startDate"
            value={draft.startDate}
            onChange={(value) => form.updateDraftField('startDate', value)}
            maximumDate={draft.endDate || undefined}
            error={errors.startDate}
            isRequired
          />
          {!draft.isCurrentJob && (
            <DateField
              label="Fecha de fin"
              name="endDate"
              value={draft.endDate}
              onChange={(value) => form.updateDraftField('endDate', value)}
              minimumDate={draft.startDate || undefined}
              error={errors.endDate}
            />
          )}
        </div>

        <label className="mt-5 flex w-fit cursor-pointer items-center gap-3 text-[11px] text-ui-muted">
          <input
            type="checkbox"
            checked={draft.isCurrentJob}
            onChange={form.toggleCurrentJob}
            className="h-4 w-4 accent-ui-mint"
          />
          Trabajo aquí actualmente
        </label>

        <div className="mt-5 flex flex-col gap-2">
          <label htmlFor="description" className="text-xs font-medium text-ui-text">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={draft.description}
            onChange={form.handleDraftChange}
            maxLength={descriptionMaximumLength}
            rows={4}
            placeholder="Cuéntanos qué hacías en este puesto"
            className={`ui-scrollbar resize-none py-3.5 ${fieldBoxClassName} ${getFieldBorderClassName(
              Boolean(errors.description)
            )}`}
          />
          <p className="text-right text-[10px] text-ui-moss">
            {draft.description.length} / {descriptionMaximumLength}
          </p>
          {errors.description && (
            <p className="flex items-center gap-1 text-[11px] text-ui-danger">
              <FiAlertCircle aria-hidden="true" /> {errors.description}
            </p>
          )}
        </div>
      </div>

      <footer className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-ui-border px-5 py-[18px] sm:px-8">
        <Button variant="secondary" onClick={form.closeEditor}>
          Cancelar
        </Button>
        <Button onClick={form.saveWorkExperience} leftIcon={<FiCheck />}>
          {isEditing ? 'Guardar cambios' : 'Guardar experiencia'}
        </Button>
      </footer>
    </Modal>
  );
}

export default WorkExperienceEditorModal;
