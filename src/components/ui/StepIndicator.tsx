import { FiCheck } from 'react-icons/fi';

interface StepIndicatorProps {
  steps: string[];
  currentStepIndex: number;
}

function StepIndicator({ steps, currentStepIndex }: StepIndicatorProps) {
  return (
    <ol className="flex items-center gap-3">
      {steps.map((step, index) => {
        const isCompleted = index < currentStepIndex;
        const isCurrent = index === currentStepIndex;
        return (
          <li key={step} className="flex flex-1 items-center gap-3">
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${
                isCompleted || isCurrent
                  ? 'bg-orbita-accent text-orbita-on-primary'
                  : 'border border-orbita-outline text-orbita-muted'
              }`}
            >
              {isCompleted ? <FiCheck aria-hidden="true" /> : index + 1}
            </span>
            <span className={`text-sm ${isCurrent ? 'text-orbita-text' : 'text-orbita-muted'}`}>{step}</span>
            {index < steps.length - 1 && (
              <span className={`h-px flex-1 ${isCompleted ? 'bg-orbita-accent' : 'bg-orbita-outline'}`} />
            )}
          </li>
        );
      })}
    </ol>
  );
}

export default StepIndicator;
