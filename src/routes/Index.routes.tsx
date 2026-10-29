import { Routes, Route, Navigate } from 'react-router';
import { paths } from '../constants/paths';
import { routePaths } from '../constants/routes';
import LandingPage from '../pages/LandingPage';
import AccessPage from '../pages/AccessPage';
import RegisterPage from '../pages/RegisterPage';
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

/*
INTEGRACIÓN DE PROTECCIÓN DE RUTAS — COMENTARIO, NO AUTENTICACIÓN IMPLEMENTADA
... (deja aquí el bloque de comentario tal como estaba, sin cambios)
*/
function RouterPage() {
  return (
    <Routes>
      <Route path={paths.home} element={<LandingPage />} />
      <Route path={paths.access} element={<AccessPage />} />
      <Route path={routePaths.register} element={<RegisterPage />} />
      <Route path={paths.accessIssue} element={<AccessIssuePage />} />

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
      <Route path={paths.availability} element={<AvailabilityPage />} />
      {/* El acceso de participante se protege por invitación, no por sesión del dueño. */}
      <Route path={paths.participant} element={<ParticipantPage />} />
      <Route path={paths.publicProfile} element={<ProfilePublicPage />} />
      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}

export default RouterPage;