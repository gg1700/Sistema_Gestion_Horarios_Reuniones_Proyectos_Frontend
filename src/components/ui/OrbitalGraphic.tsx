import { useId } from 'react';
import { classNames } from '../../utils/classNames';

export function OrbitalGraphic({ className }: { className?: string }) {
  const gradientId = useId();
  return <svg className={classNames('ui-orbital-graphic', className)} viewBox="0 0 600 440" fill="none" aria-hidden="true">
    <defs><radialGradient id={gradientId}><stop stopColor="currentColor" stopOpacity=".16" /><stop offset="1" stopColor="currentColor" stopOpacity="0" /></radialGradient></defs>
    <ellipse cx="300" cy="220" rx="285" ry="210" fill={`url(#${gradientId})`} />
    <circle cx="300" cy="220" r="170" stroke="currentColor" strokeOpacity=".15" strokeDasharray="2 8" />
    <ellipse cx="300" cy="220" rx="248" ry="85" transform="rotate(-25 300 220)" stroke="currentColor" strokeOpacity=".45" />
    <ellipse cx="300" cy="220" rx="210" ry="83" transform="rotate(44 300 220)" stroke="currentColor" strokeOpacity=".3" />
    <ellipse cx="300" cy="220" rx="92" ry="188" transform="rotate(12 300 220)" stroke="currentColor" strokeOpacity=".25" />
    <circle cx="300" cy="220" r="58" stroke="currentColor" strokeOpacity=".15" />
    <circle cx="300" cy="220" r="36" stroke="currentColor" strokeOpacity=".3" />
    <circle cx="300" cy="220" r="21" fill="currentColor" />
    <circle cx="512" cy="119" r="5" fill="currentColor" /><circle cx="415" cy="351" r="4" fill="currentColor" opacity=".65" />
    <circle cx="127" cy="137" r="3" fill="#a5cfe0" /><circle cx="102" cy="317" r="2" fill="currentColor" opacity=".7" />
  </svg>;
}
