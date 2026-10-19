
import { FcGoogle } from 'react-icons/fc';
import { FaGithub } from 'react-icons/fa';
import { FiArrowRight } from 'react-icons/fi';

type OAuthProvider = 'google' | 'github';

interface OAuthProviderButtonProps {
  provider: OAuthProvider;
}

function OAuthProviderButton({ provider }: OAuthProviderButtonProps) {
  const isGoogle = provider === 'google';

  const title = isGoogle
    ? 'Continuar con Google'
    : 'Continuar con GitHub';

  const description = isGoogle
    ? 'Accede con tu cuenta de Google'
    : 'Vincula tus proyectos y repositorios';

  const apiUrl =
    import.meta.env.VITE_API_URL || 'http://localhost:3000';

  const authUrl = new URL(
    `/api/v1/auth/${provider}`,
    apiUrl,
  ).toString();

  return (
    <a
      href={authUrl}
      className="group flex w-full items-center justify-between gap-3 rounded-md border border-transparent bg-[#252A27] p-4 text-left transition-colors hover:border-[#10B981] hover:bg-[#2C312E] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#4EDEA3]"
    >
      <div className="flex min-w-0 items-center gap-4">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md bg-[#101312]">
          {isGoogle ? (
            <FcGoogle size={23} aria-hidden="true" />
          ) : (
            <FaGithub
              size={23}
              color="#E1E4DF"
              aria-hidden="true"
            />
          )}
        </span>

        <span className="flex min-w-0 flex-col gap-1">
          <span className="font-semibold text-[#E1E4DF]">
            {title}
          </span>
          <span className="text-xs text-[#B9C8BF]">
            {description}
          </span>
        </span>
      </div>

      <FiArrowRight
        className="shrink-0 text-[#B9C8BF] transition-transform group-hover:translate-x-1 group-hover:text-[#4EDEA3]"
        size={19}
        aria-hidden="true"
      />
    </a>
  );
}

export default OAuthProviderButton;
