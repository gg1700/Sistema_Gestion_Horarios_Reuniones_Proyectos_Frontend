import { useId } from 'react';
import type { ReactNode } from 'react';

export interface OrbitTag {
  label: string;
  icon: ReactNode;
  positionClassName: string;
}

interface OrbitIllustrationProps {
  tags?: OrbitTag[];
  caption?: string;
  className?: string;
}

function OrbitIllustration({ tags = [], caption, className = '' }: OrbitIllustrationProps) {
  const planetGradientId = useId();

  return (
    <div aria-hidden="true" className={`relative aspect-[600/440] w-full ${className}`}>
      <svg viewBox="0 0 600 440" fill="none" className="block h-full w-full">
        <defs>
          <radialGradient id={planetGradientId}>
            <stop stopColor="#DEFFEB" />
            <stop offset="0.5" stopColor="#97F1C6" />
            <stop offset="1" stopColor="#347A62" />
          </radialGradient>
        </defs>
        <circle cx="300" cy="220" r="170" stroke="#6EA684" strokeOpacity="0.18" strokeDasharray="2 9" />
        <ellipse cx="300" cy="220" rx="249" ry="86" transform="rotate(-24 300 220)" stroke="#6EA684" strokeOpacity="0.47" />
        <ellipse cx="300" cy="220" rx="95" ry="188" transform="rotate(-24 300 220)" stroke="#6EA684" strokeOpacity="0.24" />
        <ellipse cx="300" cy="220" rx="191" ry="75" transform="rotate(46 300 220)" stroke="#6EA684" strokeOpacity="0.24" />
        <circle cx="300" cy="220" r="68" fill="#142C23" stroke="#41694D" />
        <circle cx="300" cy="220" r="43" fill="#9FEFC9" fillOpacity="0.07" stroke="#74B68C" strokeOpacity="0.3" />
        <circle cx="300" cy="220" r="24" fill={`url(#${planetGradientId})`} />
        <circle cx="125" cy="118" r="3" fill="#82ADC4" />
        <circle cx="484" cy="263" r="3" fill="#A3F5CE" />
        <circle cx="230" cy="28" r="1.5" fill="#719B7E" />
        <circle cx="550" cy="332" r="1.5" fill="#719B7E" />
        <circle cx="189" cy="386" r="1.5" fill="#719B7E" />
      </svg>

      {tags.map((tag) => (
        <span
          key={tag.label}
          className={`absolute hidden items-center gap-3 sm:flex rounded-[13px] border border-[#34544A] bg-[#112222] px-4 py-3.5 text-xl text-ui-mint ${tag.positionClassName}`}
        >
          {tag.icon}
          <span className="text-[11px] whitespace-nowrap text-[#D4E8DE]">{tag.label}</span>
        </span>
      ))}

      {caption && (
        <span className="absolute top-[69%] left-[37%] hidden items-center sm:flex gap-2 rounded-2xl border border-[#2B443C] bg-[#0E1C1D] px-3.5 py-1.5 text-[9px] whitespace-nowrap text-[#B0C7BE]">
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {caption}
        </span>
      )}
    </div>
  );
}

export default OrbitIllustration;
