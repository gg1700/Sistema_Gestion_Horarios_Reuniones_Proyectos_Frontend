import type { PropsWithChildren, ReactNode } from 'react';
import { Link, type LinkProps } from 'react-router';
import { FiArrowRight, FiClock } from 'react-icons/fi';
import { Avatar } from '../../ui/Avatar';
import { dateLabel, rangeLabel } from '../../../utils/calendar';
import type { TimeRange } from '../../../mocks/flow';

export function TextLink({ children, icon = <FiArrowRight />, className = '', ...props }: LinkProps & { icon?: ReactNode }) {
  return <Link {...props} className={`flow-link ${className}`}>{children}<span aria-hidden="true">{icon}</span></Link>;
}
export function StatusDot({ children, tone = 'success' }: PropsWithChildren<{ tone?: 'success' | 'warning' | 'muted' | 'danger' }>) {
  return <span className={`flow-status flow-status--${tone}`}><i aria-hidden="true" />{children}</span>;
}
export function Person({ name, detail }: { name: string; detail?: string }) {
  return <div className="flow-person"><Avatar name={name} size="small" /><div><strong>{name}</strong>{detail && <span>{detail}</span>}</div></div>;
}
export function TimeSummary({ range, label, accent = false }: { range: TimeRange; label?: string; accent?: boolean }) {
  return <div className={`flow-time-summary ${accent ? 'flow-time-summary--accent' : ''}`}>{label && <span>{label}</span>}
    <h3><time dateTime={range.start}>{dateLabel(range.start)}</time></h3><p><FiClock aria-hidden="true" />{rangeLabel(range)}<small>UTC−4 · La Paz</small></p>
  </div>;
}
