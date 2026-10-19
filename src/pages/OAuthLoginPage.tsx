
import OAuthProviderButton from '../components/features/OAuthProviderButton';

function OAuthLoginPage() {
  return (
    <main className="flex min-h-screen flex-col bg-[#101312] text-[#E1E4DF]">
      <header className="border-b border-[#2C312E] px-6 py-5">
        <div className="mx-auto flex max-w-6xl items-center gap-3">
          <span className="h-3 w-3 rounded-full border-2 border-[#10B981]" />
          <span className="text-xl font-semibold">
            Orbitia
          </span>
        </div>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center px-4 py-16">
        <div className="mb-8 rounded-full bg-[#252A27] px-4 py-2 text-center text-xs font-medium tracking-wider text-[#4EDEA3]">
          ACCESO MEDIANTE OAUTH 2.0
        </div>

        <div className="w-full max-w-[540px] rounded-lg border border-[#2C312E] bg-[#1B1F1D] p-6 shadow-2xl sm:p-10">
          <div className="mb-9 text-center">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-xl bg-[#101312]">
              <span className="h-8 w-8 rounded-full border-4 border-[#10B981]" />
            </div>

            <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
              Iniciar sesión en Orbitia
            </h1>

            <p className="mt-4 text-sm leading-6 text-[#B9C8BF]">
              Plataforma de gestión de horarios,
              reuniones y proyectos.
              Accede de forma segura mediante
              tus servicios externos.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <OAuthProviderButton provider="google" />
            <OAuthProviderButton provider="github" />
          </div>

          <div className="mt-9 border-t border-[#2C312E] pt-6">
            <div className="rounded-md bg-[#252A27] p-5">
              <p className="flex items-center gap-2 text-sm font-semibold text-[#4EDEA3]">
                <span aria-hidden="true">◆</span>
                Acceso seguro
              </p>

              <p className="mt-3 text-sm leading-6 text-[#B9C8BF]">
                Orbitia no solicita ni almacena las
                contraseñas de tus cuentas de Google
                o GitHub. La autenticación se realiza
                mediante los proveedores autorizados.
              </p>
            </div>
          </div>
        </div>

        <p className="mt-8 text-center text-xs text-[#B9C8BF]">
          Orbitia · Gestión de servicios telemáticos
        </p>
      </section>
    </main>
  );
}

export default OAuthLoginPage;
