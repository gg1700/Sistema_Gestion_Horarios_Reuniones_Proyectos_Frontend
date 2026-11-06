import { forwardRef, useId, type InputHTMLAttributes, type SelectHTMLAttributes, type TextareaHTMLAttributes, type ReactNode } from 'react';
import { classNames } from '../../utils/classNames';

interface FieldProps {
  label: string;
  hint?: string;
  error?: string;
  containerClassName?: string;
}

function Field({ id, label, hint, error, children, required, className }: FieldProps & {
  id: string; children: ReactNode; required?: boolean; className?: string;
}) {
  return <div className={classNames('ui-field', className)}>
    <label className="ui-field__label" htmlFor={id}>{label}{required && <span aria-hidden="true"> *</span>}</label>
    {children}
    {hint && <p className="ui-field__hint" id={`${id}-hint`}>{hint}</p>}
    {error && <p className="ui-field__error" id={`${id}-error`} role="alert">{error}</p>}
  </div>;
}

function describedBy(id: string, hint?: string, error?: string, existing?: string) {
  return classNames(existing, hint && `${id}-hint`, error && `${id}-error`) || undefined;
}

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement> & FieldProps & { leadingContent?: ReactNode }>(function Input({
  id: suppliedId, label, hint, error, containerClassName, className, required, leadingContent, ...props
}, ref) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  const control = <input {...props} ref={ref} id={id} required={required} className={classNames('ui-input', leadingContent !== undefined && 'ui-input--affixed', className)}
    aria-invalid={error ? true : props['aria-invalid']} aria-describedby={describedBy(id, hint, error, props['aria-describedby'])} />;
  return <Field id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
    {leadingContent !== undefined ? <div className={classNames('ui-input-affix', error && 'ui-input-affix--invalid')}>{leadingContent}{control}</div> : control}
  </Field>;
});

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaHTMLAttributes<HTMLTextAreaElement> & FieldProps>(function Textarea({
  id: suppliedId, label, hint, error, containerClassName, className, required, rows = 4, ...props
}, ref) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return <Field id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
    <textarea {...props} ref={ref} id={id} rows={rows} required={required} className={classNames('ui-input', 'ui-textarea', className)}
      aria-invalid={error ? true : props['aria-invalid']} aria-describedby={describedBy(id, hint, error, props['aria-describedby'])} />
  </Field>;
});

export const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement> & FieldProps>(function Select({
  id: suppliedId, label, hint, error, containerClassName, className, required, children, ...props
}, ref) {
  const generatedId = useId();
  const id = suppliedId ?? generatedId;
  return <Field id={id} label={label} hint={hint} error={error} required={required} className={containerClassName}>
    <select {...props} ref={ref} id={id} required={required} className={classNames('ui-input', 'ui-select', className)}
      aria-invalid={error ? true : props['aria-invalid']} aria-describedby={describedBy(id, hint, error, props['aria-describedby'])}>
      {children}
    </select>
  </Field>;
});

export function Checkbox({ label, className, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> & { label: ReactNode }) {
  return <label className={classNames('ui-checkbox', className)}><input {...props} type="checkbox" /><span>{label}</span></label>;
}

export function Switch({ label, ...props }: Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'role'> & { label: string }) {
  return <label className="ui-switch"><span>{label}</span><input {...props} type="checkbox" role="switch" /><span className="ui-switch__track" aria-hidden="true" /></label>;
}
