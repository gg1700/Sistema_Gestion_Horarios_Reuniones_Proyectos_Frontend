import type { ReactNode } from 'react';
import { FaGithub } from 'react-icons/fa';
import { FcGoogle } from 'react-icons/fc';
import { FiAlertCircle, FiArrowRight, FiLink, FiShield } from 'react-icons/fi';
import { getProviderAuthorizationUrl } from '../../../api/authApi';
import type { OAuthProvider } from '../../../types/auth';

const providers: { provider: OAuthProvider; name: string; icon: ReactNode }[] = [
  { provider: 'google', name: 'Google', icon: <FcGoogle /> },
  { provider: 'github', name: 'GitHub', icon: <FaGithub /> },
];

interface ProviderAccessProps {
  errorMessage?: string;
}

function ProviderAccess({ errorMessage }: ProviderAccessProps) {
  return (
    <section className="w-full max-w-[29rem] self-center">
      <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-[14px] border border-ui-panel-border bg-ui-panel text-2xl text-ui-mint">
        <FiLink aria-hidden="true" />
      </div>
      <p className="text-[9px] font-semibold tracking-[0.17em] text-ui-mint uppercase">Bienvenido a Orbitia</p>
      <h2 className="mt-4 font-heading text-[37px] leading-[47px] font-medium tracking-[-0.04em] text-[#D6EBDD]">
        Entra a tu espacio.
      </h2>
      <p className="mt-4 text-[13px] leading-6 text-[#85A891]">
        Elige tu cuenta para continuar.
        <br />
        Si es tu primera vez, crearás tu perfil en el siguiente paso.
      </p>

      {errorMessage && (
        <p
          role="alert"
          className="mt-6 flex items-start gap-2.5 rounded-control border border-ui-danger/30 bg-ui-danger-tint px-4 py-3 text-xs leading-5 text-ui-danger"
        >
          <FiAlertCircle className="mt-0.5 shrink-0" aria-hidden="true" />
          {errorMessage}
        </p>
      )}

      <div className="my-7 flex flex-col gap-3.5">
        {providers.map(({ provider, name, icon }) => (
          <a
            key={provider}
            href={getProviderAuthorizationUrl(provider)}
            className="flex items-center gap-[18px] rounded-[14px] border border-[#3B5547] bg-[linear-gradient(110deg,#162B25,#10211F)] px-5 py-[19px] text-[#C7E2D0] transition-colors hover:border-[#85BC98]"
          >
            <span className="shrink-0 text-[26px]" aria-hidden="true">
              {icon}
            </span>
            <span className="flex flex-1 flex-col gap-1.5">
              <strong className="text-sm font-medium text-[#D2E8DA]">Continuar con {name}</strong>
              <small className="text-[10px] text-[#7CA389]">Usa tu cuenta de {name}</small>
            </span>
            <FiArrowRight className="shrink-0 text-lg text-[#90C3A2]" aria-hidden="true" />
          </a>
        ))}
      </div>

      <div className="flex items-start gap-3 border-t border-[#2D4538] pt-6">
        <FiShield className="mt-0.5 shrink-0 text-lg text-[#85B49A]" aria-hidden="true" />
        <div>
          <p className="text-[11px] font-medium text-[#BDD7C5]">Tu cuenta, bajo tu control.</p>
          <p className="mt-2 text-[11px] leading-5 text-[#6E977D]">
            El acceso se autoriza en Google o GitHub. Orbitia nunca ve ni guarda tu contraseña.
          </p>
        </div>
      </div>
      <p className="mt-6 text-[10px] text-[#80A58C]">• &nbsp;¿Ya tienes perfil? Usa una de tus cuentas vinculadas.</p>
    </section>
  );
}

export default ProviderAccess;
