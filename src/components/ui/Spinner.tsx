import { classNames } from '../../utils/classNames';

export function Spinner({ label = 'Cargando', decorative = false, className }: {
  label?: string; decorative?: boolean; className?: string;
}) {
  return <span className={classNames('ui-spinner', className)} role={decorative ? undefined : 'status'}
    aria-hidden={decorative || undefined}>
    {!decorative && <span className="ui-sr-only">{label}</span>}
  </span>;
}
