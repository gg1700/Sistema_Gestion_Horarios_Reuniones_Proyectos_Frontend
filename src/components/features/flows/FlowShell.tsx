import { useCallback, useState, type PropsWithChildren } from 'react';
import { FiArrowRight } from 'react-icons/fi';
import { AppLayout } from '../../layouts/AppLayout';
import { useMockFlow } from '../../../contexts/MockFlowContext';
import { paths, flowPaths } from '../../../constants/paths';
import { TextLink } from './FlowPrimitives';
import { AccountMenu } from './AccountMenu';
import type { NavigationItem } from '../../../types/ui';
import { Navigate, useLocation, useParams } from 'react-router';
import { publicProfilePath } from '../../../constants/paths';

const privateNavigation: NavigationItem[] = [
  { to: paths.dashboard, label: 'Inicio' }, { to: paths.agenda, label: 'Agenda' },
  { to: paths.requests, label: 'Solicitudes' },
  { to: paths.profile, label: 'Perfil', end: true },
];

export function MemberShell({ children }: PropsWithChildren) {
  const { state } = useMockFlow();
  const { pathname } = useLocation();
  const [accountOpen, setAccountOpen] = useState(false);
  const closeAccount = useCallback(() => setAccountOpen(false), []);
  // Solo navegación de la maqueta tras borrar los datos locales. El guard real
  // de sesión/propiedad se añadirá aquí y en los endpoints al integrar backend.
  if (state.account.deleted) return <Navigate to={paths.access} replace />;
  const navigation = privateNavigation.map(item => item.to === paths.profile ? { ...item, active: pathname.startsWith(paths.profile) } : item);
  return <div className="flow-surface"><AppLayout navigation={navigation} brandTo={paths.dashboard}
    identity={{ name: `${state.profile.name} ${state.profile.firstSurname}`, imageUrl: state.account.details.image }} onAccountClick={() => setAccountOpen(value => !value)}>
    {children}
  </AppLayout>{accountOpen && <AccountMenu onClose={closeAccount} />}</div>;
}

export function VisitorShell({ children, access = false, landing = false }: PropsWithChildren<{ access?: boolean; landing?: boolean }>) {
  const { state } = useMockFlow();
  const { publicHandle } = useParams();
  const handle = publicHandle ?? state.profile.handle;
  const navigation: NavigationItem[] = access || landing ? [] : [
    { to: publicProfilePath(handle), label: 'Perfil', end: true },
    { to: flowPaths.availability(handle), label: 'Disponibilidad' },
  ];
  return <div className="flow-surface"><AppLayout navigation={navigation} actions={access ? <>
    <TextLink to={paths.home} icon={null}>Conoce Orbitia</TextLink><span className="flow-header-note">GOOGLE + GITHUB</span>
  </> : landing ? <TextLink to={paths.access} className="flow-header-access">Entrar a Orbitia</TextLink> :
    <TextLink to={paths.access} icon={<FiArrowRight />}>Iniciar sesión</TextLink>}>
    {children}
  </AppLayout></div>;
}
