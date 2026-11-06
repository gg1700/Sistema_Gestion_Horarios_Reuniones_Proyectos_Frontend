import { Routes, Route, Navigate } from 'react-router';
import { paths } from '../constants/paths';
import { routePaths } from '../constants/routes';
import ProfilePreview from '../pages/ProfilePreview';
import PublicProfilePage from '../pages/PublicProfilePage';
import PublicLinkPage from '../pages/PublicLinkPage';
import LandingPage from '../pages/LandingPage';
import AccessPage from '../pages/AccessPage';
import WelcomePage from '../pages/WelcomePage';
import DashboardPage from '../pages/DashboardPage';
import AgendaPage from '../pages/AgendaPage';
import AvailabilityPage from '../pages/AvailabilityPage';
import ProfilePage from '../pages/ProfilePage';
import ProfileSetupPage from '../pages/ProfileSetupPage';
import VisibilityPage from '../pages/VisibilityPage';
import VisibilityPreviewPage from '../pages/VisibilityPreviewPage';
import ConnectionsPage from '../pages/ConnectionsPage';
import GitHubInfoPage from '../pages/GitHubInfoPage';
import AccessIssuePage from '../pages/AccessIssuePage';
import ProfilePublicPage from '../pages/ProfilePublicPage';
import ProfileLinkPage from '../pages/ProfileLinkPage';
import ProfileOriginsPage from '../pages/ProfileOriginsPage';
import RegisterPage from '../pages/RegisterPage';
import CompleteProfilePage from '../pages/CompleteProfilePage';
import MeetingRequestsPage from '../pages/MeetingRequestsPage';
import CalendarAvailabilitySettingsPage from '../pages/CalendarAvailabilitySettingsPage';

function RouterPage() {
  return (
    <Routes>
      <Route path={paths.home} element={<LandingPage />} />
      <Route path={paths.access} element={<AccessPage />} />
      <Route path={paths.accessIssue} element={<AccessIssuePage />} />
      <Route path={routePaths.register} element={<RegisterPage />} />
      <Route path={routePaths.completeProfile} element={<CompleteProfilePage />} />
      <Route path={paths.availabilitySettings} element={<CalendarAvailabilitySettingsPage />} />

      <Route path={paths.welcome} element={<WelcomePage />} />
      <Route path={paths.dashboard} element={<DashboardPage />} />
      <Route path={paths.agenda} element={<AgendaPage />} />

      <Route path={paths.requests} element={<MeetingRequestsPage />} />
      <Route path={paths.requestReview} element={<Navigate to={paths.requests} replace />} />
      <Route path={paths.changes} element={<Navigate to={paths.requests} replace />} />
      <Route path={paths.changeReview} element={<Navigate to={paths.requests} replace />} />
      <Route path={paths.changeResult} element={<Navigate to={paths.requests} replace />} />

      <Route path={paths.profile} element={<ProfilePage />} />
      <Route path={paths.profileSetup} element={<ProfileSetupPage />} />
      <Route path={paths.profileOrigins} element={<ProfileOriginsPage />} />
      <Route path={paths.profileLink} element={<ProfileLinkPage />} />
      <Route path={paths.visibility} element={<VisibilityPage />} />
      <Route path={paths.connections} element={<ConnectionsPage />} />
      <Route path={paths.githubInfo} element={<GitHubInfoPage />} />
      <Route path={paths.availability} element={<AvailabilityPage />} />

      <Route path={paths.publicProfile} element={<ProfilePublicPage />} />
      <Route path="/visibility-flow-preview" element={<VisibilityPreviewPage />} />

      <Route path="/profile-visibility" element={<Navigate to={paths.visibility} replace />} />
      <Route path="/profile-preview" element={<ProfilePreview />} />

      <Route path="/legacy-public-profile/:publicHandle" element={<PublicProfilePage />} />
      <Route path="/perfil/enlace-publico" element={<PublicLinkPage />} />

      <Route path="*" element={<Navigate to={paths.home} replace />} />
    </Routes>
  );
}

export default RouterPage;