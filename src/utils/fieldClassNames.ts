export const fieldBoxClassName =
  'min-h-[3.25rem] rounded-control border bg-ui-field px-4 text-sm text-ui-text transition-colors placeholder:text-ui-soft focus:outline-none';

export function getFieldBorderClassName(hasError: boolean) {
  return hasError
    ? 'border-ui-danger'
    : 'border-ui-field-border hover:border-ui-soft focus:border-ui-mint focus-within:border-ui-mint';
}
