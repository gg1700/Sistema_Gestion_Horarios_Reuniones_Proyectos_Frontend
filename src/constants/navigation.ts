import type { NavigationItem } from '../types/ui';
import { paths } from './paths';

export const currentNavigation: NavigationItem[] = [
  { to: paths.dashboard, label: 'Inicio', end: true },
  { to: paths.agenda, label: 'Agenda' },
  { to: paths.requests, label: 'Solicitudes' },
];
