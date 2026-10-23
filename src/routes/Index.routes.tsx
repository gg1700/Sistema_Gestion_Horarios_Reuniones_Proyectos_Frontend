import { Routes, Route } from 'react-router';
import MainMenu from '../pages/MainMenu';
import OAuthLoginPage from '../pages/OAuthLoginPage';
import OAuthCallbackPage from '../pages/OAuthCallbackPage';
import PublicProfilePage from '../pages/PublicProfilePage';
import PublicLinkPage from '../pages/PublicLinkPage';

function RouterPage() {
  return (
    <Routes>
      <Route path="/" element={<MainMenu />} />
      <Route path="/login" element={<OAuthLoginPage />} />
      <Route path="/auth/callback" element={<OAuthCallbackPage />} />
      <Route
        path="/perfil/enlace-publico"
        element={<PublicLinkPage />}
      />
      <Route path="/:publicHandle" element={<PublicProfilePage />} />
    </Routes>
  );
}

export default RouterPage;
