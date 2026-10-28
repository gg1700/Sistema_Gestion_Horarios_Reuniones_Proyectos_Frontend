import { FiPlus, FiShield } from 'react-icons/fi';
import Button from '../../ui/Button';
import WorkExperienceCard from './WorkExperienceCard';
import WorkExperienceEditorModal from '../../modals/WorkExperienceEditorModal';
import { maximumWorkExperiences } from '../../../constants/profile';
import type useWorkExperienceForm from '../../../hooks/useWorkExperienceForm';

interface WorkExperienceStepProps {
  form: ReturnType<typeof useWorkExperienceForm>;
}

function WorkExperienceStep({ form }: WorkExperienceStepProps) {
  const { workExperiences } = form;
  const canAddMore = workExperiences.length < maximumWorkExperiences;

  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-heading text-base font-medium text-ui-text">Tus experiencias</h3>
        <span className="text-[10px] text-ui-moss">
          {workExperiences.length} de {maximumWorkExperiences} agregadas
        </span>
      </div>

      {workExperiences.length === 0 ? (
        <p className="mt-5 rounded-control border border-dashed border-ui-field-border p-5 text-center text-[11px] text-ui-muted">
          Aún no agregaste experiencias. Puedes agregar varias o continuar sin ellas.
        </p>
      ) : (
        <div className="mt-2">
          {workExperiences.map((workExperience) => (
            <WorkExperienceCard
              key={workExperience.id}
              workExperience={workExperience}
              onEdit={form.editWorkExperience}
              onRemove={form.removeWorkExperience}
            />
          ))}
        </div>
      )}

      <div className="border-b border-ui-divider pt-5 pb-12">
        <Button variant="link" onClick={form.openNewWorkExperience} disabled={!canAddMore} leftIcon={<FiPlus />}>
          {canAddMore ? 'Agregar experiencia' : 'Llegaste al máximo de experiencias'}
        </Button>
      </div>

      <div className="mt-6 flex items-start gap-2.5 text-[10px] leading-5 text-ui-moss">
        <FiShield className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        <p>
          Esta información es opcional.
          <br />
          Puedes volver, hacer cambios o completar tu perfil más tarde.
        </p>
      </div>

      {form.isEditorOpen && <WorkExperienceEditorModal form={form} />}
    </div>
  );
}

export default WorkExperienceStep;
