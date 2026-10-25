import type { ChangeEvent, ReactNode } from 'react';
import { FiAlertCircle, FiCheckCircle } from 'react-icons/fi';

interface TextFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  error?: string;
  isValid?: boolean;
  helperText?: string;
  prefix?: string;
  labelHint?: string;
  rightElement?: ReactNode;
  maxLength?: number;
  isRequired?: boolean;
}

function TextField({
  label,
  name,
  value,
  onChange,
  onBlur,
  type = 'text',
  placeholder,
  autoComplete,
  error,
  isValid = false,
  helperText,
  prefix,
  labelHint,
  rightElement,
  maxLength,
  isRequired = false,
}: TextFieldProps) {
  const hasError = Boolean(error);
  const borderColor = hasError
    ? 'border-orbita-error'
    : isValid
      ? 'border-orbita-primary/60'
      : 'border-orbita-outline focus-within:border-orbita-accent';

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between">
        <label htmlFor={name} className="text-sm font-medium text-orbita-text">
          {label}
          {isRequired && (
            <span className="ml-0.5 text-orbita-error" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelHint && (
          <span className="font-code text-[11px] uppercase tracking-wider text-orbita-accent">
            {labelHint}
          </span>
        )}
      </div>

      <div
        className={`flex items-center gap-2 rounded-lg border bg-orbita-surface px-3 transition-colors ${borderColor}`}
      >
        {prefix && <span className="font-code text-sm text-orbita-muted">{prefix}</span>}
        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          autoComplete={autoComplete}
          maxLength={maxLength}
          required={isRequired}
          aria-invalid={hasError}
          aria-describedby={hasError ? `${name}-error` : undefined}
          className="h-11 w-full bg-transparent text-sm text-orbita-text scheme-dark placeholder:text-orbita-disabled focus:outline-none"
        />
        {rightElement}
        {!rightElement && hasError && (
          <FiAlertCircle className="shrink-0 text-orbita-error" aria-hidden="true" />
        )}
        {!rightElement && !hasError && isValid && (
          <FiCheckCircle className="shrink-0 text-orbita-primary" aria-hidden="true" />
        )}
      </div>

      {hasError ? (
        <p id={`${name}-error`} className="flex items-center gap-1.5 text-xs text-orbita-error">
          <FiAlertCircle aria-hidden="true" />
          {error}
        </p>
      ) : (
        helperText && <p className="text-xs text-orbita-muted">{helperText}</p>
      )}
    </div>
  );
}

export default TextField;
