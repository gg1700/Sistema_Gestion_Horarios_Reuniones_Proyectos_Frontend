import { Routes, Route, Navigate } from 'react-router';
import { paths } from '../constants/paths';
import LandingPage from '../pages/LandingPage';
import AccessPage from '../pages/AccessPage';
import WelcomePage from '../pages/WelcomePage';
import DashboardPage from '../pages/DashboardPage';
import AgendaPage from '../pages/AgendaPage';
import AvailabilityPage from '../pages/AvailabilityPage';
import RequestsPage from '../pages/RequestsPage';
import ChangeResultPage from '../pages/ChangeResultPage';
import ParticipantPage from '../pages/ParticipantPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileSetupPage from '../pages/ProfileSetupPage';
import VisibilityPage from '../pages/VisibilityPage';
import ConnectionsPage from '../pages/ConnectionsPage';
import GitHubInfoPage from '../pages/GitHubInfoPage';
import AccessIssuePage from '../pages/AccessIssuePage';
import ProfilePublicPage from '../pages/ProfilePublicPage';
import ProfileLinkPage from '../pages/ProfileLinkPage';
import ProfileOriginsPage from '../pages/ProfileOriginsPage';
import { RequireSession } from '../features/auth/SessionGate';

/*
PROTECCIÓN DE RUTAS IMPLEMENTADA
RequireSession consulta el estado de AuthProvider, cargado con GET /api/v1/auth/session.
Cookie HttpOnly; 401 -> /acceso. Perfil incompleto -> formulario de completar cuenta.
La respuesta y los JSON de los endpoints reales están en features/auth/api.ts.
Un fallo del servidor muestra un aviso y reintento; no habilita las rutas privadas.
Landing, acceso, perfil público, disponibilidad e invitaciones quedan fuera del grupo.
Las restantes funcionalidades visuales conservan sus mocks hasta su integración.
*/
function RouterPage() {
  return (
    <Routes>
      <Route path={paths.home} element={<LandingPage />} />
      <Route path={paths.access} element={<AccessPage />} />
      <Route path={paths.accessIssue} element={<AccessIssuePage />} />

      <Route element={<RequireSession />}>
      <Route path={paths.welcome} element={<WelcomePage />} />
      <Route path={paths.dashboard} element={<DashboardPage />} />
      <Route path={paths.agenda} element={<AgendaPage />} />
      <Route path={paths.requests} element={<RequestsPage />} />
      <Route path={paths.requestReview} element={<RequestsPage />} />
      <Route path={paths.changes} element={<RequestsPage />} />
      <Route path={paths.changeReview} element={<RequestsPage />} />
      <Route path={paths.changeResult} element={<ChangeResultPage />} />

      <Route path={paths.profile} element={<ProfilePage />} />
      <Route path={paths.profileSetup} element={<ProfileSetupPage />} />
      <Route path={paths.profileOrigins} element={<ProfileOriginsPage />} />
      <Route path={paths.profileLink} element={<ProfileLinkPage />} />
      <Route path={paths.visibility} element={<VisibilityPage />} />
      <Route path={paths.connections} element={<ConnectionsPage />} />
      <Route path={paths.githubInfo} element={<GitHubInfoPage />} />
      </Route>
      <Route path={paths.availability} element={<AvailabilityPage />} />
      {/* El acceso de participante se protege por invitación, no por sesión del dueño. */}
      <Route path={paths.participant} element={<ParticipantPage />} />
      <Route path={paths.publicProfile} element={<ProfilePublicPage />} />
      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}

export default RouterPage;
