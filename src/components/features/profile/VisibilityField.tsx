
import type { VisibilityField as VisibilityFieldType } from "../../../types/profileVisibility";

type VisibilityFieldProps = {
  field: VisibilityFieldType;
  checked: boolean;
  disabled?: boolean;
  onChange: () => void;
};

function VisibilityField({
  field,
  checked,
  disabled = false,
  onChange,
}: VisibilityFieldProps) {
  return (
    <div className="flex min-h-14 items-center justify-between gap-3 border-b border-orbita-outline py-3 last:border-b-0">
      <div className="min-w-0 flex-1 md:grid md:grid-cols-[145px_1fr] md:items-center md:gap-4">
        <span className="hidden font-code text-[10px] font-semibold tracking-wider text-orbita-muted md:block">
          {field.category}
        </span>

        <span className="font-body text-sm text-orbita-text">
          {field.label}
        </span>
      </div>

      <button
        type="button"
        role="switch"
        aria-label={`Mostrar ${field.label.toLowerCase()} públicamente`}
        aria-checked={checked}
        disabled={disabled}
        onClick={onChange}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orbita-accent disabled:cursor-not-allowed disabled:opacity-50 ${
          checked ? "bg-orbita-primary" : "bg-[#4A514C]"
        }`}
      >
        <span
          className={`absolute top-1 h-4 w-4 rounded-full bg-white transition-all ${
            checked ? "left-6" : "left-1"
          }`}
        />
      </button>
    </div>
  );
}

export default VisibilityField;
