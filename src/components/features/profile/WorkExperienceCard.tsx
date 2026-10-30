import { FiEdit2, FiTrash2 } from 'react-icons/fi';
import IconButton from '../../ui/IconButton';
import type { WorkExperienceItem } from '../../../types/profile';

interface WorkExperienceCardProps {
  workExperience: WorkExperienceItem;
  onEdit: (workExperienceId: string) => void;
  onRemove: (workExperienceId: string) => void;
}

function formatMonth(date: string) {
  if (!date) return '';
  const formattedDate = new Date(`${date}T00:00:00`).toLocaleDateString('es-BO', {
    month: 'short',
    year: 'numeric',
  });
  const monthAndYear = formattedDate.replace('.', '').replace(' de ', ' ');
  return monthAndYear.charAt(0).toUpperCase() + monthAndYear.slice(1);
}

function WorkExperienceCard({ workExperience, onEdit, onRemove }: WorkExperienceCardProps) {
  const endLabel =
    workExperience.isCurrentJob || !workExperience.endDate ? 'Actualidad' : formatMonth(workExperience.endDate);

  return (
    <article className="flex gap-4 border-b border-ui-divider py-6">
      <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-ui-mint" aria-hidden="true" />
      <div className="min-w-0 flex-1">
        <h4 className="text-[13px] font-medium text-ui-text">{workExperience.title}</h4>
        <p className="mt-2.5 text-[10px] text-ui-leaf">
          {workExperience.companyName && <span>{workExperience.companyName} &nbsp;·&nbsp; </span>}
          {formatMonth(workExperience.startDate)} — {endLabel}
        </p>
        {workExperience.description && (
          <p className="mt-4 text-[11px] leading-5 text-[#A7C4B1]">{workExperience.description}</p>
        )}
      </div>
      <div className="flex shrink-0 gap-1">
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
