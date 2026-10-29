import { useId } from 'react';
import { ProviderIcon } from '../../ui/ProviderIcon';

export function OrbitIllustration({ services = false, panel = false }: { services?: boolean; panel?: boolean }) {
  const id = useId();
  return <div className={`flow-orbit ${panel ? 'flow-orbit--panel' : ''}`} aria-hidden="true">
    <svg viewBox="0 0 600 440" fill="none"><defs><radialGradient id={id}><stop stopColor="#deffeb" /><stop offset=".5" stopColor="#97f1c6" /><stop offset="1" stopColor="#347a62" /></radialGradient></defs>
      <circle cx="300" cy="220" r="170" stroke="#6ea684" strokeOpacity=".18" strokeDasharray="2 9" />
      <ellipse cx="300" cy="220" rx="249" ry="86" transform="rotate(-24 300 220)" stroke="#6ea684" strokeOpacity=".47" />
      <ellipse cx="300" cy="220" rx="95" ry="188" transform="rotate(-24 300 220)" stroke="#6ea684" strokeOpacity=".24" />
      <ellipse cx="300" cy="220" rx="191" ry="75" transform="rotate(46 300 220)" stroke="#6ea684" strokeOpacity=".24" />
      <circle cx="300" cy="220" r="68" fill="#142c23" stroke="#41694d" /><circle cx="300" cy="220" r="43" fill="#9fefc9" fillOpacity=".07" stroke="#74b68c" strokeOpacity=".3" />
      <circle cx="300" cy="220" r="24" fill={panel ? `url(#${id})` : '#a3f5ce'} /><ellipse cx="291" cy="212" rx="8" ry="5" transform="rotate(-27 291 212)" fill="#eafff0" fillOpacity=".33" />
      <circle cx="125" cy="118" r="3" fill="#82adc4" /><circle cx="484" cy="263" r="3" fill="#a3f5ce" /><circle cx="230" cy="28" r="1.5" fill="#719b7e" /><circle cx="550" cy="332" r="1.5" fill="#719b7e" /><circle cx="189" cy="386" r="1.5" fill="#719b7e" />
    </svg>
    {services && <><div className="flow-orbit__google"><span><ProviderIcon provider="google" /></span><div>Google Calendar<small>Tu tiempo</small></div></div>
      <div className="flow-orbit__github"><span><ProviderIcon provider="github" /></span><div>GitHub<small>Tu trabajo</small></div></div></>}
    {panel && <><span className="flow-orbit__tag flow-orbit__tag--profile">♧ <span>Tu perfil</span></span><span className="flow-orbit__tag flow-orbit__tag--calendar">▦ <span>Tus reuniones</span></span><span className="flow-orbit__tag flow-orbit__tag--code">〈/〉 <span>Tus proyectos</span></span><span className="flow-orbit__caption">● &nbsp; TU ESPACIO, CONECTADO</span></>}
  </div>;
}
