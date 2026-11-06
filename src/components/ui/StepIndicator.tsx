import { Fragment } from 'react';
import { FiCheck } from 'react-icons/fi';

interface StepIndicatorProps {
  steps: string[];
  currentStepIndex: number;
  note?: string;
}

function getStepCircleClassName(isCompleted: boolean, isCurrent: boolean) {
  if (isCurrent) return 'bg-ui-mint text-ui-ink';
  if (isCompleted) return 'border border-[#4C7756] bg-ui-step-done text-ui-mint';
  return 'border border-ui-stepper-border text-ui-leaf';
}

function StepIndicator({ steps, currentStepIndex, note }: StepIndicatorProps) {
  return (
    <div className="flex shrink-0 items-center gap-4 border-b border-ui-stepper-border bg-ui-stepper px-5 py-4 sm:px-8">
      <ol className="flex min-w-0 flex-1 items-center gap-3 sm:gap-4">
        {steps.map((step, index) => {
          const isCompleted = index < currentStepIndex;
          const isCurrent = index === currentStepIndex;
          return (
            <Fragment key={step}>
              {index > 0 && <li aria-hidden="true" className="hidden h-px w-11 bg-ui-stepper-border sm:block" />}
              <li aria-current={isCurrent ? 'step' : undefined} className="flex min-w-0 items-center gap-2.5">
                <span
                  className={`flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full text-[9px] font-semibold ${getStepCircleClassName(
                    isCompleted,
                    isCurrent
                  )}`}
                >
                  {isCompleted ? <FiCheck aria-hidden="true" /> : String(index + 1).padStart(2, '0')}
                </span>
                <span className={`truncate text-[10px] ${isCurrent ? 'text-[#C4E9D2]' : 'text-ui-leaf'}`}>{step}</span>
              </li>
            </Fragment>
          );
        })}
      </ol>
      {note && <span className="shrink-0 text-[9px] text-ui-leaf">{note}</span>}
    </div>
  );
}

export default StepIndicator;
