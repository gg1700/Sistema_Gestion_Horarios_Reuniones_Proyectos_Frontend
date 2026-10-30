import { FiCalendar, FiCode, FiUsers } from 'react-icons/fi';
import OrbitIllustration from '../../ui/OrbitIllustration';
import type { OrbitTag } from '../../ui/OrbitIllustration';

const orbitTags: OrbitTag[] = [
  { label: 'Tu perfil', icon: <FiUsers />, positionClassName: 'top-[45%] left-[7%]' },
  { label: 'Tus reuniones', icon: <FiCalendar />, positionClassName: 'top-[15%] right-[9%]' },
  { label: 'Tus proyectos', icon: <FiCode />, positionClassName: 'right-[5%] bottom-[5%]' },
];

function AccessStory() {
  return (
    <aside className="relative flex h-[30rem] flex-col overflow-hidden rounded-3xl border border-[#233B39] bg-[radial-gradient(ellipse_at_57%_73%,#15332D_0%,#10221F_40%,#0E1D1F_77%,#101C20_100%)] px-6 pt-8 sm:h-[40rem] sm:px-10 sm:pt-10 lg:h-[46rem]">
      <p className="flex items-center gap-2.5 text-[10px] font-semibold tracking-[0.18em] text-ui-mint uppercase">
        <span className="relative h-3.5 w-3.5 rounded-full border border-[#74C3A4]">
          <span className="absolute inset-1 rounded-full bg-ui-mint" />
        </span>
        Personas · Tiempo · Proyectos
      </p>
      <h1 className="mt-7 font-heading text-4xl leading-[1.13] font-medium tracking-[-0.04em] text-ui-text sm:text-5xl lg:text-[56px]">
        Tu mundo,
        <br />
        en la misma <span className="text-ui-mint">órbita.</span>
      </h1>
      <p className="relative z-10 mt-6 text-sm leading-6 text-[#AFC5BB]">
        Tu perfil, tus reuniones y tus proyectos.
        <br />
        Un espacio para conectar lo que haces.
      </p>

      <OrbitIllustration
        tags={orbitTags}
        caption="TU ESPACIO, CONECTADO"
        className="absolute bottom-12 left-1/2 w-[110%] -translate-x-1/2 opacity-80 sm:bottom-14 sm:w-[38rem] sm:opacity-100"
      />

      <div className="absolute right-6 bottom-6 left-6 flex items-center gap-2.5 text-[11px] text-[#9CB9AB] sm:right-10 sm:left-10">
        <span className="h-px w-6 bg-[#567B67]" />
        Todo conectado. Todo a tu ritmo.
        <span className="ml-auto text-lg text-ui-mint" aria-hidden="true">
          ✦
        </span>
      </div>
    </aside>
  );
}

export default AccessStory;
