import { Routes, Route, Navigate } from "react-router";
import { paths } from "../constants/paths";

import MainMenu from "../pages/MainMenu";
import RepositoriesPreview from "../pages/RepositoriesPreview";
import RepositorySelectionPreview from "../pages/RepositorySelectionPreview";
import ProfileVisibilitySettings from "../pages/ProfileVisibilitySettings";
import ProfilePreview from "../pages/ProfilePreview";
import PublicProfilePage from "../pages/PublicProfilePage";
import PublicLinkPage from "../pages/PublicLinkPage";

import LandingPage from "../pages/LandingPage";
import AccessPage from "../pages/AccessPage";
import WelcomePage from "../pages/WelcomePage";
import DashboardPage from "../pages/DashboardPage";
import AgendaPage from "../pages/AgendaPage";
import AvailabilityPage from "../pages/AvailabilityPage";
import RequestsPage from "../pages/RequestsPage";
import ChangeResultPage from "../pages/ChangeResultPage";
import ParticipantPage from "../pages/ParticipantPage";
import ProfilePage from "../pages/ProfilePage";
import ProfileSetupPage from "../pages/ProfileSetupPage";
import VisibilityPage from "../pages/VisibilityPage";
import ConnectionsPage from "../pages/ConnectionsPage";
import GitHubInfoPage from "../pages/GitHubInfoPage";
import AccessIssuePage from "../pages/AccessIssuePage";
import ProfilePublicPage from "../pages/ProfilePublicPage";
import ProfileLinkPage from "../pages/ProfileLinkPage";
import ProfileOriginsPage from "../pages/ProfileOriginsPage";

/*
INTEGRACIÓN DE PROTECCIÓN DE RUTAS — COMENTARIO, NO AUTENTICACIÓN IMPLEMENTADA
Antes del grupo privado consultar GET /api/v1/session, sin body, con cookie de sesión.
Respuesta JSON 200:
{ "data": { "authenticated": true, "profileCompleted": true, "provider": "google", "profile": { "name": "Mateo", "firstSurname": "Silva", "handle": "mateo-silva", "email": "mateo.silva@correo.com" } } }
Sin sesión:
{ "data": { "authenticated": false, "profileCompleted": false, "provider": null, "profile": null } }
Proteger bienvenida, panel, agenda, solicitudes, perfil y todas sus rutas hijas.
authenticated false -> /acceso con retorno interno permitido; true con profileCompleted
false -> modal de completar cuenta en /acceso. Sesión completa -> permitir la ruta.
Cada endpoint privado valida también sesión/propiedad; el guard visual no lo sustituye.
Landing/acceso/perfil público/disponibilidad admiten visitantes. /reuniones/:token se
protege por la invitación concreta (ParticipantPage.tsx), sin exigir la sesión del dueño.
Estos guards se conectarán al integrar backend; las rutas mock siguen abiertas para revisión.
*/

function RouterPage() {
  return (
    <Routes>
      <Route path={paths.home} element={<LandingPage />} />
      <Route path={paths.access} element={<AccessPage />} />
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

      <Route path="/main-menu-preview" element={<MainMenu />} />
      <Route
        path="/repositories-preview"
        element={<RepositoriesPreview />}
      />
      <Route
        path="/repository-selection-preview"
        element={<RepositorySelectionPreview />}
      />
      <Route
        path="/profile-visibility"
        element={<ProfileVisibilitySettings />}
      />
      <Route
        path="/profile-preview"
        element={<ProfilePreview />}
      />
      <Route
        path="/legacy-public-profile/:publicHandle"
        element={<PublicProfilePage />}
      />
      <Route
        path="/perfil/enlace-publico"
        element={<PublicLinkPage />}
      />

      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}

export default RouterPage;