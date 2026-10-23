import { FiBriefcase, FiCalendar, FiEdit2, FiTrash2 } from 'react-icons/fi';
import IconButton from '../../ui/IconButton';
import type { WorkExperienceItem } from '../../../types/profile';

interface WorkExperienceCardProps {
  workExperience: WorkExperienceItem;
  isBeingEdited: boolean;
  onEdit: (workExperienceId: string) => void;
  onRemove: (workExperienceId: string) => void;
}

function formatMonth(date: string) {
  if (!date) return '';
  const formatedDate = new Date(`${date}T00:00:00`).toLocaleDateString('es-BO', {
    month: 'short',
    year: 'numeric',
  });
  return formatedDate.replace('.', '');
}

function WorkExperienceCard({ workExperience, isBeingEdited, onEdit, onRemove }: WorkExperienceCardProps) {
  const endLabel = workExperience.isCurrentJob || !workExperience.endDate
    ? 'Actualidad'
    : formatMonth(workExperience.endDate);

  return (
    <article
      className={`flex gap-4 rounded-lg border bg-orbita-card p-4 ${
        isBeingEdited ? 'border-orbita-accent' : 'border-orbita-outline'
      }`}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orbita-success text-orbita-accent">
        <FiBriefcase aria-hidden="true" />
      </div>
      <div className="min-w-0 flex-1">
        {isBeingEdited && (
          <p className="mb-1 font-code text-[11px] uppercase tracking-wider text-orbita-accent">Editando</p>
        )}
        <p className="font-medium text-orbita-text">
          {workExperience.title}
          {workExperience.companyName && (
            <span className="text-orbita-accent"> · {workExperience.companyName}</span>
          )}
        </p>
        <p className="mt-1 flex items-center gap-1.5 font-code text-xs text-orbita-muted">
          <FiCalendar aria-hidden="true" />
          {formatMonth(workExperience.startDate)} — {endLabel}
        </p>
        {workExperience.description && (
          <p className="mt-2 text-sm leading-5 text-orbita-muted">{workExperience.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-2">
        <IconButton label="Editar experiencia" icon={<FiEdit2 />} onClick={() => onEdit(workExperience.id)} />
        <IconButton
          label="Eliminar experiencia"
          icon={<FiTrash2 />}
          onClick={() => onRemove(workExperience.id)}
          variant="danger"
        />
      </div>
    </article>
  );
}

export default WorkExperienceCard;
