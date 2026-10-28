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
  leftIcon?: ReactNode;
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
  leftIcon,
  rightElement,
  maxLength,
  isRequired = false,
}: TextFieldProps) {
  const hasError = Boolean(error);
  const borderColor = hasError
    ? 'border-ui-danger'
    : isValid
      ? 'border-ui-mint/50'
      : 'border-ui-field-border hover:border-ui-soft focus-within:border-ui-mint';

  return (
    <div className="flex min-w-0 flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <label htmlFor={name} className="text-xs font-medium text-ui-text">
          {label}
          {isRequired && (
            <span className="ml-0.5 text-ui-mint" aria-hidden="true">
              *
            </span>
          )}
        </label>
        {labelHint && <span className="text-[10px] text-ui-mint">{labelHint}</span>}
      </div>

      <div
        className={`flex min-h-[3.25rem] items-center gap-3 rounded-control border bg-ui-field px-4 transition-colors ${borderColor}`}
      >
        {leftIcon && (
          <span className="shrink-0 text-ui-muted" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        {prefix && <span className="shrink-0 text-sm text-ui-soft">{prefix}</span>}
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
          className="h-12 w-full min-w-0 bg-transparent text-sm text-ui-text scheme-dark placeholder:text-ui-soft focus:outline-none"
        />
        {rightElement}
        {!rightElement && hasError && <FiAlertCircle className="shrink-0 text-ui-danger" aria-hidden="true" />}
        {!rightElement && !hasError && isValid && (
          <FiCheckCircle className="shrink-0 text-ui-mint" aria-hidden="true" />
        )}
      </div>

      {hasError ? (
        <p id={`${name}-error`} className="flex items-center gap-1.5 text-[11px] text-ui-danger">
          <FiAlertCircle aria-hidden="true" />
          {error}
        </p>
      ) : (
        helperText && <p className="text-[10px] leading-4 text-ui-muted">{helperText}</p>
      )}
    </div>
  );
}

export default TextField;
